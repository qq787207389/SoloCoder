<template>
  <div class="home-view">
    <AppHeader />
    
    <main class="main-content">
      <div class="container">
        <section class="section">
          <h2 class="section-title">热门电影</h2>
          <div class="movie-grid">
            <MovieCard 
              v-for="movie in movies" 
              :key="movie.id" 
              :movie="movie" 
            />
            <div v-for="i in skeletonCount" :key="`skeleton-${i}`" class="skeleton-card">
              <div class="skeleton-poster"></div>
              <div class="skeleton-info">
                <div class="skeleton-title"></div>
                <div class="skeleton-meta"></div>
              </div>
            </div>
          </div>
          
          <div v-if="hasMore && !loading" ref="loadMoreTrigger" class="load-more">
            <el-button type="primary" @click="loadMore" :loading="loading">加载更多</el-button>
          </div>
          
          <div v-if="error" class="error-state">
            <el-empty description="加载失败，请重试">
              <el-button type="primary" @click="retry">重试</el-button>
            </el-empty>
          </div>
        </section>

        <section v-if="recommendations.length > 0" class="section">
          <h2 class="section-title">为你推荐</h2>
          <div class="movie-grid">
            <MovieCard 
              v-for="movie in recommendations" 
              :key="`rec-${movie.id}`" 
              :movie="movie" 
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MovieCard from '@/components/MovieCard.vue'
import AppHeader from '@/components/AppHeader.vue'
import { usePlaylistStore } from '@/stores/playlist'
import { getMovies, getRecommendations } from '@/services/api'
import type { Movie } from '@/types'

const movies = ref<Movie[]>([])
const recommendations = ref<Movie[]>([])
const loading = ref(false)
const error = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const skeletonCount = ref(8)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const playlistStore = usePlaylistStore()

async function fetchMovies(page = 1) {
  loading.value = true
  error.value = false
  
  try {
    const response = await getMovies(page, 12)
    
    if (page === 1) {
      movies.value = response.data
    } else {
      movies.value = [...movies.value, ...response.data]
    }
    
    hasMore.value = response.hasMore
    skeletonCount.value = 0
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function fetchRecs() {
  try {
    const watchedIds = playlistStore.watchedMovies
    recommendations.value = await getRecommendations(watchedIds)
  } catch {
    console.error('Failed to fetch recommendations')
  }
}

function loadMore() {
  currentPage.value++
  fetchMovies(currentPage.value)
}

function retry() {
  currentPage.value = 1
  fetchMovies(1)
}

let observer: IntersectionObserver | null = null

onMounted(async () => {
  await fetchMovies(1)
  await fetchRecs()
  
  if (loadMoreTrigger.value) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore.value && !loading.value) {
        loadMore()
      }
    }, { threshold: 0.1 })
    
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 24px 0;
}

.section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
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
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
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

.load-more {
  text-align: center;
  margin-top: 32px;
}

.error-state {
  padding: 48px 0;
  text-align: center;
}
</style>
