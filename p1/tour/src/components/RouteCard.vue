<template>
  <div class="route-card" @click="goToDetail">
    <div class="card-image">
      <img :src="route.image" :alt="route.title" />
      <div class="card-tags">
        <el-tag
          v-for="tag in route.tags?.slice(0, 2)"
          :key="tag"
          size="small"
          type="warning"
          effect="dark"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="card-days">{{ route.days }}天{{ route.days - 1 }}晚</div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ route.title }}</h3>
      
      <div class="card-destinations">
        <el-icon><Location /></el-icon>
        <span>{{ route.destinations?.join(' · ') }}</span>
      </div>
      
      <div class="card-highlights">
        <span v-for="highlight in route.highlights?.slice(0, 3)" :key="highlight" class="highlight-tag">
          {{ highlight }}
        </span>
      </div>
      
      <div class="card-footer">
        <div class="card-rating">
          <el-rate v-model="route.rating" disabled show-score text-color="#ff9900" size="small" />
          <span class="sales">已售 {{ route.sales }}</span>
        </div>
        
        <div class="card-price">
          <span class="price-label">起</span>
          <span class="price-value">¥{{ route.price }}</span>
          <span v-if="route.originalPrice" class="original-price">¥{{ route.originalPrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'

const props = defineProps({
  route: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/routes/${props.route.id}`)
}
</script>

<style scoped>
.route-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.route-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.route-card:hover .card-image img {
  transform: scale(1.05);
}

.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.card-days {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-destinations {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.card-destinations .el-icon {
  color: #667eea;
}

.card-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.highlight-tag {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sales {
  font-size: 12px;
  color: #999;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #999;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #e74c3c;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .card-image {
    height: 160px;
  }
  
  .card-title {
    font-size: 15px;
  }
  
  .price-value {
    font-size: 18px;
  }
}
</style>