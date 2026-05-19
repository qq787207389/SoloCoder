<template>
  <div class="movie-detail-view">
    <AppHeader />
    
    <main class="main-content" v-if="movie">
      <div class="container">
        <div class="movie-hero">
          <div class="poster-column">
            <img :src="movie.poster" :alt="movie.title" class="detail-poster" />
          </div>
          
          <div class="info-column">
            <h1 class="movie-title">{{ movie.title }}</h1>
            <div class="movie-meta">
              <span class="year">{{ movie.year }}</span>
              <span class="separator">·</span>
              <span class="duration">{{ formatDuration(movie.duration) }}</span>
              <span class="separator">·</span>
              <el-rate v-model="movie.rating" disabled show-score text-color="#ff9900" :max="10" />
            </div>
            
            <div class="genres">
              <el-tag v-for="genre in movie.genres" :key="genre" size="large" type="info">
                {{ genre }}
              </el-tag>
            </div>
            
            <div class="action-buttons">
              <el-button 
                :type="isInWatchlist ? 'success' : 'primary'" 
                size="large"
                @click="toggleWatchlist"
              >
                <el-icon><Plus /></el-icon>
                {{ isInWatchlist ? '已想看' : '想看' }}
              </el-button>
              <el-button 
                :type="isWatched ? 'success' : 'default'" 
                size="large"
                @click="toggleWatched"
              >
                <el-icon><Check /></el-icon>
                {{ isWatched ? '已看过' : '已看' }}
              </el-button>
              <el-button 
                :type="isFavorite ? 'danger' : 'default'" 
                size="large"
                @click="toggleFavorite"
              >
                <el-icon><StarFilled /></el-icon>
                {{ isFavorite ? '已收藏' : '收藏' }}
              </el-button>
            </div>
            
            <div v-if="isWatched" class="user-rating">
              <span class="rating-label">我的评分：</span>
              <el-rate v-model="userRating" @change="handleRate" show-score />
            </div>
            
            <div class="overview-section">
              <h3>剧情简介</h3>
              <p>{{ movie.overview }}</p>
            </div>
            
            <div class="cast-section">
              <h3>演职人员</h3>
              <div class="cast-list">
                <div v-for="actor in movie.cast" :key="actor.name" class="cast-item">
                  <div class="actor-avatar">
                    <el-icon size="32"><User /></el-icon>
                  </div>
                  <div class="actor-info">
                    <div class="actor-name">{{ actor.name }}</div>
                    <div class="actor-role">{{ actor.character }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <section v-if="similarMovies.length > 0" class="similar-section">
          <h2 class="section-title">相似电影</h2>
          <div class="movie-grid">
            <MovieCard 
              v-for="movie in similarMovies" 
              :key="movie.id" 
              :movie="movie" 
            />
          </div>
        </section>
      </div>
    </main>
    
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-if="error" class="error-state">
      <el-empty description="电影不存在">
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import { usePlaylistStore } from '@/stores/playlist'
import { getMovieById, getSimilarMovies } from '@/services/api'
import type { Movie } from '@/types'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()

const movie = ref<Movie | null>(null)
const similarMovies = ref<Movie[]>([])
const loading = ref(true)
const error = ref(false)

const movieId = computed(() => parseInt(route.params.id as string))

const isInWatchlist = computed(() => playlistStore.isInPlaylist(movieId.value, 'watchlist'))
const isWatched = computed(() => playlistStore.isInPlaylist(movieId.value, 'watched'))
const isFavorite = computed(() => playlistStore.isInPlaylist(movieId.value, 'favorite'))
const userRating = computed({
  get: () => playlistStore.getRating(movieId.value),
  set: (val: number) => val
})

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

function toggleWatchlist() {
  playlistStore.togglePlaylist(movieId.value, 'watchlist')
}

function toggleWatched() {
  playlistStore.togglePlaylist(movieId.value, 'watched')
}

function toggleFavorite() {
  playlistStore.togglePlaylist(movieId.value, 'favorite')
}

function handleRate(rating: number) {
  playlistStore.setRating(movieId.value, rating)
}

function goHome() {
  router.push('/')
}

async function fetchMovie() {
  loading.value = true
  error.value = false
  
  try {
    const [movieData, similarData] = await Promise.all([
      getMovieById(movieId.value),
      getSimilarMovies(movieId.value)
    ])
    
    movie.value = movieData
    similarMovies.value = similarData
    
    if (!movieData) {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMovie()
})

watch(() => route.params.id, () => {
  fetchMovie()
})
</script>

<style scoped>
.movie-detail-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 32px 0;
}

.movie-hero {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 48px;
}

.detail-poster {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.movie-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #666;
}

.separator {
  color: #ccc;
}

.genres {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.user-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.rating-label {
  font-weight: 600;
  color: #333;
}

.overview-section h3,
.cast-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.overview-section p {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
  margin: 0 0 32px 0;
}

.cast-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.cast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.actor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.actor-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.actor-role {
  font-size: 12px;
  color: #999;
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

.loading-state,
.error-state {
  padding: 48px 20px;
}

@media (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .movie-hero {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 20px;
  }
  
  .poster-column {
    display: flex;
    justify-content: center;
  }
  
  .detail-poster {
    max-width: 240px;
  }
  
  .movie-title {
    font-size: 28px;
  }
  
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .cast-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
}
</style>
