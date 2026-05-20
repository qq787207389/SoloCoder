<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TravelDiary } from '../types'
import { useTravelStore } from '../stores/travel'

const emit = defineEmits<{
  (e: 'edit', diary: TravelDiary): void
  (e: 'delete', diary: TravelDiary): void
}>()

const store = useTravelStore()
const pageSize = 10
const currentPage = ref(1)

const groupedDiaries = computed(() => {
  const grouped: Record<string, TravelDiary[]> = {}
  const diaries = store.sortedDiaries
  
  diaries.forEach(diary => {
    const year = new Date(diary.date).getFullYear().toString()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(diary)
  })
  
  return grouped
})

const years = computed(() => Object.keys(groupedDiaries.value).sort((a, b) => Number(b) - Number(a)))

const paginatedYears = computed(() => {
  const start = 0
  const end = currentPage.value * pageSize
  return years.value.slice(start, end)
})

const hasMore = computed(() => currentPage.value * pageSize < years.value.length)

const loadMore = () => {
  currentPage.value++
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    city: '城市',
    nature: '自然',
    food: '美食',
    culture: '文化',
    other: '其他'
  }
  return labels[type] || type
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    city: 'bg-blue-100 text-blue-700',
    nature: 'bg-green-100 text-green-700',
    food: 'bg-orange-100 text-orange-700',
    culture: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="timeline">
    <div v-if="store.diaries.length === 0" class="empty-state">
      <div class="empty-icon">🗺️</div>
      <h3>还没有旅行记录</h3>
      <p>点击地图上的位置，开始记录你的旅行故事吧！</p>
    </div>
    
    <div v-else class="timeline-content">
      <div v-for="year in paginatedYears" :key="year" class="year-section">
        <div class="year-header">
          <span class="year-badge">{{ year }}</span>
          <span class="year-count">{{ groupedDiaries[year].length }} 次旅行</span>
        </div>
        
        <div class="year-items">
          <div v-for="diary in groupedDiaries[year]" :key="diary.id" class="timeline-item">
            <div class="timeline-dot"></div>
            
            <div class="timeline-card">
              <div class="card-header">
                <div>
                  <h4 class="location-name">{{ diary.location.name }}</h4>
                  <p class="location-detail">{{ diary.location.city }}, {{ diary.location.country }}</p>
                </div>
                <span :class="['type-badge', getTypeColor(diary.type)]">{{ getTypeLabel(diary.type) }}</span>
              </div>
              
              <div v-if="diary.photos.length > 0" class="card-photos">
                <img 
                  v-for="photo in diary.photos.slice(0, 3)" 
                  :key="photo.id" 
                  :src="photo.url" 
                  :alt="photo.caption || '照片'"
                  class="photo-thumb"
                />
                <div v-if="diary.photos.length > 3" class="photo-more">
                  +{{ diary.photos.length - 3 }}
                </div>
              </div>
              
              <p v-if="diary.description" class="card-description">{{ diary.description }}</p>
              
              <div class="card-footer">
                <span class="card-date">{{ diary.date }}</span>
                <div class="card-actions">
                  <button @click="emit('edit', diary)" class="action-btn edit">编辑</button>
                  <button @click="emit('delete', diary)" class="action-btn delete">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" class="load-more-btn">加载更多</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

.timeline-content {
  position: relative;
}

.timeline-content::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.year-section {
  margin-bottom: 32px;
}

.year-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-left: 52px;
}

.year-badge {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.year-count {
  font-size: 14px;
  color: #6b7280;
}

.year-items {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-left: 8px;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  background: #ef4444;
  border: 3px solid #fecaca;
  border-radius: 50%;
  margin-top: 16px;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: calc(100% - 40px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.location-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.location-detail {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.card-photos {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.photo-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.photo-more {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.card-date {
  font-size: 13px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn.edit {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.edit:hover {
  background: #dbeafe;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.load-more {
  text-align: center;
  padding: 20px 0 20px 40px;
}

.load-more-btn {
  padding: 10px 24px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 640px) {
  .timeline-card {
    max-width: calc(100% - 20px);
  }
  
  .card-header {
    flex-direction: column;
  }
}
</style>
