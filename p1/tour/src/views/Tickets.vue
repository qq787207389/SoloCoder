<template>
  <div class="tickets-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">景点门票</h1>
        <p class="page-desc">海量精选景点门票，在线预订更优惠</p>
      </div>
    </div>
    
    <div class="page-content">
      <div class="container">
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">价格区间：</span>
            <el-select v-model="filters.priceRange" placeholder="选择价格" size="small" clearable style="width: 150px">
              <el-option label="¥100以下" value="0-100" />
              <el-option label="¥100-300" value="100-300" />
              <el-option label="¥300-500" value="300-500" />
              <el-option label="¥500以上" value="500+" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">排序：</span>
            <el-radio-group v-model="filters.sort" size="small">
              <el-radio-button value="default">默认</el-radio-button>
              <el-radio-button value="sales">销量最高</el-radio-button>
              <el-radio-button value="price">价格最低</el-radio-button>
              <el-radio-button value="rating">评分最高</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div class="tickets-grid">
          <div v-for="ticket in filteredTickets" :key="ticket.id" class="ticket-card">
            <div class="ticket-image">
              <img :src="ticket.image" :alt="ticket.name" />
            </div>
            <div class="ticket-content">
              <h3 class="ticket-name">{{ ticket.name }}</h3>
              <div class="ticket-location">
                <el-icon><Location /></el-icon>
                <span>{{ ticket.location }}</span>
              </div>
              <div class="ticket-tags">
                <el-tag v-for="tag in ticket.tags.slice(0, 2)" :key="tag" size="small" type="info">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="ticket-footer">
                <div class="rating-info">
                  <el-rate v-model="ticket.rating" disabled size="small" />
                  <span class="sales">已售{{ ticket.sales }}</span>
                </div>
                <div class="ticket-price">
                  <span class="price-value">¥{{ ticket.price }}</span>
                  <el-button type="primary" size="small" @click="addToCart(ticket)">预订</el-button>
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
import { useCartStore } from '@/stores/cart'
import { Location } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { tickets } from '@/data/mockData'

const cartStore = useCartStore()

const filters = ref({
  priceRange: '',
  sort: 'default'
})

const filteredTickets = computed(() => {
  let result = [...tickets]
  
  if (filters.value.priceRange) {
    const [min, max] = filters.value.priceRange.split('-').map(v => v === '' ? Infinity : parseInt(v))
    if (max === undefined || isNaN(max)) {
      result = result.filter(t => t.price >= min)
    } else {
      result = result.filter(t => t.price >= min && t.price <= max)
    }
  }
  
  switch (filters.value.sort) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price':
      result.sort((a, b) => a.price - b.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
  }
  
  return result
})

const addToCart = (ticket) => {
  cartStore.addToCart({
    id: ticket.id,
    type: 'ticket',
    name: ticket.name,
    price: ticket.price,
    image: ticket.image,
    quantity: 1
  })
  ElMessage.success('已加入购物车')
}
</script>

<style scoped>
.tickets-page {
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

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.ticket-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.ticket-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.ticket-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.ticket-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.ticket-card:hover .ticket-image img {
  transform: scale(1.05);
}

.ticket-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ticket-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.ticket-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.ticket-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.ticket-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sales {
  font-size: 12px;
  color: #999;
}

.ticket-price {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
}

@media (max-width: 1024px) {
  .tickets-grid {
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
  
  .tickets-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-bar {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .ticket-price {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
}
</style>