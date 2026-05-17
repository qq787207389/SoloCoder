<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReadingStore } from '@/stores/reading'

const readingStore = useReadingStore()

const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)
const readingText = ref('')
const isReading = ref(false)
const speechRate = ref(1)
const utterance = ref<SpeechSynthesisUtterance | null>(null)

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const days: { date: string; day: number; isCurrentMonth: boolean; duration: number }[] = []
  const firstDay = new Date(year.value, month.value, 1)
  const lastDay = new Date(year.value, month.value + 1, 0)
  const startPadding = firstDay.getDay()

  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year.value, month.value, -i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: false,
      duration: 0
    })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year.value, month.value, i)
    const dateStr = date.toISOString().split('T')[0]
    const duration = readingStore.records
      .filter(r => r.date === dateStr)
      .reduce((sum, r) => sum + r.duration, 0)
    days.push({
      date: dateStr,
      day: i,
      isCurrentMonth: true,
      duration
    })
  }

  const endPadding = 42 - days.length
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(year.value, month.value + 1, i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: i,
      isCurrentMonth: false,
      duration: 0
    })
  }

  return days
})

const heatmapColors = computed(() => {
  const durations = calendarDays.value.filter(d => d.isCurrentMonth).map(d => d.duration)
  const maxDuration = Math.max(...durations, 1)
  return (duration: number) => {
    if (duration === 0) return 'bg-gray-100'
    const ratio = duration / maxDuration
    if (ratio < 0.25) return 'bg-green-200'
    if (ratio < 0.5) return 'bg-green-400'
    if (ratio < 0.75) return 'bg-green-600'
    return 'bg-green-700'
  }
})

const selectedDateRecords = computed(() => {
  if (!selectedDate.value) return []
  return readingStore.records.filter(r => r.date === selectedDate.value)
})

const totalMinutes = computed(() => {
  return selectedDateRecords.value.reduce((sum, r) => sum + r.duration, 0)
})

function prevMonth() {
  currentDate.value = new Date(year.value, month.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(year.value, month.value + 1, 1)
}

function selectDate(date: string) {
  selectedDate.value = date
}

function startReading() {
  if (!('speechSynthesis' in window)) {
    alert('您的浏览器不支持语音朗读功能')
    return
  }
  if (readingText.value.trim()) {
    utterance.value = new SpeechSynthesisUtterance(readingText.value)
    utterance.value.rate = speechRate.value
    utterance.value.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance.value)
    isReading.value = true
  }
}

function pauseReading() {
  window.speechSynthesis.pause()
  isReading.value = false
}

function resumeReading() {
  window.speechSynthesis.resume()
  isReading.value = true
}

function stopReading() {
  window.speechSynthesis.cancel()
  isReading.value = false
}

async function addRecord(duration: number) {
  await readingStore.addRecord({
    id: '',
    date: selectedDate.value || new Date().toISOString().split('T')[0],
    duration,
    pagesRead: 0
  })
}

onMounted(async () => {
  await readingStore.loadSettings()
  speechRate.value = readingStore.settings.speechRate
})
</script>

<template>
  <div class="calendar-view">
    <div class="mb-6">
      <h1>📅 阅读日历</h1>
      <p class="text-muted mt-1">连续阅读 {{ readingStore.currentStreak }} 天 🔥</p>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <button class="btn btn-outline" @click="prevMonth">←</button>
          <h2 class="text-xl font-semibold">{{ year }}年 {{ monthNames[month] }}</h2>
          <button class="btn btn-outline" @click="nextMonth">→</button>
        </div>

        <div class="calendar-grid">
          <div v-for="day in weekDays" :key="day" class="calendar-header text-center text-sm text-muted font-medium">
            {{ day }}
          </div>
          <div 
            v-for="day in calendarDays" :key="day.date"
            class="calendar-day"
            :class="[
              day.isCurrentMonth ? 'current-month' : 'other-month',
              heatmapColors(day.duration),
              { selected: selectedDate === day.date }
            ]"
            @click="selectDate(day.date)"
          >
            <span class="day-number">{{ day.day }}</span>
            <span v-if="day.duration > 0" class="day-duration">{{ day.duration }}分钟</span>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-4 text-sm">
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded bg-gray-100"></span> 0分钟
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded bg-green-200"></span> 短
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded bg-green-400"></span> 中
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded bg-green-700"></span> 长
          </span>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-4">🎯 年度目标进度</h3>
        <div class="progress-ring-container mb-4">
          <svg class="progress-ring" width="150" height="150">
            <circle cx="75" cy="75" r="60" stroke="#e2e8f0" stroke-width="12" fill="none" />
            <circle 
              cx="75" cy="75" r="60" 
              stroke="#3b82f6" 
              stroke-width="12" 
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 60"
              :stroke-dashoffset="2 * Math.PI * 60 * (1 - readingStore.yearlyProgress / 100)"
            />
            <text x="75" y="80" text-anchor="middle" font-size="24" font-weight="bold">
              {{ Math.round(readingStore.yearlyProgress) }}%
            </text>
          </svg>
        </div>

        <div v-if="selectedDate" class="date-details mt-4 pt-4 border-t">
          <h4 class="font-medium mb-2">{{ selectedDate }} 的阅读记录</h4>
          <div v-if="selectedDateRecords.length">
            <div v-for="record in selectedDateRecords" :key="record.id" class="mb-2 p-2 bg-gray-50 rounded">
              <span class="text-sm">阅读了 {{ record.duration }} 分钟</span>
            </div>
            <p class="text-sm text-muted mt-2">总计: {{ totalMinutes }} 分钟</p>
          </div>
          <p v-else class="text-sm text-muted">当天没有阅读记录</p>
          
          <div class="mt-4">
            <button class="btn btn-primary w-full" @click="addRecord(30)">+ 记录30分钟阅读</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-6">
      <h3 class="mb-4">🔊 文本朗读</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <textarea 
            v-model="readingText"
            class="input textarea"
            rows="6"
            placeholder="输入要朗读的文本..."
            style="height: 100%"
          ></textarea>
        </div>
        <div>
          <div class="mb-4">
            <label class="text-sm font-medium block mb-2">语速: {{ speechRate.toFixed(1) }}x</label>
            <input 
              type="range" 
              v-model="speechRate"
              min="0.5" 
              max="2" 
              step="0.1"
              class="w-full"
            />
          </div>
          <div class="flex gap-2">
            <button v-if="!isReading" class="btn btn-primary" @click="startReading">开始朗读</button>
            <button v-else class="btn btn-warning" @click="pauseReading">暂停</button>
            <button v-if="!isReading && readingText" class="btn btn-outline" @click="resumeReading">继续</button>
            <button class="btn btn-outline" @click="stopReading">停止</button>
          </div>
          <p class="text-sm text-muted mt-4">
            💡 提示：可以复制书籍简介或笔记内容到这里进行朗读，解放您的双眼！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-header {
  padding: 8px;
}

.calendar-day {
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.selected {
  ring: 2px;
  ring-color: #3b82f6;
}

.day-number {
  font-weight: 500;
  font-size: 14px;
}

.day-duration {
  font-size: 10px;
  color: inherit;
  opacity: 0.8;
}

.progress-ring-container {
  display: flex;
  justify-content: center;
}

.progress-ring circle:nth-child(2) {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.5s ease;
}

.bg-gray-100 { background-color: #f3f4f6; }
.bg-green-200 { background-color: #a7f3d0; }
.bg-green-400 { background-color: #4ade80; }
.bg-green-600 { background-color: #16a34a; }
.bg-green-700 { background-color: #15803d; }
</style>
