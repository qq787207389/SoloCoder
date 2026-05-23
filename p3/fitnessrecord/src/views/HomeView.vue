<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Play, Dumbbell, Calendar, Flame, ChevronRight } from 'lucide-vue-next';
import CircularProgress from '@/components/ui/CircularProgress.vue';
import { useSettingsStore } from '@/stores/settings';
import { useHistoryStore } from '@/stores/history';
import { usePlansStore } from '@/stores/plans';
import { formatDate } from '@/utils/storage';

const router = useRouter();
const settingsStore = useSettingsStore();
const historyStore = useHistoryStore();
const plansStore = usePlansStore();

const weeklyProgress = computed(() => {
  const goal = settingsStore.settings.weeklyGoal;
  const completed = historyStore.thisWeekWorkoutDays;
  return Math.min(100, Math.round((completed / goal) * 100));
});

const quickActions = [
  {
    id: 'quick-workout',
    icon: Play,
    title: '快速开始',
    description: '立即开始自由训练',
    color: 'from-emerald-500 to-teal-600',
    action: () => router.push('/workout?mode=free')
  },
  {
    id: 'select-plan',
    icon: Calendar,
    title: '选择计划',
    description: '从训练计划开始',
    color: 'from-blue-500 to-cyan-600',
    action: () => router.push('/plans')
  }
];

const recentSessions = computed(() => historyStore.getRecentSessions(3));

const totalWorkouts = computed(() => historyStore.sessions.length);
</script>

<template>
  <div class="min-h-screen bg-gray-950 pb-20">
    <div class="px-4 pt-8 pb-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">你好，健身者 👋</h1>
          <p class="text-gray-400 text-sm mt-1">今天也要努力训练！</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <Flame class="w-6 h-6 text-white" />
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">本周目标</h2>
          <span class="text-sm text-gray-400">
            {{ historyStore.thisWeekWorkoutDays }}/{{ settingsStore.settings.weeklyGoal }} 天
          </span>
        </div>
        <div class="flex items-center justify-center">
          <CircularProgress :progress="weeklyProgress" />
        </div>
        <p class="text-center text-gray-400 text-sm mt-4">
          {{ weeklyProgress >= 100 ? '🎉 太棒了！本周目标已完成' : '继续加油，完成本周目标！' }}
        </p>
      </div>

      <h2 class="text-lg font-semibold text-white mb-4">快捷操作</h2>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="action.action"
          class="relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          :class="`bg-gradient-to-br ${action.color}`"
        >
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <component :is="action.icon" class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-white font-semibold text-base">{{ action.title }}</h3>
          <p class="text-white/70 text-xs mt-1">{{ action.description }}</p>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p class="text-2xl font-bold text-emerald-400">{{ totalWorkouts }}</p>
          <p class="text-gray-400 text-xs mt-1">总训练次数</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p class="text-2xl font-bold text-blue-400">{{ plansStore.allPlans.length }}</p>
          <p class="text-gray-400 text-xs mt-1">训练计划</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <p class="text-2xl font-bold text-orange-400">{{ historyStore.thisWeekWorkoutDays }}</p>
          <p class="text-gray-400 text-xs mt-1">本周训练</p>
        </div>
      </div>
    </div>

    <div v-if="recentSessions.length > 0" class="px-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">最近训练</h2>
        <button
          @click="router.push('/stats')"
          class="text-emerald-400 text-sm flex items-center gap-1"
        >
          查看全部 <ChevronRight class="w-4 h-4" />
        </button>
      </div>
      <div class="space-y-3">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="bg-gray-900 rounded-xl p-4 border border-gray-800"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Dumbbell class="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 class="text-white font-medium">
                  {{ session.planName || '自由训练' }}
                </h3>
                <p class="text-gray-400 text-xs">
                  {{ formatDate(session.date) }} · {{ session.sets.length }} 组
                </p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
