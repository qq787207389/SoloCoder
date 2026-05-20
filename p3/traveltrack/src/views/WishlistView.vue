<script setup lang="ts">
import { ref } from 'vue'
import type { WishlistItem } from '../types'
import Wishlist from '../components/Wishlist.vue'
import DiaryForm from '../components/DiaryForm.vue'
import { useTravelStore } from '../stores/travel'

const store = useTravelStore()
const selectedItem = ref<WishlistItem | null>(null)
const showForm = ref(false)

const handleComplete = (item: WishlistItem) => {
  selectedItem.value = item
  showForm.value = true
}

const handleSave = () => {
  if (selectedItem.value) {
    store.updateWishlistItem(selectedItem.value.id, { isCompleted: true })
  }
  showForm.value = false
  selectedItem.value = null
}
</script>

<template>
  <div class="wishlist-view">
    <div class="view-header">
      <h1>✨ 心愿清单</h1>
      <p class="header-desc">记录你想去的地方，计划下一次精彩旅行</p>
    </div>
    
    <div class="wishlist-container">
      <Wishlist @complete="handleComplete" />
    </div>
    
    <DiaryForm
      v-if="selectedItem"
      :visible="showForm"
      :location="selectedItem.location"
      @close="showForm = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.wishlist-view {
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

.wishlist-container {
  max-width: 700px;
}
</style>
