<template>
  <div 
    class="fixed inset-0 bg-gray-900 text-white z-50 touch-swipe"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">加载中...</p>
      </div>
    </div>

    <div v-else-if="recipe" class="h-full flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-800">
        <button 
          @click="$router.back()"
          class="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
        <div class="text-center">
          <h1 class="font-serif text-lg font-bold truncate max-w-xs">{{ recipe.title }}</h1>
          <p class="text-sm text-gray-400">步骤 {{ currentStepIndex + 1 }} / {{ recipe.steps.length }}</p>
        </div>
        <div class="w-10"></div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar">
        <div class="max-w-2xl w-full text-center">
          <div class="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
            {{ currentStepIndex + 1 }}
          </div>

          <div 
            v-if="currentStep.image"
            class="mb-8 rounded-2xl overflow-hidden max-w-md mx-auto"
          >
            <img 
              :src="currentStep.image" 
              :alt="`步骤${currentStepIndex + 1}`"
              class="w-full object-cover"
            />
          </div>

          <p class="text-2xl md:text-3xl leading-relaxed mb-8">
            {{ currentStep.description }}
          </p>

          <div v-if="currentStep.duration" class="inline-flex items-center gap-3 bg-gray-800 rounded-full px-6 py-3">
            <Clock class="w-6 h-6 text-primary-400" />
            <span class="text-lg">约 {{ currentStep.duration }} 分钟</span>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-800">
        <div class="h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div 
            class="h-full bg-primary-500 transition-all duration-300"
            :style="{ width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <button
            @click="prevStep"
            :disabled="currentStepIndex === 0"
            class="flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
            :class="currentStepIndex === 0 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'hover:bg-gray-800'"
          >
            <ChevronLeft class="w-6 h-6" />
            <span>上一步</span>
          </button>

          <button
            @click="toggleTimer"
            class="flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
            :class="timerRunning ? 'bg-primary-500' : 'bg-gray-800 hover:bg-gray-700'"
          >
            <Timer class="w-5 h-5" />
            <span>{{ formatTime(timerSeconds) }}</span>
          </button>

          <button
            @click="nextStep"
            :disabled="currentStepIndex === recipe.steps.length - 1"
            class="flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
            :class="currentStepIndex === recipe.steps.length - 1 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'hover:bg-gray-800'"
          >
            <span>下一步</span>
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTimerModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
      <div class="bg-gray-800 rounded-3xl p-6 w-full max-w-sm text-center animate-slide-up">
        <h3 class="text-xl font-bold mb-6">设置计时器</h3>
        
        <div class="flex items-center justify-center gap-4 mb-8">
          <button 
            @click="timerInput = Math.max(1, timerInput - 1)"
            class="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-2xl"
          >
            -
          </button>
          <div class="text-5xl font-bold">
            <input 
              v-model.number="timerInput"
              type="number"
              min="1"
              max="60"
              class="w-24 bg-transparent text-center focus:outline-none"
            />
          </div>
          <button 
            @click="timerInput = Math.min(60, timerInput + 1)"
            class="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
        <p class="text-gray-400 mb-6">分钟</p>

        <div class="flex gap-4">
          <button 
            @click="showTimerModal = false"
            class="flex-1 py-3 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            取消
          </button>
          <button 
            @click="startCustomTimer"
            class="flex-1 py-3 rounded-full bg-primary-500 hover:bg-primary-600"
          >
            开始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { X, ChevronLeft, ChevronRight, Clock, Timer } from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipe'
import type { Recipe, CookingStep } from '@/types'

const route = useRoute()
const recipeStore = useRecipeStore()

const loading = ref(true)
const recipe = ref<Recipe | null>(null)
const currentStepIndex = ref(0)

const touchStartX = ref(0)
const touchEndX = ref(0)

const timerSeconds = ref(0)
const timerRunning = ref(false)
const timerInput = ref(5)
const showTimerModal = ref(false)
let timerInterval: number | null = null

const currentStep = computed<CookingStep>(() => {
  return recipe.value?.steps[currentStepIndex.value] || { id: '', order: 0, description: '' }
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

function nextStep() {
  if (recipe.value && currentStepIndex.value < recipe.value.steps.length - 1) {
    currentStepIndex.value++
  }
}

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.changedTouches[0].screenX
}

function handleTouchEnd(e: TouchEvent) {
  touchEndX.value = e.changedTouches[0].screenX
  const diff = touchStartX.value - touchEndX.value
  
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextStep()
    } else {
      prevStep()
    }
  }
}

function toggleTimer() {
  if (timerRunning.value) {
    stopTimer()
  } else if (timerSeconds.value > 0) {
    startTimer()
  } else {
    showTimerModal.value = true
  }
}

function startTimer() {
  timerRunning.value = true
  timerInterval = window.setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      stopTimer()
      playAlarm()
    }
  }, 1000)
}

function stopTimer() {
  timerRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function startCustomTimer() {
  timerSeconds.value = timerInput.value * 60
  showTimerModal.value = false
  startTimer()
}

function playAlarm() {
  try {
    const audio = new AudioContext()
    const oscillator = audio.createOscillator()
    const gainNode = audio.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audio.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3
    
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audio.close()
    }, 500)
  } catch (e) {
    console.log('Alarm not supported')
  }
}

onMounted(async () => {
  const id = route.params.id as string
  const data = await recipeStore.fetchRecipeById(id)
  if (data) {
    recipe.value = data
  }
  loading.value = false
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
