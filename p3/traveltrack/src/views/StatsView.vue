<script setup lang="ts">
import { computed } from 'vue'
import StatsChart from '../components/StatsChart.vue'
import { useTravelStore } from '../stores/travel'

const store = useTravelStore()

const countryList = computed(() => {
  const countries = store.userStats.countriesVisited.map(country => ({
    name: country,
    count: store.diaries.filter(d => d.location.country === country).length
  }))
  return countries.sort((a, b) => b.count - a.count)
})

const cityList = computed(() => {
  const cities = store.userStats.citiesVisited.map(city => ({
    name: city,
    count: store.diaries.filter(d => d.location.city === city).length
  }))
  return cities.sort((a, b) => b.count - a.count)
})
</script>

<template>
  <div class="stats-view">
    <div class="view-header">
      <h1>📊 旅行统计</h1>
      <p class="header-desc">查看你的旅行数据和成就</p>
    </div>
    
    <div class="stats-grid">
      <div class="stats-card big">
        <h3>📈 总体数据</h3>
        <div class="big-stats">
          <div class="big-stat">
            <span class="big-value">{{ store.userStats.totalTrips }}</span>
            <span class="big-label">次旅行</span>
          </div>
          <div class="big-stat">
            <span class="big-value">{{ store.userStats.countriesVisited.length }}</span>
            <span class="big-label">个国家</span>
          </div>
          <div class="big-stat">
            <span class="big-value">{{ store.userStats.citiesVisited.length }}</span>
            <span class="big-label">个城市</span>
          </div>
          <div class="big-stat">
            <span class="big-value">{{ store.userStats.totalPhotos }}</span>
            <span class="big-label">张照片</span>
          </div>
        </div>
      </div>
      
      <div class="stats-card">
        <h3>🥧 旅行类型分布</h3>
        <StatsChart />
      </div>
      
      <div class="stats-card">
        <h3>🌍 去过的国家</h3>
        <div v-if="countryList.length === 0" class="empty-list">
          还没有记录任何国家
        </div>
        <div v-else class="country-list">
          <div v-for="country in countryList" :key="country.name" class="country-item">
            <span class="country-name">{{ country.name }}</span>
            <span class="country-count">{{ country.count }} 次</span>
          </div>
        </div>
      </div>
      
      <div class="stats-card">
        <h3>🏙️ 去过的城市</h3>
        <div v-if="cityList.length === 0" class="empty-list">
          还没有记录任何城市
        </div>
        <div v-else class="city-list">
          <div v-for="city in cityList" :key="city.name" class="city-item">
            <span class="city-name">{{ city.name }}</span>
            <span class="city-count">{{ city.count }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-card.big {
  grid-column: 1 / -1;
}

.stats-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.big-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.big-stat {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.big-value {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
}

.big-label {
  font-size: 14px;
  color: #6b7280;
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  font-size: 14px;
}

.country-list,
.city-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.country-item,
.city-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.country-item:hover,
.city-item:hover {
  background: #f3f4f6;
}

.country-name,
.city-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.country-count,
.city-count {
  font-size: 13px;
  color: #6b7280;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .big-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .big-stats {
    grid-template-columns: 1fr;
  }
}
</style>
