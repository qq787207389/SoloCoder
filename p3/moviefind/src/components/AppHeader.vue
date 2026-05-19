<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo" @click="goHome">
        <el-icon size="32" color="#409eff"><Film /></el-icon>
        <span class="logo-text">影集</span>
      </div>
      
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索电影..."
          prefix-icon="Search"
          size="large"
          @keyup.enter="handleSearch"
          clearable
        />
      </div>
      
      <div class="header-actions">
        <el-dropdown @command="handlePlaylistClick">
          <el-button type="default" size="large">
            <el-icon><List /></el-icon>
            片单
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="playlist in playlists" :key="playlist.id" :command="playlist.id">
                {{ playlist.name }} ({{ playlist.movies.length }})
              </el-dropdown-item>
              <el-dropdown-item divided command="create">
                <el-icon><Plus /></el-icon>
                创建片单
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { usePlaylistStore } from '@/stores/playlist'

const router = useRouter()
const playlistStore = usePlaylistStore()
const searchQuery = ref('')

const playlists = playlistStore.playlists

function goHome() {
  router.push('/')
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

function handlePlaylistClick(command: string) {
  if (command === 'create') {
    createNewPlaylist()
  } else {
    router.push(`/playlist/${command}`)
  }
}

async function createNewPlaylist() {
  const { value: name } = await ElMessageBox.prompt('请输入片单名称', '创建片单', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '片单名称不能为空'
  })
  
  if (name) {
    const newPlaylist = playlistStore.createPlaylist(name)
    router.push(`/playlist/${newPlaylist.id}`)
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
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

.search-bar {
  flex: 1;
  max-width: 500px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }
  
  .search-bar {
    order: 3;
    width: 100%;
    max-width: none;
  }
  
  .logo-text {
    font-size: 20px;
  }
}
</style>
