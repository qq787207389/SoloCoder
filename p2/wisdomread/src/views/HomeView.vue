<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookStore } from '@/stores/book'
import { useNoteStore } from '@/stores/note'
import { useReadingStore } from '@/stores/reading'
import { generateReadingSuggestions } from '@/utils/ai'

const bookStore = useBookStore()
const noteStore = useNoteStore()
const readingStore = useReadingStore()

const topic = ref('')
const suggestions = ref<string[]>([])
const suggestedBooks = ref<string[]>([])
const loadingSuggestions = ref(false)

const stats = computed(() => ({
  totalBooks: bookStore.books.length,
  readingBooks: bookStore.reading.length,
  finishedBooks: bookStore.finished.length,
  totalNotes: noteStore.notes.length,
  streak: readingStore.currentStreak,
  yearlyProgress: readingStore.yearlyProgress
}))

const recommendations = computed(() => {
  return bookStore.getPersonalizedRecommendations(4)
})

async function getSuggestions() {
  if (!topic.value.trim()) return
  loadingSuggestions.value = true
  try {
    const result = await generateReadingSuggestions(topic.value, bookStore.books)
    suggestions.value = result.suggestions
    suggestedBooks.value = result.recommendedBooks.map(b => b.title)
  } finally {
    loadingSuggestions.value = false
  }
}

const circumference = 2 * Math.PI * 40
const strokeDashoffset = circumference - (stats.value.yearlyProgress / 100) * circumference
</script>

<template>
  <div class="home-view">
    <div class="page-header mb-6">
      <h1>欢迎回来 📚</h1>
      <p>继续您的阅读之旅</p>
    </div>

    <div class="stats-grid grid grid-cols-2 mb-6">
      <div class="card">
        <div class="flex items-center gap-4">
          <svg class="progress-ring" width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="#e2e8f0" stroke-width="8" fill="none" />
            <circle 
              class="progress-ring-circle"
              cx="50" cy="50" r="40" 
              stroke="#3b82f6" 
              stroke-width="8" 
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
            />
            <text x="50" y="55" text-anchor="middle" font-size="18" font-weight="bold">
              {{ Math.round(stats.yearlyProgress) }}%
            </text>
          </svg>
          <div>
            <h3>年度目标</h3>
            <p class="text-muted">{{ readingStore.settings.yearlyGoal }} 本书</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-primary">🔥 {{ stats.streak }}</div>
            <p class="text-muted">连续阅读天数</p>
          </div>
          <div class="stat-item">
            <div class="text-2xl">{{ stats.totalBooks }}</div>
            <p class="text-muted text-sm">总书籍</p>
          </div>
          <div class="stat-item">
            <div class="text-2xl">{{ stats.totalNotes }}</div>
            <p class="text-muted text-sm">笔记数</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="card">
        <h3 class="mb-4">💡 AI 阅读建议</h3>
        <div class="flex gap-2 mb-4">
          <input 
            v-model="topic" 
            type="text" 
            class="input" 
            placeholder="输入感兴趣的主题，如：人工智能、历史..."
            @keyup.enter="getSuggestions"
          />
          <button class="btn btn-primary" @click="getSuggestions" :disabled="loadingSuggestions">
            {{ loadingSuggestions ? '...' : '获取' }}
          </button>
        </div>
        <div v-if="suggestions.length" class="suggestions">
          <p v-for="(s, i) in suggestions" :key="i" class="text-sm mb-2">{{ s }}</p>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-4">✨ 个性化推荐</h3>
        <div v-if="recommendations.length" class="book-recommendations">
          <div v-for="book in recommendations" :key="book.id" class="book-item mb-3">
            <div class="book-title font-medium">{{ book.title }}</div>
            <div class="text-sm text-muted">{{ book.author }}</div>
            <div class="flex gap-1 mt-1">
              <span v-for="tag in book.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">添加更多书籍以获取个性化推荐</p>
      </div>
    </div>

    <div class="card">
      <h3 class="mb-4">🏆 成就徽章</h3>
      <div class="achievements-grid flex gap-4">
        <div 
          v-for="achievement in readingStore.achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlockedAt }"
        >
          <div class="text-3xl">{{ achievement.icon }}</div>
          <div class="text-sm font-medium mt-2">{{ achievement.name }}</div>
          <div class="text-xs text-muted">{{ achievement.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header h1 {
  font-size: 28px;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--secondary);
}

.stat-item {
  text-align: center;
  min-width: 60px;
}

.book-item {
  padding: 12px;
  background: var(--bg-light);
  border-radius: 8px;
}

.achievement-card {
  text-align: center;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
  opacity: 0.5;
  filter: grayscale(1);
  transition: all 0.3s;
  min-width: 100px;
}

.achievement-card.unlocked {
  opacity: 1;
  filter: grayscale(0);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.suggestions p {
  padding: 8px 12px;
  background: var(--bg-light);
  border-radius: 6px;
  white-space: pre-line;
}
</style>
