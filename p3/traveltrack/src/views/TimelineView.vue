<script setup lang="ts">
import { ref } from 'vue'
import type { TravelDiary } from '../types'
import Timeline from '../components/Timeline.vue'
import DiaryForm from '../components/DiaryForm.vue'
import { useTravelStore } from '../stores/travel'

const store = useTravelStore()
const selectedDiary = ref<TravelDiary | null>(null)
const showForm = ref(false)

const handleEdit = (diary: TravelDiary) => {
  selectedDiary.value = diary
  showForm.value = true
}

const handleDelete = (diary: TravelDiary) => {
  if (confirm(`确定要删除 "${diary.location.name}" 的旅行记录吗？`)) {
    store.deleteDiary(diary.id)
  }
}
</script>

<template>
  <div class="timeline-view">
    <div class="view-header">
      <h1>📅 旅行时间轴</h1>
      <p class="header-desc">记录你的每一次旅行足迹</p>
    </div>
    
    <div class="timeline-container">
      <Timeline @edit="handleEdit" @delete="handleDelete" />
    </div>
    
    <DiaryForm
      :visible="showForm"
      :diary="selectedDiary"
      @close="showForm = false"
      @save="showForm = false"
    />
  </div>
</template>

<style scoped>
.timeline-view {
  height: 100%;
  overflow-y: auto;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.header-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.timeline-container {
  max-width: 800px;
}
</style>
