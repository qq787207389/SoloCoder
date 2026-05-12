// 改为直接导入
import Routes from '@/views/Routes.vue'

const routes = [
  {
    path: '/routes',
    name: 'Routes',
    component: Routes  // 直接使用，不再用 () => import()
  },
  // ...
]<template>
  <div class="route-detail" v-if="routeComputed">
    <div class="detail-banner">
      <img :src="route.image" :alt="route.title" />
      <div class="banner-overlay"></div>
      <div class="banner-content container">
        <h1 class="route-title">{{ route.title }}</h1>
        <div class="route-meta">
          <el-tag size="small" type="warning">{{ route.days }}天{{ route.days - 1 }}晚</el-tag>
          <span class="rating">
            <el-rate v-model="route.rating" disabled show-score text-color="#fff" size="small" />
          </span>
          <span class="sales">已售 {{ route.sales }}</span>
        </div>
        <div class="route-price">
          <span class="price-label">¥</span>
          <span class="price-value">{{ route.price }}</span>
          <span class="price-suffix">/人起</span>
          <span v-if="route.originalPrice" class="original-price">¥{{ route.originalPrice }}</span>
        </div>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="container">
        <div class="content-layout">
          <div class="main-content">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="行程介绍" name="itinerary">
                <div class="itinerary-section">
                  <h3 class="section-title">行程概览</h3>
                  <p class="route-description">{{ route.description }}</p>
                  
                  <h3 class="section-title">目的地</h3>
                  <div class="destinations">
                    <el-tag v-for="dest in route.destinations" :key="dest" size="large" class="dest-tag">
                      {{ dest }}
                    </el-tag>
                  </div>
                  
                  <h3 class="section-title">行程安排</h3>
                  <div class="itinerary-list">
                    <div v-for="(day, index) in route.itinerary" :key="index" class="itinerary-day">
                      <div class="day-header">
                        <span class="day-number">第{{ index + 1 }}天</span>
                        <span class="day-title">{{ day.title }}</span>
                      </div>
                      <div class="day-content">
                        <p>{{ day.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="费用说明" name="fee">
                <div class="fee-section">
                  <h3 class="section-title">费用包含</h3>
                  <ul class="fee-list includes">
                    <li v-for="item in route.includes" :key="item">
                      <el-icon color="#67c23a"><Check /></el-icon>
                      {{ item }}
                    </li>
                  </ul>
                  
                  <h3 class="section-title">费用不包含</h3>
                  <ul class="fee-list excludes">
                    <li v-for="item in route.excludes" :key="item">
                      <el-icon color="#f56c6c"><Close /></el-icon>
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="用户评价" name="reviews">
                <div class="reviews-section">
                  <div class="reviews-summary">
                    <div class="score">
                      <span class="score-value">{{ route.rating }}</span>
                      <span class="score-label">综合评分</span>
                    </div>
                    <div class="reviews-count">
                      <span>共 {{ route.reviews.length }} 条评价</span>
                    </div>
                  </div>
                  
                  <div class="reviews-list">
                    <div v-for="review in route.reviews" :key="review.id" class="review-item">
                      <div class="review-header">
                        <el-avatar :size="40" class="review-avatar">
                          {{ review.user.charAt(0) }}
                        </el-avatar>
                        <div class="review-info">
                          <span class="review-user">{{ review.user }}</span>
                          <el-rate v-model="review.rating" disabled size="small" />
                        </div>
                        <span class="review-date">{{ review.date }}</span>
                      </div>
                      <div class="review-content">{{ review.content }}</div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <div class="side-content">
            <div class="booking-card">
              <h3 class="booking-title">立即预订</h3>
              
              <div class="booking-form">
                <div class="form-item">
                  <label>出发日期</label>
                  <el-date-picker
                    v-model="bookingDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </div>
                
                <div class="form-item">
                  <label>出行人数</label>
                  <el-input-number v-model="travelers" :min="1" :max="50" style="width: 100%" />
                </div>
                
                <div class="booking-total">
                  <span>费用合计</span>
                  <span class="total-price">¥{{ route.price * travelers }}</span>
                </div>
                
                <el-button type="primary" size="large" class="book-btn" @click="handleBook">
                  立即预订
                </el-button>
                <el-button size="large" class="cart-btn" @click="handleAddToCart">
                  <el-icon><ShoppingCart /></el-icon>
                  加入购物车
                </el-button>
              </div>
              
              <div class="booking-services">
                <div class="service-item">
                  <el-icon color="#67c23a"><Check /></el-icon>
                  <span>随时退</span>
                </div>
                <div class="service-item">
                  <el-icon color="#67c23a"><Check /></el-icon>
                  <span>无隐藏消费</span>
                </div>
                <div class="service-item">
                  <el-icon color="#67c23a"><Check /></el-icon>
                  <span>专业导游</span>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { Check, Close, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRouteDetail } from '@/data/mockData'

const routeParams = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const activeTab = ref('itinerary')
const bookingDate = ref(null)
const travelers = ref(2)

const route = ref(null)

onMounted(() => {
  const id = routeParams.params.id
  route.value = getRouteDetail(id)
})

const handleBook = () => {
  if (!bookingDate.value) {
    ElMessage.warning('请选择出发日期')
    return
  }
  cartStore.addToCart({
    id: route.value.id,
    type: 'route',
    name: route.value.title,
    price: route.value.price,
    image: route.value.image,
    date: bookingDate.value,
    quantity: travelers.value
  })
  ElMessage.success('预订成功！')
  router.push('/cart')
}

const handleAddToCart = () => {
  cartStore.addToCart({
    id: route.value.id,
    type: 'route',
    name: route.value.title,
    price: route.value.price,
    image: route.value.image,
    quantity: 1
  })
  ElMessage.success('已加入购物车')
}
</script>

<style scoped>
.route-detail {
  background: #f5f7fa;
}

.detail-banner {
  position: relative;
  height: 380px;
  overflow: hidden;
}

.detail-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
}

.banner-content {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  color: white;
}

.route-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.route-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.rating {
  display: flex;
  align-items: center;
}

.sales {
  opacity: 0.9;
}

.route-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-label {
  font-size: 18px;
}

.price-value {
  font-size: 40px;
  font-weight: 700;
}

.price-suffix {
  opacity: 0.9;
}

.original-price {
  text-decoration: line-through;
  opacity: 0.7;
  font-size: 16px;
}

.detail-content {
  padding: 40px 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 30px 0 16px 0;
}

.section-title:first-child {
  margin-top: 0;
}

.route-description {
  color: #666;
  line-height: 1.8;
}

.destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dest-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: none;
}

