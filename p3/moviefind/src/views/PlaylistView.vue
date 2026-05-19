<template>
  <div class="playlist-view">
    <AppHeader />
    
    <main class="main-content">
      <div class="container">
        <div class="playlist-header">
          <div class="playlist-info">
            <h1 class="playlist-title">{{ playlist?.name || '片单' }}</h1>
            <p class="playlist-count">{{ sortedMovies.length }} 部电影</p>
          </div>
          <div class="playlist-actions" v-if="playlist">
            <el-button 
              v-if="!playlist.isDefault" 
              type="danger" 
              size="large" 
              @click="handleDelete"
            >
              <el-icon><Delete /></el-icon>
              删除片单
            </el-button>
            <el-button type="primary" size="large" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享链接
            </el-button>
          </div>
        </div>
        
        <div v-if="sortedMovies.length > 0" class="movie-list">
          <div
            v-for="(movie, index) in sortedMovies"
            :key="movie.id"
            class="movie-item"
            draggable="true"
            @dragstart="handleDragStart($event, index)"
            @dragover.prevent="handleDragOver($event, index)"
            @drop="handleDrop($event, index)"
            @dragend="handleDragEnd"
          >
            <div class="drag-handle">
              <el-icon size="20" color="#999"><Rank /></el-icon>
            </div>
            <img :src="movie.poster" :alt="movie.title" class="movie-poster" @click="goToDetail(movie.id)" />
            <div class="movie-info">
              <h3 class="movie-title" @click="goToDetail(movie.id)">{{ movie.title }}</h3>
              <p class="movie-meta">{{ movie.year }} · {{ movie.genres.slice(0, 2).join(' / ') }}</p>
              <el-rate v-model="movie.rating" disabled show-score text-color="#ff9900" :max="10" />
            </div>
            <div class="movie-actions">
              <el-button circle icon="Delete" type="danger" @click="removeFromPlaylist(movie.id)" />
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="片单是空的，快去添加电影吧">
            <el-button type="primary" @click="goHome">浏览电影</el-button>
          </el-empty>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import { usePlaylistStore } from '@/stores/playlist'
import { getMovies } from '@/services/api'
import type { Movie, Playlist } from '@/types'

const route = useRoute()
const router = useRouter()
const playlistStore = usePlaylistStore()

const playlist = ref<Playlist | null>(null)
const movies = ref<Movie[]>([])
const dragIndex = ref<number | null>(null)

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

function goToDetail(id: number) {
  router.push(`/movie/${id}`)
}

function goHome() {
  router.push('/')
}

function removeFromPlaylist(movieId: number) {
  playlistStore.removeFromPlaylist(movieId, playlistId.value)
  ElMessage.success('已从片单中移除')
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个片单吗？删除后无法恢复。',
      '删除片单',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    playlistStore.deletePlaylist(playlistId.value)
    ElMessage.success('片单已删除')
    router.push('/')
  } catch {
    // 用户取消
  }
}

async function handleShare() {
  const shareUrl = `${window.location.origin}/#/share/${playlistId.value}`
  try {
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch {
    ElMessage({
      message: '分享链接: ' + shareUrl,
      duration: 5000,
      showClose: true
    })
  }
}

function handleDragStart(e: DragEvent, index: number) {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragOver(e: DragEvent, index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  e.preventDefault()
}

function handleDrop(e: DragEvent, dropIndex: number) {
  if (dragIndex.value === null || dragIndex.value === dropIndex || !playlist.value) return
  
  const newOrder = [...playlist.value.movies]
  const draggedId = newOrder.splice(dragIndex.value, 1)[0]
  newOrder.splice(dropIndex, 0, draggedId)
  
  playlistStore.updatePlaylistOrder(playlistId.value, newOrder)
}

function handleDragEnd() {
  dragIndex.value = null
}

onMounted(() => {
  playlist.value = playlistStore.getPlaylistById(playlistId.value) || null
  if (!playlist.value) {
    router.push('/')
    return
  }
  fetchMovies()
})
</script>

<style scoped>
.playlist-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  padding: 32px 0;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.playlist-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.playlist-count {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.playlist-actions {
  display: flex;
  gap: 12px;
}

.movie-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.movie-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-item:active {
  cursor: grabbing;
}

.movie-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.drag-handle {
  cursor: grab;
  padding: 8px;
}

.movie-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.movie-info {
  flex: 1;
}

.movie-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  cursor: pointer;
}

.movie-title:hover {
  color: #409eff;
}

.movie-meta {
  font-size: 14px;
  color: #999;
  margin: 0 0 8px 0;
}

.movie-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.movie-item:hover .movie-actions {
  opacity: 1;
}

.empty-state {
  padding: 48px 0;
}

@media (max-width: 768px) {
  .playlist-title {
    font-size: 24px;
  }
  
  .movie-item {
    padding: 12px;
    gap: 12px;
  }
  
  .movie-poster {
    width: 60px;
    height: 90px;
  }
  
  .movie-title {
    font-size: 16px;
  }
  
  .movie-actions {
    opacity: 1;
  }
}
</style>
