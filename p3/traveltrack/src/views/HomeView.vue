<script setup lang="ts">
import { ref } from 'vue'
import type { Location, TravelDiary } from '../types'
import TravelMap from '../components/TravelMap.vue'
import DiaryForm from '../components/DiaryForm.vue'
import { useTravelStore } from '../stores/travel'
import { downloadJSON, readJSONFile } from '../utils'

const store = useTravelStore()
const selectedLocation = ref<Location | null>(null)
const selectedDiary = ref<TravelDiary | null>(null)
const showForm = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleMapClick = (location: Location) => {
  selectedLocation.value = location
  selectedDiary.value = null
  showForm.value = true
}

const handleDiaryClick = (diary: TravelDiary) => {
  selectedDiary.value = diary
  selectedLocation.value = null
  showForm.value = true
}

const handleExport = () => {
  const data = store.exportData()
  downloadJSON(data, 'travel-diary-backup.json')
}

const handleImportClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      const data = await readJSONFile(file)
      store.importData(data)
      alert('数据导入成功！')
    } catch (error) {
      alert('导入失败，请检查文件格式')
    }
    (event.target as HTMLInputElement).value = ''
  }
}

const handleClearData = () => {
  const hasDiaries = store.diaries.length > 0
  const hasWishlist = store.wishlist.length > 0
  
  if (!hasDiaries && !hasWishlist) {
    alert('当前没有数据需要清除！')
    return
  }
  
  let confirmMessage = '⚠️ 请确认是否要清除所有数据？\n\n'
  confirmMessage += '【即将删除】\n'
  if (hasDiaries) {
    confirmMessage += `  • 旅行日记：${store.diaries.length} 条\n`
  }
  if (hasWishlist) {
    confirmMessage += `  • 心愿清单：${store.wishlist.length} 条\n`
  }
  confirmMessage += '\n❌ 此操作不可撤销，请确认是否继续？'
  
  const userConfirmed = confirm(confirmMessage)
  
  if (userConfirmed === true) {
    executeClearData()
  }
}

const executeClearData = () => {
  try {
    const success = store.clearAllData()
    if (success) {
      alert('✅ 所有数据已成功清除！')
    } else {
      alert('❌ 数据清除失败，请检查浏览器存储权限！')
    }
  } catch (error) {
    console.error('清除数据异常:', error)
    alert('❌ 清除数据时发生异常，请刷新页面后重试！')
  }
}
</script>

<template>
  <div class="home-view">
    <div class="map-section">
      <div class="section-header">
        <h1>🗺️ 足迹地图</h1>
        <div class="header-actions">
          <button @click="handleExport" class="btn-icon" title="导出数据">📤 导出</button>
          <button @click="handleImportClick" class="btn-icon" title="导入数据">📥 导入</button>
          <button @click="handleClearData" class="btn-icon danger" title="清除数据">🗑️</button>
          <input 
            ref="fileInputRef" 
            type="file" 
            accept=".json" 
            style="display: none" 
            @change="handleFileChange"
          />
        </div>
      </div>
      
      <TravelMap 
        @map-click="handleMapClick"
        @diary-click="handleDiaryClick"
      />
      
      <div class="map-hint">
        💡 点击地图上的位置添加旅行记录，点击标记查看或编辑详情
      </div>
    </div>
    
    <div class="stats-sidebar">
      <div class="stats-card">
        <h3>📊 旅行统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ store.userStats.countriesVisited.length }}</span>
            <span class="stat-label">国家</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.userStats.citiesVisited.length }}</span>
            <span class="stat-label">城市</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.userStats.totalTrips }}</span>
            <span class="stat-label">旅行</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.userStats.totalPhotos }}</span>
            <span class="stat-label">照片</span>
          </div>
        </div>
      </div>
      
      <div v-if="store.diaries.length > 0" class="recent-card">
        <h3>✨ 最近旅行</h3>
        <div class="recent-list">
          <div v-for="diary in store.sortedDiaries.slice(0, 3)" :key="diary.id" class="recent-item">
            <div class="recent-thumb">
              <img 
                v-if="diary.photos[0]" 
                :src="diary.photos[0].url" 
                :alt="diary.location.name"
              />
              <span v-else class="no-photo">📍</span>
            </div>
            <div class="recent-info">
              <h4>{{ diary.location.name }}</h4>
              <p>{{ diary.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DiaryForm
      :visible="showForm"
      :location="selectedLocation"
      :diary="selectedDiary"
      @close="showForm = false"
      @save="showForm = false"
    />
  </div>
</template>

<style scoped>
.home-view {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  height: 100%;
}

.map-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-icon.danger {
  color: #dc2626;
}

.btn-icon.danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.map-hint {
  padding: 12px 16px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.stats-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card,
.recent-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-card h3,
.recent-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.recent-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.recent-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.recent-info h4 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.recent-info p {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 900px) {
  .home-view {
    grid-template-columns: 1fr;
  }
  
  .stats-sidebar {
    flex-direction: row;
  }
  
  .stats-card,
  .recent-card {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .stats-sidebar {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
