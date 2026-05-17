<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBookStore } from '@/stores/book'
import { useNoteStore } from '@/stores/note'
import { useReadingStore } from '@/stores/reading'
import { initEmbeddingModel } from '@/utils/ai'

const loading = ref(true)
const aiLoading = ref(true)

const bookStore = useBookStore()
const noteStore = useNoteStore()
const readingStore = useReadingStore()

onMounted(async () => {
  await Promise.all([
    bookStore.loadBooks(),
    noteStore.loadNotes(),
    readingStore.loadAll()
  ])
  loading.value = false
  
  initEmbeddingModel().finally(() => {
    aiLoading.value = false
  })
})
</script>

<template>
  <div class="app-container" v-if="!loading">
    <nav class="sidebar">
      <div class="logo">
        <h1>📚 智慧阅读</h1>
        <p v-if="aiLoading" class="ai-status">AI模型加载中...</p>
      </div>
      <RouterLink to="/" class="nav-link">🏠 首页</RouterLink>
      <RouterLink to="/books" class="nav-link">📖 书籍</RouterLink>
      <RouterLink to="/notes" class="nav-link">📝 笔记</RouterLink>
      <RouterLink to="/graph" class="nav-link">🕸️ 知识图谱</RouterLink>
      <RouterLink to="/calendar" class="nav-link">📅 阅读日历</RouterLink>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <div class="loading-screen" v-else>
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.logo h1 {
  font-size: 20px;
  margin: 0 0 5px 0;
}

.ai-status {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8fafc;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
