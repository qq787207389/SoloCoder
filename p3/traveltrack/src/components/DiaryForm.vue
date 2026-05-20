<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Location, TravelDiary, TravelType, TravelPhoto } from '../types'
import { generateId } from '../utils'
import { useTravelStore } from '../stores/travel'

interface Props {
  location?: Location | null
  diary?: TravelDiary | null
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  location: null,
  diary: null,
  visible: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const store = useTravelStore()

const form = ref({
  name: '',
  country: '',
  city: '',
  lat: 0,
  lng: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
  type: 'other' as TravelType,
  photos: [] as TravelPhoto[]
})

const photoUrl = ref('')
const photoCaption = ref('')

const isEdit = computed(() => !!props.diary)

watch(() => props.location, (newLoc) => {
  if (newLoc) {
    form.value.lat = newLoc.lat
    form.value.lng = newLoc.lng
  }
}, { immediate: true })

watch(() => props.diary, (newDiary) => {
  if (newDiary) {
    form.value = {
      name: newDiary.location.name,
      country: newDiary.location.country,
      city: newDiary.location.city,
      lat: newDiary.location.lat,
      lng: newDiary.location.lng,
      date: newDiary.date,
      description: newDiary.description,
      type: newDiary.type,
      photos: [...newDiary.photos]
    }
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (!visible && !isEdit.value) {
    resetForm()
  }
})

const resetForm = () => {
  form.value = {
    name: '',
    country: '',
    city: '',
    lat: 0,
    lng: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'other',
    photos: []
  }
  photoUrl.value = ''
  photoCaption.value = ''
}

const addPhoto = () => {
  if (photoUrl.value.trim()) {
    form.value.photos.push({
      id: generateId(),
      url: photoUrl.value.trim(),
      caption: photoCaption.value.trim() || undefined
    })
    photoUrl.value = ''
    photoCaption.value = ''
  }
}

const removePhoto = (id: string) => {
  form.value.photos = form.value.photos.filter(p => p.id !== id)
}

const handleSubmit = () => {
  if (!form.value.name || !form.value.country || !form.value.city) {
    alert('请填写地点名称、国家和城市')
    return
  }

  const location: Location = {
    id: generateId(),
    name: form.value.name,
    country: form.value.country,
    city: form.value.city,
    lat: form.value.lat,
    lng: form.value.lng
  }

  if (isEdit.value && props.diary) {
    store.updateDiary(props.diary.id, {
      location,
      date: form.value.date,
      description: form.value.description,
      type: form.value.type,
      photos: form.value.photos
    })
  } else {
    store.addDiary({
      location,
      date: form.value.date,
      description: form.value.description,
      type: form.value.type,
      photos: form.value.photos
    })
  }

  emit('save')
  emit('close')
}

const travelTypes: { value: TravelType; label: string }[] = [
  { value: 'city', label: '城市' },
  { value: 'nature', label: '自然' },
  { value: 'food', label: '美食' },
  { value: 'culture', label: '文化' },
  { value: 'other', label: '其他' }
]
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEdit ? '编辑旅行日记' : '添加旅行日记' }}</h2>
          <button class="close-btn" @click="emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>地点名称 *</label>
              <input v-model="form.name" type="text" placeholder="如：长城" />
            </div>
            
            <div class="form-group">
              <label>国家 *</label>
              <input v-model="form.country" type="text" placeholder="如：中国" />
            </div>
            
            <div class="form-group">
              <label>城市 *</label>
              <input v-model="form.city" type="text" placeholder="如：北京" />
            </div>
            
            <div class="form-group">
              <label>日期</label>
              <input v-model="form.date" type="date" />
            </div>
            
            <div class="form-group">
              <label>旅行类型</label>
              <select v-model="form.type">
                <option v-for="type in travelTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>描述</label>
              <textarea v-model="form.description" rows="4" placeholder="记录你的旅行故事..."></textarea>
            </div>
          </div>
          
          <div class="photos-section">
            <h3>照片</h3>
            <div class="photo-input">
              <input v-model="photoUrl" type="text" placeholder="输入图片 URL" />
              <input v-model="photoCaption" type="text" placeholder="图片说明（可选）" />
              <button @click="addPhoto" class="add-btn">添加</button>
            </div>
            
            <div class="photos-grid">
              <div v-for="photo in form.photos" :key="photo.id" class="photo-item">
                <img :src="photo.url" :alt="photo.caption || '照片'" />
                <button class="remove-photo" @click="removePhoto(photo.id)">×</button>
                <p v-if="photo.caption" class="photo-caption">{{ photo.caption }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="emit('close')" class="btn-secondary">取消</button>
          <button @click="handleSubmit" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.photos-section {
  margin-top: 24px;
}

.photos-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.photo-input {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.photo-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.add-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.photo-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-caption {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
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

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .photo-input {
    flex-direction: column;
  }
}
</style>
