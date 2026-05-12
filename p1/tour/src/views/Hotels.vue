<template>
  <div class="hotels-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">酒店预订</h1>
        <p class="page-desc">精选优质酒店，为您提供舒适住宿体验</p>
      </div>
    </div>
    
    <div class="page-content">
      <div class="container">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">星级：</span>
            <el-radio-group v-model="filters.stars" size="small">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="5">五星级</el-radio-button>
              <el-radio-button value="4">四星级</el-radio-button>
              <el-radio-button value="3">三星级</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">价格区间：</span>
            <el-select v-model="filters.priceRange" placeholder="选择价格" size="small" clearable style="width: 150px">
              <el-option label="¥500以下" value="0-500" />
              <el-option label="¥500-1000" value="500-1000" />
              <el-option label="¥1000-2000" value="1000-2000" />
              <el-option label="¥2000以上" value="2000+" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">排序：</span>
            <el-radio-group v-model="filters.sort" size="small">
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="price">价格最低</el-radio-button>
              <el-radio-button value="rating">评分最高</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div class="hotels-grid">
          <div v-for="hotel in filteredHotels" :key="hotel.id" class="hotel-card" @click="goToDetail(hotel.id)">
            <div class="hotel-image">
              <img :src="hotel.image" :alt="hotel.name" />
              <div class="hotel-stars">
                <el-icon v-for="i in hotel.stars" :key="i" color="#ffc107"><Star /></el-icon>
              </div>
            </div>
            <div class="hotel-content">
              <h3 class="hotel-name">{{ hotel.name }}</h3>
              <div class="hotel-location">
                <el-icon><Location /></el-icon>
                <span>{{ hotel.location }}</span>
              </div>
              <div class="hotel-tags">
                <el-tag v-for="tag in hotel.tags.slice(0, 3)" :key="tag" size="small" type="info">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="hotel-footer">
                <el-rate v-model="hotel.rating" disabled size="small" />
                <div class="hotel-price">
                  <span class="price-value">¥{{ hotel.price }}</span>
                  <span class="price-suffix">/晚起</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Location, Star } from '@element-plus/icons-vue'
import { hotels } from '@/data/mockData'

const router = useRouter()

const filters = ref({
  stars: '',
  priceRange: '',
  sort: 'default'
})

const filteredHotels = computed(() => {
  let result = [...hotels]
  
  if (filters.value.stars) {
    result = result.filter(h => h.stars === parseInt(filters.value.stars))
  }
  
  if (filters.value.priceRange) {
    const [min, max] = filters.value.priceRange.split('-').map(v => v === '' ? Infinity : parseInt(v))
    if (max === undefined || isNaN(max)) {
      result = result.filter(h => h.price >= min)
    } else {
      result = result.filter(h => h.price >= min && h.price <= max)
    }
  }
  
  switch (filters.value.sort) {
    case 'price':
      result.sort((a, b) => a.price - b.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
  }
  
  return result
})

const goToDetail = (id) => {
  router.push(`/hotels/${id}`)
}
</script>

<style scoped>
.hotels-page {
  background: #f5f7fa;
  min-height: calc(100vh - 70px - 400px);
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.page-desc {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.page-content {
  padding: 40px 20px;
}

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.hotel-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.hotel-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.hotel-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hotel-card:hover .hotel-image img {
  transform: scale(1.05);
}

.hotel-stars {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  gap: 2px;
}

.hotel-content {
  padding: 20px;
}

.hotel-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.hotel-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.hotel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.hotel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.hotel-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
}

.price-suffix {
  font-size: 13px;
  color: #999;
}

@media (max-width: 1024px) {
  .hotels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .hotels-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-bar {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>