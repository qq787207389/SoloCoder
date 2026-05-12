<template>
  <div class="routes-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">旅游线路</h1>
        <p class="page-desc">精选国内外优质线路，为您打造完美旅行体验</p>
      </div>
    </div>
    
    <div class="page-content">
      <div class="container">
        <FilterBar @filter-change="handleFilterChange" />
        
        <div class="routes-result">
          <div class="result-header">
            <span>共找到 <em>{{ filteredRoutes.length }}</em> 条线路</span>
          </div>
          
          <div v-if="paginatedRoutes.length > 0" class="routes-grid">
            <RouteCard v-for="route in paginatedRoutes" :key="route.id" :route="route" />
          </div>
          
          <el-empty v-else description="暂无符合条件的线路" />
          
          <Pagination
            v-if="filteredRoutes.length > 0"
            :total="filteredRoutes.length"
            v-model:page="currentPage"
            :page-size="pageSize"
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import RouteCard from '@/components/RouteCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/Pagination.vue'
import { routes } from '@/data/mockData'

const route = useRoute()

const currentPage = ref(1)
const pageSize = ref(6)
const filters = ref({
  days: '',
  priceRange: '',
  departure: '',
  sort: 'default',
  keyword: ''
})

const filteredRoutes = computed(() => {
  let result = [...routes]
  
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(r => 
      r.title.toLowerCase().includes(keyword) ||
      r.destinations.some(d => d.toLowerCase().includes(keyword))
    )
  }
  
  if (filters.value.days) {
    const days = parseInt(filters.value.days)
    if (filters.value.days === '10') {
      result = result.filter(r => r.days >= 10)
    } else {
      result = result.filter(r => r.days === days)
    }
  }
  
  if (filters.value.priceRange) {
    const [min, max] = filters.value.priceRange.split('-').map(v => v === '' ? Infinity : parseInt(v))
    if (max === undefined || isNaN(max)) {
      result = result.filter(r => r.price >= min)
    } else {
      result = result.filter(r => r.price >= min && r.price <= max)
    }
  }
  
  switch (filters.value.sort) {
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
  }
  
  return result
})

const paginatedRoutes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRoutes.value.slice(start, start + pageSize.value)
})

const handleFilterChange = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
  currentPage.value = 1
}

const handlePageChange = ({ page, pageSize: newPageSize }) => {
  currentPage.value = page
  pageSize.value = newPageSize
}

onMounted(() => {
  if (route.query.keyword) {
    filters.value.keyword = route.query.keyword
  }
})
</script>

<style scoped>
.routes-page {
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

.result-header {
  margin-bottom: 24px;
  font-size: 15px;
  color: #666;
}

.result-header em {
  color: #667eea;
  font-weight: 600;
  font-style: normal;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .routes-grid {
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
  
  .routes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .page-content {
    padding: 24px 15px;
  }
}
</style>