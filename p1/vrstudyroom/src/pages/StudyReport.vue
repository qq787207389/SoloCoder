<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, Clock, CheckCircle, TrendingUp, Calendar, Flame } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useStatisticsStore } from '@/stores/statistics'
import { formatMinutes } from '@/utils/time'
import WeeklyChart from '@/components/WeeklyChart.vue'

const router = useRouter()
const statisticsStore = useStatisticsStore()

const streakDays = ref(statisticsStore.getStreakDays())

const comparisonLabel = computed(() => {
  if (statisticsStore.weekComparison > 0) {
    return `比上周多 ${statisticsStore.weekComparison}%`
  } else if (statisticsStore.weekComparison < 0) {
    return `比上周少 ${Math.abs(statisticsStore.weekComparison)}%`
  }
  return '与上周持平'
})

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button 
            @click="goBack"
            class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 class="text-lg font-medium text-foreground ml-4">学习报告</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <Clock class="w-5 h-5 text-primary" />
            <span class="text-sm text-muted-foreground">今日专注</span>
          </div>
          <p class="text-2xl font-medium text-foreground">
            {{ formatMinutes(statisticsStore.todayFocusMinutes) }}
          </p>
        </div>

        <div class="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <CheckCircle class="w-5 h-5 text-primary" />
            <span class="text-sm text-muted-foreground">完成任务</span>
          </div>
          <p class="text-2xl font-medium text-foreground">
            {{ statisticsStore.todayCompletedTasks }} 个
          </p>
        </div>

        <div class="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <Calendar class="w-5 h-5 text-secondary" />
            <span class="text-sm text-muted-foreground">本周累计</span>
          </div>
          <p class="text-2xl font-medium text-foreground">
            {{ formatMinutes(statisticsStore.weekTotalFocus) }}
          </p>
        </div>

        <div class="bg-card rounded-xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <Flame class="w-5 h-5 text-secondary" />
            <span class="text-sm text-muted-foreground">连续学习</span>
          </div>
          <p class="text-2xl font-medium text-foreground">
            {{ streakDays }} 天
          </p>
        </div>
      </div>

      <div class="bg-card rounded-xl p-6 shadow-sm border border-border mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-foreground">近一周专注趋势</h2>
          <div 
            class="flex items-center gap-1 text-sm px-3 py-1 rounded-full"
            :class="statisticsStore.weekComparison >= 0 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary/10 text-secondary'"
          >
            <TrendingUp class="w-4 h-4" />
            <span>{{ comparisonLabel }}</span>
          </div>
        </div>
        <WeeklyChart />
      </div>

      <div class="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 class="text-lg font-medium text-foreground mb-4">每日明细</h2>
        <div class="space-y-3">
          <div 
            v-for="record in statisticsStore.weekRecords.slice().reverse()" 
            :key="record.date"
            class="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span class="text-sm text-muted-foreground">
                  {{ new Date(record.date).getDate() }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">
                  {{ record.date }}
                </p>
                <p class="text-xs text-muted-foreground">
                  完成 {{ record.completedTasks }} 个任务
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-foreground">
                {{ record.focusMinutes }} 分钟
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center text-sm text-muted-foreground">
        <p>坚持每天学习，你会看到进步的！</p>
      </div>
    </main>
  </div>
</template>