.itinerary-list {
  margin-top: 20px;
}

.itinerary-day {
  border-left: 2px solid #667eea;
  padding-left: 20px;
  padding-bottom: 30px;
  position: relative;
}

.itinerary-day:last-child {
  padding-bottom: 0;
}

.itinerary-day::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.day-number {
  font-weight: 600;
  color: #667eea;
}

.day-title {
  font-weight: 600;
  color: #333;
}

.day-content p {
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.fee-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fee-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: #666;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.score {
  text-align: center;
}

.score-value {
  display: block;
  font-size: 48px;
  font-weight: 700;
  color: #ff9800;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.reviews-count {
  color: #666;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.review-info {
  flex: 1;
}

.review-user {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.review-date {
  color: #999;
  font-size: 13px;
}

.review-content {
  color: #666;
  line-height: 1.8;
}

.side-content {
  position: sticky;
  top: 90px;
  align-self: start;
}

.booking-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.booking-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

.booking-form {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.booking-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #eee;
  margin-bottom: 16px;
}

.total-price {
  font-size: 28px;
  font-weight: 700;
  color: #e74c3c;
}

.book-btn {
  width: 100%;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.cart-btn {
  width: 100%;
}

.booking-services {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .side-content {
    position: static;
  }
  
  .detail-banner {
    height: 300px;
  }
  
  .route-title {
    font-size: 24px;
  }
  
  .price-value {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .detail-banner {
    height: 250px;
  }
  
  .banner-content {
    bottom: 20px;
  }
  
  .route-title {
    font-size: 20px;
  }
  
  .route-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .reviews-summary {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>