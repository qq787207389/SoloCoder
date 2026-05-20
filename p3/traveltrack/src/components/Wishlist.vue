<script setup lang="ts">
import { ref } from 'vue'
import type { WishlistItem, Location } from '../types'
import { generateId } from '../utils'
import { useTravelStore } from '../stores/travel'

const emit = defineEmits<{
  (e: 'complete', item: WishlistItem): void
}>()

const store = useTravelStore()
const showAddForm = ref(false)
const newItem = ref({
  name: '',
  country: '',
  city: '',
  lat: 0,
  lng: 0,
  priority: 'medium' as 'high' | 'medium' | 'low',
  notes: ''
})

const handleAdd = () => {
  if (!newItem.value.name || !newItem.value.country || !newItem.value.city) {
    alert('请填写地点名称、国家和城市')
    return
  }
  
  const location: Location = {
    id: generateId(),
    name: newItem.value.name,
    country: newItem.value.country,
    city: newItem.value.city,
    lat: newItem.value.lat,
    lng: newItem.value.lng
  }
  
  store.addWishlistItem({
    location,
    priority: newItem.value.priority,
    notes: newItem.value.notes
  })
  
  resetForm()
  showAddForm.value = false
}

const resetForm = () => {
  newItem.value = {
    name: '',
    country: '',
    city: '',
    lat: 0,
    lng: 0,
    priority: 'medium',
    notes: ''
  }
}

const handleDelete = (id: string) => {
  if (confirm('确定要删除这个心愿目的地吗？')) {
    store.deleteWishlistItem(id)
  }
}

const handleComplete = (item: WishlistItem) => {
  emit('complete', item)
}

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  }
  return colors[priority] || 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="wishlist">
    <div class="wishlist-header">
      <div class="wishlist-stats">
        <span class="stat">📝 {{ store.wishlist.length }} 个心愿</span>
        <span class="stat">✅ {{ store.wishlist.filter(w => w.isCompleted).length }} 已完成</span>
      </div>
      <button @click="showAddForm = true" class="add-btn">
        + 添加心愿
      </button>
    </div>
    
    <div v-if="showAddForm" class="add-form">
      <div class="form-content">
        <h3>添加心愿目的地</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label>地点名称 *</label>
            <input v-model="newItem.name" type="text" placeholder="如：巴黎铁塔" />
          </div>
          
          <div class="form-group">
            <label>国家 *</label>
            <input v-model="newItem.country" type="text" placeholder="如：法国" />
          </div>
          
          <div class="form-group">
            <label>城市 *</label>
            <input v-model="newItem.city" type="text" placeholder="如：巴黎" />
          </div>
          
          <div class="form-group">
            <label>优先级</label>
            <select v-model="newItem.priority">
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
          
          <div class="form-group full-width">
            <label>备注</label>
            <textarea v-model="newItem.notes" rows="2" placeholder="想去的原因..."></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button @click="showAddForm = false; resetForm()" class="btn-secondary">
            取消
          </button>
          <button @click="handleAdd" class="btn-primary">
            添加
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="store.wishlist.length === 0" class="empty-state">
      <div class="empty-icon">✨</div>
      <h3>还没有心愿目的地</h3>
      <p>添加你想去的地方，计划下一次旅行吧！</p>
    </div>
    
    <div v-else class="wishlist-items">
      <div 
        v-for="item in store.wishlist" 
        :key="item.id" 
        :class="['wishlist-item', { completed: item.isCompleted }]"
      >
        <div class="item-main">
          <div class="item-icon">
            {{ item.isCompleted ? '✅' : '📍' }}
          </div>
          <div class="item-info">
            <h4>{{ item.location.name }}</h4>
            <p class="location">{{ item.location.city }}, {{ item.location.country }}</p>
            <p v-if="item.notes" class="notes">{{ item.notes }}</p>
            <p class="date">添加于 {{ item.addedAt.split('T')[0] }}</p>
          </div>
        </div>
        
        <div class="item-actions">
          <span :class="['priority-badge', getPriorityColor(item.priority)]">
            {{ getPriorityLabel(item.priority) }}
          </span>
          
          <div v-if="!item.isCompleted" class="action-buttons">
            <button @click="handleComplete(item)" class="action-btn complete" title="标记完成">
              ✓
            </button>
            <button @click="handleDelete(item.id)" class="action-btn delete" title="删除">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wishlist {
  width: 100%;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.wishlist-stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 14px;
  color: #6b7280;
}

.add-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #2563eb;
}

.add-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-form h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.wishlist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wishlist-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.wishlist-item.completed {
  opacity: 0.6;
  background: #f9fafb;
}

.item-main {
  display: flex;
  gap: 12px;
  flex: 1;
}

.item-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.item-info .location {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.item-info .notes {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #4b5563;
  font-style: italic;
}

.item-info .date {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn.complete {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.complete:hover {
  background: #bbf7d0;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fecaca;
}

@media (max-width: 640px) {
  .wishlist-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .wishlist-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .item-actions {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }
}
</style>
