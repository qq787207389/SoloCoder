<template>
  <div class="home">
    <section class="banner-section">
      <el-carousel height="500px" :interval="5000" arrow="always">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-content">
              <h1>{{ banner.title }}</h1>
              <p>{{ banner.subtitle }}</p>
              <el-button type="primary" size="large" @click="$router.push('/routes')">
                立即预订
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>
    
    <section class="search-section">
      <div class="search-container">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索目的地、线路、景点..."
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="hot-search">
          <span>热门搜索：</span>
          <el-tag v-for="tag in hotTags" :key="tag" type="info" size="small" @click="searchTag(tag)">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </section>
    
    <section class="category-section">
      <div class="container">
        <div class="section-title">
          <h2>热门分类</h2>
          <p>发现更多精彩旅行体验</p>
        </div>
        <div class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            @click="handleCategoryClick(category)"
          >
            <div class="category-icon" :style="{ background: `linear-gradient(135deg, ${category.color} 0%, ${adjustColor(category.color, 20)} 100%)` }">
              <el-icon :size="32"><component :is="category.icon" /></el-icon>
            </div>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <section class="popular-spots-section">
      <div class="container">
        <div class="section-title">
          <h2>热门景点</h2>
          <p>精选国内外热门旅游目的地</p>
        </div>
        <div class="spots-grid">
          <div v-for="spot in popularSpots" :key="spot.id" class="spot-card">
            <div class="spot-image">
              <img :src="spot.image" :alt="spot.name" />
            </div>
            <div class="spot-info">
              <h3 class="spot-name">{{ spot.name }}</h3>
              <div class="spot-location">
                <el-icon><Location /></el-icon>
                <span>{{ spot.location }}</span>
              </div>
              <div class="spot-footer">
                <el-rate v-model="spot.rating" disabled size="small" />
                <span class="spot-price">
                  {{ spot.price === 0 ? '免费' : `¥${spot.price}起` }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="recommend-routes-section">
      <div class="container">
        <div class="section-header">
          <div class="section-title">
            <h2>精选线路</h2>
            <p>专业规划，品质保障</p>
          </div>
          <el-button type="primary" @click="$router.push('/routes')" plain>
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="routes-grid">
          <RouteCard v-for="route in routes.slice(0, 6)" :key="route.id" :route="route" />
        </div>
      </div>
    </section>
    
    <section class="why-choose-section">
      <div class="container">
        <div class="section-title">
          <h2>为什么选择我们</h2>
          <p>专业服务，安心出行</p>
        </div>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon :size="40"><Wallet /></el-icon>
            </div>
            <h3>价格透明</h3>
            <p>无隐藏消费，所见即所得</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon :size="40"><ShoppingBag /></el-icon>
            </div>
            <h3>品质保障</h3>
            <p>严选商家，全程售后</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon :size="40"><Service /></el-icon>
            </div>
            <h3>专业客服</h3>
            <p>7x24小时，贴心服务</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon :size="40"><Medal /></el-icon>
            </div>
            <h3>海量选择</h3>
            <p>全球目的地，应有尽有</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Location, ArrowRight, Wallet, ShoppingBag, Service, Medal } from '@element-plus/icons-vue'
import RouteCard from '@/components/RouteCard.vue'
import { banners, categories, popularSpots, routes } from '@/data/mockData'

const router = useRouter()
const searchKeyword = ref('')

const hotTags = ['云南', '三亚', '北京', '成都', '九寨沟', '桂林']

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/routes?keyword=${encodeURIComponent(searchKeyword.value)}`)
  }
}

const searchTag = (tag) => {
  router.push(`/routes?keyword=${encodeURIComponent(tag)}`)
}

const handleCategoryClick = (category) => {
  const routeMap = {
    '热门景点': '/tickets',
    '旅游线路': '/routes',
    '酒店住宿': '/hotels'
  }
  const path = routeMap[category.name] || '/routes'
  router.push(path)
}

const adjustColor = (color, amount) => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount)
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<style scoped>
.home {
  background: #f5f7fa;
}

.banner-section :deep(.el-carousel__container) {
  height: 500px !important;
}

.banner-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
}

.banner-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.banner-content h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.banner-content p {
  font-size: 20px;
  margin-bottom: 30px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.search-section {
  margin-top: -50px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.search-box {
  margin-bottom: 16px;
}

.hot-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
}

.hot-search .el-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-search .el-tag:hover {
  background: #667eea;
  color: white;
}

.category-section {
  padding: 60px 20px;
  background: white;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-item:hover {
  transform: translateY(-6px);
}

.category-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.category-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.popular-spots-section {
  padding: 60px 20px;
}

.spots-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.spot-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.spot-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.spot-image {
  height: 140px;
  overflow: hidden;
}

.spot-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.spot-card:hover .spot-image img {
  transform: scale(1.05);
}

.spot-info {
  padding: 14px;
}

.spot-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.spot-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.spot-location .el-icon {
  color: #667eea;
}

.spot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spot-price {
  font-size: 14px;
  font-weight: 600;
  color: #e74c3c;
}

.recommend-routes-section {
  padding: 60px 20px;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header .section-title {
  margin-bottom: 0;
  text-align: left;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.why-choose-section {
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.why-choose-section .section-title h2,
.why-choose-section .section-title p {
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  backdrop-filter: blur(10px);
}

.feature-item h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.feature-item p {
  font-size: 14px;
  opacity: 0.9;
}

@media (max-width: 1200px) {
  .spots-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .routes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .banner-content h1 {
    font-size: 32px;
  }
  
  .banner-content p {
    font-size: 16px;
  }
  
  .banner-section :deep(.el-carousel__container) {
    height: 350px !important;
  }
  
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  
  .category-icon {
    width: 55px;
    height: 55px;
  }
  
  .category-icon .el-icon {
    font-size: 24px;
  }
  
  .spots-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .routes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .section-title h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .spots-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hot-search span {
    width: 100%;
  }
}
</style>