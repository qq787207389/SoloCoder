import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ReadingRecord, UserSettings, Achievement } from '@/types'
import { recordDB, settingsDB, achievementDB } from '@/utils/db'

export const useReadingStore = defineStore('reading', () => {
  const records = ref<ReadingRecord[]>([])
  const settings = ref<UserSettings>({
    yearlyGoal: 20,
    speechRate: 1,
    theme: 'light',
    notifications: true
  })
  const achievements = ref<Achievement[]>([])
  const currentStreak = ref(0)

  async function loadAll() {
    await Promise.all([loadRecords(), loadSettings(), loadAchievements()])
    calculateStreak()
  }

  async function loadRecords() {
    records.value = await recordDB.getAll()
  }

  async function loadSettings() {
    const saved = await settingsDB.get()
    if (saved) {
      settings.value = saved
    }
  }

  async function loadAchievements() {
    const saved = await achievementDB.getAll()
    achievements.value = saved.length > 0 ? saved : getDefaultAchievements()
  }

  function getDefaultAchievements(): Achievement[] {
    return [
      { id: '1', name: '初次阅读', description: '完成第一天阅读', icon: '📖', condition: { type: 'books', value: 1 } },
      { id: '2', name: '七日坚持', description: '连续阅读7天', icon: '🔥', condition: { type: 'streak', value: 7 } },
      { id: '3', name: '月读者', description: '完成10本书', icon: '🏆', condition: { type: 'books', value: 10 } },
      { id: '4', name: '笔记达人', description: '创建20篇笔记', icon: '✍️', condition: { type: 'notes', value: 20 } },
      { id: '5', name: '百页突破', description: '累计阅读1000页', icon: '📚', condition: { type: 'pages', value: 1000 } },
      { id: '6', name: '月度冠军', description: '连续阅读30天', icon: '👑', condition: { type: 'streak', value: 30 } }
    ]
  }

  async function addRecord(record: Omit<ReadingRecord, 'id'>) {
    const newRecord: ReadingRecord = {
      ...record,
      id: crypto.randomUUID()
    }
    const recordToSave = JSON.parse(JSON.stringify(newRecord))
    await recordDB.add(recordToSave)
    records.value.push(newRecord)
    calculateStreak()
    await checkAchievements()
    return newRecord
  }

  async function updateSettings(newSettings: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    const settingsToSave = JSON.parse(JSON.stringify(settings.value))
    await settingsDB.update(settingsToSave)
  }

  function calculateStreak() {
    const dates = [...new Set(records.value.map(r => r.date))].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedStr = expectedDate.toISOString().split('T')[0]
      
      if (dates[i] === expectedStr) {
        streak++
      } else {
        break
      }
    }
    currentStreak.value = streak
  }

  async function checkAchievements() {
    const totalBooks = records.value.length
    const totalPages = records.value.reduce((sum, r) => sum + r.pagesRead, 0)
    const stats = {
      streak: currentStreak.value,
      books: totalBooks,
      pages: totalPages,
      notes: 0
    }

    for (const achievement of achievements.value) {
      if (!achievement.unlockedAt) {
        const { type, value } = achievement.condition
        if (stats[type as keyof typeof stats] >= value) {
          achievement.unlockedAt = Date.now()
          const achievementToSave = JSON.parse(JSON.stringify(achievement))
          await achievementDB.update(achievementToSave)
        }
      }
    }
  }

  const yearlyProgress = computed(() => {
    const finishedBooks = records.value.filter(r => {
      const year = new Date().getFullYear()
      return r.date.startsWith(year.toString())
    }).length
    return Math.min(100, (finishedBooks / settings.value.yearlyGoal) * 100)
  })

  const heatmapData = computed(() => {
    const data: Record<string, number> = {}
    records.value.forEach(record => {
      data[record.date] = (data[record.date] || 0) + record.duration
    })
    return data
  })

  function getRecordsByMonth(year: number, month: number) {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    return records.value.filter(r => r.date.startsWith(monthStr))
  }

  function getTotalDurationByDate(date: string) {
    return records.value
      .filter(r => r.date === date)
      .reduce((sum, r) => sum + r.duration, 0)
  }

  return {
    records,
    settings,
    achievements,
    currentStreak,
    yearlyProgress,
    heatmapData,
    loadAll,
    addRecord,
    updateSettings,
    getRecordsByMonth,
    getTotalDurationByDate
  }
})
