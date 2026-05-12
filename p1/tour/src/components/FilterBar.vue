<template>
  <div class="filter-bar">
    <div class="filter-item">
      <span class="filter-label">行程天数：</span>
      <el-radio-group v-model="filters.days" size="small">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="3">3天</el-radio-button>
        <el-radio-button value="5">5天</el-radio-button>
        <el-radio-button value="7">7天</el-radio-button>
        <el-radio-button value="10">10天+</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="filter-item">
      <span class="filter-label">价格区间：</span>
      <el-select v-model="filters.priceRange" placeholder="选择价格" size="small" clearable>
        <el-option label="¥1000以下" value="0-1000" />
        <el-option label="¥1000-2000" value="1000-2000" />
        <el-option label="¥2000-3000" value="2000-3000" />
        <el-option label="¥3000-5000" value="3000-5000" />
        <el-option label="¥5000以上" value="5000+" />
      </el-select>
    </div>
    
    <div class="filter-item">
      <span class="filter-label">出发地：</span>
      <el-select v-model="filters.departure" placeholder="选择出发地" size="small" clearable>
        <el-option label="北京" value="北京" />
        <el-option label="上海" value="上海" />
        <el-option label="广州" value="广州" />
        <el-option label="深圳" value="深圳" />
        <el-option label="成都" value="成都" />
        <el-option label="杭州" value="杭州" />
      </el-select>
    </div>
    
    <div class="filter-item sort-item">
      <span class="filter-label">排序：</span>
      <el-radio-group v-model="filters.sort" size="small">
        <el-radio-button value="default">默认</el-radio-button>
        <el-radio-button value="sales">销量优先</el-radio-button>
        <el-radio-button value="price-asc">价格从低到高</el-radio-button>
        <el-radio-button value="price-desc">价格从高到低</el-radio-button>
        <el-radio-button value="rating">评分最高</el-radio-button>
      </el-radio-group>
    </div>
    
    <el-button type="primary" size="small" @click="handleReset" plain>
      重置筛选
    </el-button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = reactive({
  days: '',
  priceRange: '',
  departure: '',
  sort: 'default'
})

watch(filters, (newVal) => {
  emit('filter-change', { ...newVal })
}, { deep: true })

const handleReset = () => {
  filters.days = ''
  filters.priceRange = ''
  filters.departure = ''
  filters.sort = 'default'
}
</script>

<style scoped>
.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-item:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  min-width: 70px;
}

.sort-item {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px;
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px 0 0 6px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 6px 6px 0;
}

:deep(.el-select) {
  width: 160px;
}

@media (max-width: 768px) {
  .filter-bar {
    padding: 15px;
  }
  
  .filter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filter-label {
    min-width: auto;
  }
  
  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  :deep(.el-radio-button__inner) {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
}
</style>