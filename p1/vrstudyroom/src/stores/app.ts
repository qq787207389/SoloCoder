import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'tongzhuo-online'

function loadLastCount(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return parseInt(stored, 10)
    }
  } catch (e) {
    console.error('Failed to load online count:', e)
  }
  return Math.floor(Math.random() * 30) + 15
}

function saveCount(count: number) {
  try {
    localStorage.setItem(STORAGE_KEY, count.toString())
  } catch (e) {
    console.error('Failed to save online count:', e)
  }
}

export const useAppStore = defineStore('app', () => {
  const onlineCount = ref(loadLastCount())
  const showConfetti = ref(false)

  let fluctuationInterval: number | undefined

  function startFluctuation() {
    fluctuationInterval = window.setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1
      const newCount = Math.max(10, Math.min(100, onlineCount.value + change))
      onlineCount.value = newCount
      saveCount(newCount)
    }, 10000 + Math.random() * 20000)
  }

  function stopFluctuation() {
    if (fluctuationInterval) {
      clearInterval(fluctuationInterval)
      fluctuationInterval = undefined
    }
  }

  function triggerConfetti() {
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 3000)
  }

  onMounted(() => {
    startFluctuation()
  })

  onUnmounted(() => {
    stopFluctuation()
  })

  return {
    onlineCount,
    showConfetti,
    triggerConfetti
  }
})
