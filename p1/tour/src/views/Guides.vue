<template>
  <div class="guides-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">攻略资讯</h1>
        <p class="page-desc">发现精彩世界，分享旅行心得</p>
      </div>
    </div>
    
    <div class="page-content">
      <div class="container">
        <div class="content-layout">
          <div class="main-content">
            <div class="guides-list">
              <div v-for="guide in guides" :key="guide.id" class="guide-card">
                <div class="guide-image">
                  <img :src="guide.image" :alt="guide.title" />
                </div>
                <div class="guide-content">
                  <h3 class="guide-title">{{ guide.title }}</h3>
                  <p class="guide-summary">{{ guide.summary }}</p>
                  <div class="guide-meta">
                    <span class="author">
                      <el-icon><User /></el-icon>
                      {{ guide.author }}
                    </span>
                    <span class="date">
                      <el-icon><Clock /></el-icon>
                      {{ guide.date }}
                    </span>
                    <span class="views">
                      <el-icon><View /></el-icon>
                      {{ guide.views }} 浏览
                    </span>
                    <span class="likes">
                      <el-icon><Star /></el-icon>
                      {{ guide.likes }} 点赞
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="side-content">
            <div class="side-card">
              <h3 class="side-title">热门推荐</h3>
              <div class="hot-list">
                <div v-for="(guide, index) in guides.slice(0, 5)" :key="guide.id" class="hot-item">
                  <span class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                  <span class="hot-title">{{ guide.title }}</span>
                </div>
              </div>
            </div>
            
            <div class="side-card">
              <h3 class="side-title">热门标签</h3>
              <div class="tags-cloud">
                <el-tag v-for="tag in hotTags" :key="tag" size="large" class="hot-tag" type="info">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, Clock, View, Star } from '@element-plus/icons-vue'
import { guides } from '@/data/mockData'

const hotTags = ['云南', '三亚', '北京', '成都', '日本', '泰国', '自由行', '亲子游', '美食', '摄影']
</script>

<style scoped>
.guides-page {
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

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
}

.guides-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.guide-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  transition: all 0.3s;
}

.guide-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.guide-image {
  width: 300px;
  flex-shrink: 0;
  overflow: hidden;
}

.guide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.guide-card:hover .guide-image img {
  transform: scale(1.05);
}

.guide-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.guide-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.guide-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.guide-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #999;
  font-size: 13px;
}

.guide-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.side-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.side-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.3s;
}

.hot-item:hover {
  color: #667eea;
}

.hot-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #999;
}

.hot-rank.top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hot-title {
  flex: 1;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-tag:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

@media (max-width: 900px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .guide-card {
    flex-direction: column;
  }
  
  .guide-image {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .guide-content {
    padding: 16px;
  }
  
  .guide-title {
    font-size: 16px;
  }
  
  .guide-meta {
    gap: 12px;
  }
}
</style>