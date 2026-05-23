<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Play, Pause, Minimize2, SkipForward, Volume2, VolumeX } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { usePomodoroStore } from '@/stores/pomodoro'
import { useTaskStore } from '@/stores/task'
import { useNoiseStore } from '@/stores/noise'
import { formatTime } from '@/utils/time'

const router = useRouter()
const pomodoroStore = usePomodoroStore()
const taskStore = useTaskStore()
const noiseStore = useNoiseStore()

const displayTime = computed(() => formatTime(pomodoroStore.remaining))

const currentTask = computed(() => {
  const incomplete = taskStore.todayTasks.find(t => !t.completed)
  return incomplete?.title || '专注学习'
})

const progress = computed(() => {
  const total = pomodoroStore.mode === 'focus' ? pomodoroStore.focusDuration : pomodoroStore.breakDuration
  return ((total - pomodoroStore.remaining) / total) * 100
})

const isFullscreen = ref(false)

function enterFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    exitFullscreen()
  } else {
    enterFullscreen()
  }
}

function exitFocusMode() {
  if (document.fullscreenElement) {
    exitFullscreen()
  }
  router.push('/')
}

function toggleTimer() {
  if (pomodoroStore.isRunning) {
    pomodoroStore.pause()
    noiseStore.pauseAllNoises()
  } else {
    pomodoroStore.start()
    noiseStore.resumeAllNoises()
  }
}

function skipBreak() {
  pomodoroStore.skipBreak()
}

onMounted(() => {
  enterFullscreen()
  document.body.classList.add('focus-mode')
})

onUnmounted(() => {
  document.body.classList.remove('focus-mode')
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-[#121212] text-[#E5E5E5] flex flex-col items-center justify-center z-50">
    <div class="absolute top-8 right-8 flex items-center gap-4">
      <button
        v-if="noiseStore.noises.some(n => n.active)"
        @click="noiseStore.stopAllNoises()"
        class="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Volume2 class="w-5 h-5" />
      </button>
      <button
        @click="exitFocusMode"
        class="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Minimize2 class="w-5 h-5" />
        <span>退出</span>
      </button>
    </div>

    <div class="text-center">
      <div 
        class="text-sm uppercase tracking-widest mb-6"
        :class="pomodoroStore.mode === 'focus' ? 'text-[#7D9D8D]' : 'text-[#E8A598]'"
      >
        {{ pomodoroStore.mode === 'focus' ? 'FOCUS' : 'BREAK' }}
      </div>

      <div class="relative mb-8">
        <div class="text-[clamp(5rem,15vw,12rem)] font-light tracking-tighter">
          {{ displayTime }}
        </div>
        
        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="pomodoroStore.mode === 'focus' ? 'bg-[#7D9D8D]' : 'bg-[#E8A598]'"
            :style="{ width: progress + '%' }"
          />
        </div>
      </div>

      <p class="text-lg text-white/60 mb-12 max-w-md mx-auto px-4">
        {{ currentTask }}
      </p>

      <div class="flex items-center justify-center gap-6">
        <button
          v-if="pomodoroStore.mode === 'break'"
          @click="skipBreak"
          class="flex items-center gap-2 px-6 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <SkipForward class="w-5 h-5" />
          跳过休息
        </button>
        
        <button
          @click="toggleTimer"
          class="flex items-center gap-3 px-10 py-4 rounded-full text-lg font-medium transition-all hover:scale-105"
          :class="pomodoroStore.mode === 'focus' 
            ? 'bg-[#7D9D8D] text-white' 
            : 'bg-[#E8A598] text-white'"
        >
          <Play v-if="!pomodoroStore.isRunning" class="w-6 h-6 ml-1" />
          <Pause v-else class="w-6 h-6" />
          {{ pomodoroStore.isRunning ? '暂停' : '开始' }}
        </button>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30 text-sm">
      今日已专注 {{ pomodoroStore.todayAccumulatedFocus }} 分钟
    </div>
  </div>
</template>
