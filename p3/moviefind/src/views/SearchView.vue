<template>
  <div class="search-view">
    <AppHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="search-header">
          <h1 class="search-title">搜索结果</h1>
          <p v-if="query" class="search-query">关键词: "{{ query }}"</p>
        </div>
        
        <div v-if="loading" class="movie-grid">
          <div v-for="i in 8" :key="`skeleton-${i}`" class="skeleton-card">
            <div class="skeleton-poster"></div>
            <div class="skeleton-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-meta"></div>
            </div>
          </div>
        </div>
        
        <div v-else-if="movies.length > 0" class="movie-grid">
          <MovieCard 
            v-for="movie in movies" 
            :key="movie.id" 
            :movie="movie" 
          />
        </div>
        
        <div v-else class="empty-state">
          <el-empty :description="query ? '没有找到相关电影' : '请输入关键词搜索'">
            <el-button v-if="query" type="primary" @click="goHome">返回首页</el-button>
          </el-empty>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import { getMovies } from '@/services/api'
import type { Movie } from '@/types'

const route = useRoute()
const router = useRouter()

const movies = ref<Movie[]>([])
const loading = ref(false)

const query = computed(() => route.query.q as string)

async function fetchSearchResults() {
  if (!query.value) {
    movies.value = []
    return
  }
  
  loading.value = true
  
  try {
    const response = await getMovies(1, 100, query.value)
    movies.value = response.data
  } catch {
    movies.value = []
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  fetchSearchResults()
})

watch(() => route.query.q, () => {
  fetchSearchResults()
})
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 32px 0;
}

.search-header {
  margin-bottom: 32px;
}

.search-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.search-query {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.skeleton-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.skeleton-poster {
  aspect-ratio: 2/3;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-info {
  padding: 12px;
}

.skeleton-title {
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-meta {
  height: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  width: 60%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  padding: 48px 0;
}

@media (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .search-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
}
</style>
