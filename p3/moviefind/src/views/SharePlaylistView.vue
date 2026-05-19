<template>
  <div class="share-playlist-view">
    <header class="share-header">
      <div class="container header-content">
        <div class="logo" @click="goHome">
          <el-icon size="32" color="#409eff"><Film /></el-icon>
          <span class="logo-text">影集</span>
        </div>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <div class="share-banner">
          <el-icon size="48" color="#409eff"><Share /></el-icon>
          <h1 class="share-title">分享的片单</h1>
          <p class="share-subtitle">这是一个只读的片单分享页面</p>
        </div>
        
        <div class="playlist-card" v-if="playlist">
          <div class="playlist-info">
            <h2 class="playlist-title">{{ playlist.name }}</h2>
            <p class="playlist-count">{{ sortedMovies.length }} 部电影</p>
          </div>
          
          <div v-if="sortedMovies.length > 0" class="movie-grid">
            <MovieCard 
              v-for="movie in sortedMovies" 
              :key="movie.id" 
              :movie="movie" 
            />
          </div>
          
          <div v-else class="empty-state">
            <el-empty description="片单是空的" />
          </div>
        </div>
        
        <div v-else class="error-state">
          <el-empty description="片单不存在或已被删除">
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </el-empty>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MovieCard from '@/components/MovieCard.vue'
import { usePlaylistStore } from '@/stores/playlist'
import { getMovies } from '@/services/api'
import type { Movie, Playlist } from '@/types'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()

const playlist = ref<Playlist | null>(null)
const movies = ref<Movie[]>([])

const playlistId = computed(() => route.params.id as string)

const sortedMovies = computed(() => {
  if (!playlist.value) return []
  return playlist.value.movies
    .map(id => movies.value.find(m => m.id === id))
    .filter((m): m is Movie => !!m)
})

async function fetchMovies() {
  if (!playlist.value || playlist.value.movies.length === 0) {
    movies.value = []
    return
  }
  
  try {
    const response = await getMovies(1, 100)
    movies.value = response.data.filter(m => playlist.value!.movies.includes(m.id))
  } catch {
    movies.value = []
  }
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  playlist.value = playlistStore.getPlaylistById(playlistId.value) || null
  if (playlist.value) {
    fetchMovies()
  }
})
</script>

<style scoped>
.share-playlist-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.share-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.main-content {
  padding: 48px 0;
}

.share-banner {
  text-align: center;
  margin-bottom: 48px;
}

.share-title {
  font-size: 32px;
  font-weight: 700;
  margin: 16px 0 8px 0;
  color: #333;
}

.share-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.playlist-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.playlist-info {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.playlist-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.playlist-count {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.empty-state,
.error-state {
  padding: 48px 0;
}

@media (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .share-title {
    font-size: 24px;
  }
  
  .playlist-title {
    font-size: 22px;
  }
  
  .playlist-card {
    padding: 20px;
  }
  
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
</style>
