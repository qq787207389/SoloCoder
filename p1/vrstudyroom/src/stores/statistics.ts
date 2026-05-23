import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { StudyRecord } from '@/types'
import { getTodayDateString, getWeekDates } from '@/utils/time'

const STORAGE_KEY = 'tongzhuo-records'

function loadRecords(): StudyRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load records:', e)
  }
  return []
}

function saveRecords(records: StudyRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    console.error('Failed to save records:', e)
  }
}

export const useStatisticsStore = defineStore('statistics', () => {
  const records = ref<StudyRecord[]>(loadRecords())

  const todayRecord = computed(() => {
    const today = getTodayDateString()
    return records.value.find(r => r.date === today)
  })

  const weekRecords = computed(() => {
    const weekDates = getWeekDates()
    return weekDates.map(date => {
      const record = records.value.find(r => r.date === date)
      return record || { date, focusMinutes: 0, completedTasks: 0 }
    })
  })

  const todayFocusMinutes = computed(() => todayRecord.value?.focusMinutes || 0)
  const todayCompletedTasks = computed(() => todayRecord.value?.completedTasks || 0)

  const weekTotalFocus = computed(() => 
    weekRecords.value.reduce((sum, r) => sum + r.focusMinutes, 0)
  )

  const lastWeekTotalFocus = computed(() => {
    const today = new Date()
    let total = 0
    for (let i = 7; i < 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      const record = records.value.find(r => r.date === dateStr)
      total += record?.focusMinutes || 0
    }
    return total
  })

  const weekComparison = computed(() => {
    if (lastWeekTotalFocus.value === 0) return 100
    const change = ((weekTotalFocus.value - lastWeekTotalFocus.value) / lastWeekTotalFocus.value) * 100
    return Math.round(change)
  })

  function updateTodayFocus(minutes: number) {
    const today = getTodayDateString()
    const existingIndex = records.value.findIndex(r => r.date === today)
    
    if (existingIndex >= 0) {
      records.value[existingIndex].focusMinutes = minutes
    } else {
      records.value.push({
        date: today,
        focusMinutes: minutes,
        completedTasks: 0
      })
    }
    saveRecords(records.value)
  }

  function incrementCompletedTasks() {
    const today = getTodayDateString()
    const existingIndex = records.value.findIndex(r => r.date === today)
    
    if (existingIndex >= 0) {
      records.value[existingIndex].completedTasks++
    } else {
      records.value.push({
        date: today,
        focusMinutes: 0,
        completedTasks: 1
      })
    }
    saveRecords(records.value)
  }

  function getStreakDays(): number {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      const record = records.value.find(r => r.date === dateStr)
      
      if (record && (record.focusMinutes > 0 || record.completedTasks > 0)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  return {
    records,
    todayRecord,
    weekRecords,
    todayFocusMinutes,
    todayCompletedTasks,
    weekTotalFocus,
    weekComparison,
    updateTodayFocus,
    incrementCompletedTasks,
    getStreakDays
  }
})
