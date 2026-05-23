import { defineStore } from 'pinia'
import { ref, computed, watch, onUnmounted } from 'vue'
import type { PomodoroMode, PomodoroSettings } from '@/types'
import { getTodayDateString } from '@/utils/time'

const STORAGE_KEY = 'tongzhuo-pomodoro'
const DEFAULT_FOCUS_DURATION = 25 * 60
const DEFAULT_BREAK_DURATION = 5 * 60

interface StoredPomodoro {
  settings: PomodoroSettings
  lastDate: string
  accumulatedFocus: number
}

function loadStoredData(): StoredPomodoro {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load pomodoro settings:', e)
  }
  return {
    settings: {
      focusDuration: DEFAULT_FOCUS_DURATION,
      breakDuration: DEFAULT_BREAK_DURATION
    },
    lastDate: getTodayDateString(),
    accumulatedFocus: 0
  }
}

function saveStoredData(data: StoredPomodoro) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save pomodoro settings:', e)
  }
}

export const usePomodoroStore = defineStore('pomodoro', () => {
  const storedData = loadStoredData()
  
  const focusDuration = ref(storedData.settings.focusDuration)
  const breakDuration = ref(storedData.settings.breakDuration)
  const mode = ref<PomodoroMode>('focus')
  const isRunning = ref(false)
  const startTime = ref<number | undefined>()
  const pausedRemaining = ref<number>(storedData.settings.focusDuration)
  const todayAccumulatedFocus = ref(storedData.lastDate === getTodayDateString() ? storedData.accumulatedFocus : 0)
  const _tick = ref(0)

  const today = ref(getTodayDateString())

  const remaining = computed(() => {
    _tick.value
    if (!isRunning.value) {
      return pausedRemaining.value
    }
    if (!startTime.value) {
      return pausedRemaining.value
    }
    const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
    const total = mode.value === 'focus' ? focusDuration.value : breakDuration.value
    return Math.max(0, total - elapsed)
  })

  const progress = computed(() => {
    const total = mode.value === 'focus' ? focusDuration.value : breakDuration.value
    return ((total - remaining.value) / total) * 100
  })

  const settings = computed((): PomodoroSettings => ({
    focusDuration: focusDuration.value,
    breakDuration: breakDuration.value
  }))

  let intervalId: number | undefined
  let visibilityHandler: (() => void) | undefined

  function handleVisibilityChange() {
    if (!document.hidden && isRunning.value && startTime.value) {
      const total = mode.value === 'focus' ? focusDuration.value : breakDuration.value
      const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
      pausedRemaining.value = Math.max(0, total - elapsed)
      
      if (pausedRemaining.value === 0) {
        completeSession()
      }
    }
  }

  function checkNewDay() {
    const currentDate = getTodayDateString()
    if (currentDate !== today.value) {
      saveAccumulatedFocus()
      todayAccumulatedFocus.value = 0
      today.value = currentDate
    }
  }

  function saveAccumulatedFocus() {
    saveStoredData({
      settings: settings.value,
      lastDate: today.value,
      accumulatedFocus: todayAccumulatedFocus.value
    })
  }

  function start() {
    if (isRunning.value) return
    
    checkNewDay()
    isRunning.value = true
    startTime.value = Date.now() - ((mode.value === 'focus' ? focusDuration.value : breakDuration.value) - pausedRemaining.value) * 1000
    
    intervalId = window.setInterval(() => {
      _tick.value++
      if (remaining.value <= 0) {
        completeSession()
      }
    }, 500)

    visibilityHandler = handleVisibilityChange
    document.addEventListener('visibilitychange', visibilityHandler)
  }

  function pause() {
    if (!isRunning.value) return
    
    isRunning.value = false
    pausedRemaining.value = remaining.value
    startTime.value = undefined
    
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = undefined
    }
    
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = undefined
    }
  }

  function reset() {
    pause()
    mode.value = 'focus'
    pausedRemaining.value = focusDuration.value
  }

  function completeSession() {
    const wasFocusMode = mode.value === 'focus'
    
    if (wasFocusMode) {
      todayAccumulatedFocus.value += Math.floor(focusDuration.value / 60)
      saveAccumulatedFocus()
    }
    
    pause()
    mode.value = wasFocusMode ? 'break' : 'focus'
    pausedRemaining.value = wasFocusMode ? breakDuration.value : focusDuration.value
  }

  function setFocusDuration(minutes: number) {
    focusDuration.value = Math.max(1, Math.min(120, minutes)) * 60
    if (mode.value === 'focus' && !isRunning.value) {
      pausedRemaining.value = focusDuration.value
    }
    saveAccumulatedFocus()
  }

  function setBreakDuration(minutes: number) {
    breakDuration.value = Math.max(1, Math.min(30, minutes)) * 60
    if (mode.value === 'break' && !isRunning.value) {
      pausedRemaining.value = breakDuration.value
    }
    saveAccumulatedFocus()
  }

  function skipBreak() {
    if (mode.value === 'break') {
      pause()
      mode.value = 'focus'
      pausedRemaining.value = focusDuration.value
    }
  }

  function cleanup() {
    if (intervalId) {
      clearInterval(intervalId)
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
    saveAccumulatedFocus()
  }

  watch([focusDuration, breakDuration], () => {
    saveAccumulatedFocus()
  })

  return {
    mode,
    isRunning,
    remaining,
    progress,
    focusDuration,
    breakDuration,
    todayAccumulatedFocus,
    settings,
    start,
    pause,
    reset,
    setFocusDuration,
    setBreakDuration,
    skipBreak,
    cleanup
  }
})
