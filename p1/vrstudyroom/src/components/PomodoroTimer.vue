<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Play, Pause, RotateCcw, Settings, Maximize2, SkipForward } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { usePomodoroStore } from '@/stores/pomodoro'
import { formatTime } from '@/utils/time'
import { useStatisticsStore } from '@/stores/statistics'

const emit = defineEmits<{
  (e: 'enterFocus'): void
}>()

const router = useRouter()
const pomodoroStore = usePomodoroStore()
const statisticsStore = useStatisticsStore()

const showSettings = ref(false)
const localFocusMinutes = ref(25)
const localBreakMinutes = ref(5)

const displayTime = computed(() => formatTime(pomodoroStore.remaining))

const modeLabel = computed(() => 
  pomodoroStore.mode === 'focus' ? '专注时间' : '休息时间'
)

const circumference = 2 * Math.PI * 100
const strokeDashoffset = computed(() => {
  const progress = pomodoroStore.progress / 100
  return circumference * (1 - progress)
})

function openSettings() {
  localFocusMinutes.value = Math.round(pomodoroStore.focusDuration / 60)
  localBreakMinutes.value = Math.round(pomodoroStore.breakDuration / 60)
  showSettings.value = true
}

function saveSettings() {
  pomodoroStore.setFocusDuration(localFocusMinutes.value)
  pomodoroStore.setBreakDuration(localBreakMinutes.value)
  showSettings.value = false
}

function toggleTimer() {
  if (pomodoroStore.isRunning) {
    pomodoroStore.pause()
  } else {
    pomodoroStore.start()
  }
}

function resetTimer() {
  pomodoroStore.reset()
}

function enterFocusMode() {
  emit('enterFocus')
  router.push('/focus')
}

function skipBreak() {
  pomodoroStore.skipBreak()
}

watch(() => pomodoroStore.todayAccumulatedFocus, (newVal) => {
  statisticsStore.updateTodayFocus(newVal)
}, { immediate: true })
</script>

<template>
  <div class="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col items-center">
    <div class="text-center mb-4">
      <span 
        class="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
        :class="pomodoroStore.mode === 'focus' 
          ? 'bg-primary/10 text-primary' 
          : 'bg-secondary/10 text-secondary'"
      >
        {{ modeLabel }}
      </span>
    </div>

    <div class="relative w-56 h-56 mb-6">
      <svg class="w-full h-full transform -rotate-90">
        <circle
          cx="112"
          cy="112"
          r="100"
          fill="none"
          stroke="#E5E0D8"
          stroke-width="8"
        />
        <circle
          cx="112"
          cy="112"
          r="100"
          fill="none"
          :stroke="pomodoroStore.mode === 'focus' ? '#7D9D8D' : '#E8A598'"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-500"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-5xl font-light text-foreground tracking-wider">
          {{ displayTime }}
        </span>
        <span class="text-sm text-muted-foreground mt-2">
          今日专注 {{ pomodoroStore.todayAccumulatedFocus }} 分钟
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-4">
      <button
        @click="resetTimer"
        class="p-3 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title="重置"
      >
        <RotateCcw class="w-5 h-5" />
      </button>
      
      <button
        @click="toggleTimer"
        class="p-4 rounded-full text-white transition-all hover:scale-105 shadow-lg"
        :class="pomodoroStore.mode === 'focus' ? 'bg-primary' : 'bg-secondary'"
      >
        <Play v-if="!pomodoroStore.isRunning" class="w-7 h-7 ml-1" />
        <Pause v-else class="w-7 h-7" />
      </button>
      
      <button
        @click="openSettings"
        class="p-3 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title="设置"
      >
        <Settings class="w-5 h-5" />
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-if="pomodoroStore.mode === 'break'"
        @click="skipBreak"
        class="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <SkipForward class="w-4 h-4" />
        跳过休息
      </button>
      
      <button
        v-if="pomodoroStore.mode === 'focus'"
        @click="enterFocusMode"
        class="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <Maximize2 class="w-4 h-4" />
        专注模式
      </button>
    </div>

    <div 
      v-if="showSettings" 
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      @click.self="showSettings = false"
    >
      <div class="bg-card rounded-xl p-6 w-80 shadow-xl animate-scale-in">
        <h3 class="text-lg font-medium text-foreground mb-4">番茄钟设置</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-muted-foreground mb-2">
              专注时长（分钟）
            </label>
            <input 
              v-model.number="localFocusMinutes"
              type="range" 
              min="5" 
              max="120" 
              step="5"
              class="w-full custom-range"
            />
            <div class="text-center text-sm text-foreground mt-1">
              {{ localFocusMinutes }} 分钟
            </div>
          </div>
          
          <div>
            <label class="block text-sm text-muted-foreground mb-2">
              休息时长（分钟）
            </label>
            <input 
              v-model.number="localBreakMinutes"
              type="range" 
              min="1" 
              max="30" 
              step="1"
              class="w-full custom-range"
            />
            <div class="text-center text-sm text-foreground mt-1">
              {{ localBreakMinutes }} 分钟
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="showSettings = false"
            class="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            取消
          </button>
          <button
            @click="saveSettings"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
