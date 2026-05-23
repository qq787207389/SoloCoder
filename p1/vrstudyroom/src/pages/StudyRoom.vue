<script setup lang="ts">
import { onUnmounted } from 'vue'
import { BarChart3, BookOpen } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { usePomodoroStore } from '@/stores/pomodoro'
import OnlineCounter from '@/components/OnlineCounter.vue'
import TaskList from '@/components/TaskList.vue'
import PomodoroTimer from '@/components/PomodoroTimer.vue'
import WhiteNoisePanel from '@/components/WhiteNoisePanel.vue'
import ConfettiEffect from '@/components/ConfettiEffect.vue'

const router = useRouter()
const pomodoroStore = usePomodoroStore()

function goToReport() {
  router.push('/report')
}

onUnmounted(() => {
  pomodoroStore.cleanup()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <ConfettiEffect />
    
    <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen class="w-5 h-5 text-primary" />
            </div>
            <h1 class="text-xl font-medium text-foreground">同桌</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <OnlineCounter />
            <button 
              @click="goToReport"
              class="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <BarChart3 class="w-4 h-4" />
              <span class="hidden sm:inline">学习报告</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 order-2 lg:order-1">
          <TaskList />
        </div>
        
        <div class="lg:col-span-5 order-1 lg:order-2">
          <PomodoroTimer @enter-focus="() => {}" />
        </div>
        
        <div class="lg:col-span-3 order-3">
          <WhiteNoisePanel />
        </div>
      </div>
    </main>

    <footer class="mt-auto py-8 text-center text-sm text-muted-foreground">
      <p>专注当下，与你同行</p>
    </footer>
  </div>
</template>
