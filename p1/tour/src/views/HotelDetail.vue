<template>
  <div class="hotel-detail" v-if="hotel">
    <div class="detail-banner">
      <img :src="hotel.image" :alt="hotel.name" />
      <div class="banner-overlay"></div>
      <div class="banner-content container">
        <h1 class="hotel-title">{{ hotel.name }}</h1>
        <div class="hotel-meta">
          <div class="stars">
            <el-icon v-for="i in hotel.stars" :key="i" color="#ffc107"><Star /></el-icon>
          </div>
          <span class="location">
            <el-icon><Location /></el-icon>
            {{ hotel.location }}
          </span>
          <el-rate v-model="hotel.rating" disabled show-score size="small" />
        </div>
        <div class="hotel-price">
          <span class="price-label">¥</span>
          <span class="price-value">{{ hotel.price }}</span>
          <span class="price-suffix">/晚起</span>
        </div>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="container">
        <div class="content-layout">
          <div class="main-content">
            <div class="section">
              <h3 class="section-title">酒店简介</h3>
              <p class="hotel-description">{{ hotel.description }}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">设施服务</h3>
              <div class="facilities-grid">
                <div v-for="facility in hotel.facilities" :key="facility" class="facility-item">
                  <el-icon><Check /></el-icon>
                  <span>{{ facility }}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h3 class="section-title">房型选择</h3>
              <div class="rooms-list">
                <div v-for="room in hotel.rooms" :key="room.id" class="room-card">
                  <div class="room-info">
                    <h4 class="room-name">{{ room.name }}</h4>
                    <div class="room-details">
                      <span>{{ room.size }}</span>
                      <span>{{ room.bed }}</span>
                      <span>{{ room.breakfast }}</span>
                    </div>
                  </div>
                  <div class="room-price">
                    <span class="price">¥{{ room.price }}</span>
                    <el-button type="primary" size="small" @click="bookRoom(room)">预订</el-button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h3 class="section-title">用户评价</h3>
              <div class="reviews-list">
                <div v-for="review in hotel.reviews" :key="review.id" class="review-item">
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
          </div>
          
          <div class="side-content">
            <div class="booking-card">
              <h3 class="booking-title">预订房间</h3>
              
              <div class="booking-form">
                <div class="form-item">
                  <label>入住日期</label>
                  <el-date-picker
                    v-model="checkInDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </div>
                
                <div class="form-item">
                  <label>退房日期</label>
                  <el-date-picker
                    v-model="checkOutDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </div>
                
                <div class="form-item">
                  <label>房间数量</label>
                  <el-input-number v-model="roomCount" :min="1" :max="10" style="width: 100%" />
                </div>
                
                <div class="form-item">
                  <label>每间入住人数</label>
                  <el-input-number v-model="guestsPerRoom" :min="1" :max="4" style="width: 100%" />
                </div>
                
                <div class="booking-total">
                  <span>预估总价</span>
                  <span class="total-price">¥{{ hotel.price * roomCount }}</span>
                </div>
                
                <el-button type="primary" size="large" class="book-btn" @click="handleBook">
                  立即预订
                </el-button>
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
import { Location, Star, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getHotelDetail } from '@/data/mockData'

const routeParams = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const hotel = ref(null)
const checkInDate = ref(null)
const checkOutDate = ref(null)
const roomCount = ref(1)
const guestsPerRoom = ref(2)

onMounted(() => {
  const id = routeParams.params.id
  hotel.value = getHotelDetail(id)
})

const handleBook = () => {
  if (!checkInDate.value || !checkOutDate.value) {
    ElMessage.warning('请选择入住和退房日期')
    return
  }
  cartStore.addToCart({
    id: hotel.value.id,
    type: 'hotel',
    name: hotel.value.name,
    price: hotel.value.price,
    image: hotel.value.image,
    checkInDate: checkInDate.value,
    checkOutDate: checkOutDate.value,
    quantity: roomCount.value
  })
  ElMessage.success('预订成功！')
  router.push('/cart')
}

const bookRoom = (room) => {
  if (!checkInDate.value || !checkOutDate.value) {
    ElMessage.warning('请先选择入住和退房日期')
    return
  }
  cartStore.addToCart({
    id: hotel.value.id,
    type: 'hotel',
    name: `${hotel.value.name} - ${room.name}`,
    price: room.price,
    image: hotel.value.image,
    quantity: 1
  })
  ElMessage.success('已加入购物车')
}
</script>

<style scoped>
.hotel-detail {
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

.hotel-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.hotel-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stars {
  display: flex;
  gap: 2px;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hotel-price {
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

.section {
  margin-bottom: 40px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
}

.hotel-description {
  color: #666;
  line-height: 1.8;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.facility-item .el-icon {
  color: #67c23a;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.3s;
}

.room-card:hover {
  background: #f0f2f5;
}

.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.room-details {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.room-price {
  text-align: right;
}

.room-price .price {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 8px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
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
  
  .hotel-title {
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
  
  .hotel-title {
    font-size: 20px;
  }
  
  .hotel-meta {
    gap: 10px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .room-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .room-price {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>