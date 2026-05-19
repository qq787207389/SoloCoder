<template>
  <div class="movie-card" @click="goToDetail">
    <div class="poster-wrapper">
      <img v-if="!loading" :src="movie.poster" :alt="movie.title" class="poster" />
      <div v-else class="skeleton-poster"></div>
      <div class="rating-badge" v-if="movie.rating">
        <el-rate v-model="movie.rating" disabled show-score text-color="#ff9900" :max="10" />
      </div>
      <div class="overlay">
        <el-button type="primary" circle icon="VideoPlay" @click.stop="goToDetail" />
        <el-button 
          :type="isFavorite ? 'danger' : 'default'" 
          circle 
          :icon="isFavorite ? 'Star' : 'StarFilled'" 
          @click.stop="toggleFavorite" 
        />
      </div>
    </div>
    <div class="movie-info">
      <h3 class="title">{{ movie.title }}</h3>
      <p class="meta">{{ movie.year }} · {{ movie.genres.slice(0, 2).join(' / ') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaylistStore } from '@/stores/playlist'
import type { Movie } from '@/types'

interface Props {
  movie: Movie
  loading?: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const playlistStore = usePlaylistStore()

const isFavorite = computed(() => playlistStore.isInPlaylist(props.movie.id, 'favorite'))

function goToDetail() {
  router.push(`/movie/${props.movie.id}`)
}

function toggleFavorite() {
  playlistStore.togglePlaylist(props.movie.id, 'favorite')
}
</script>

<style scoped>
.movie-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.poster-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skeleton-poster {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .overlay {
  opacity: 1;
}

.movie-info {
  padding: 12px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style>
