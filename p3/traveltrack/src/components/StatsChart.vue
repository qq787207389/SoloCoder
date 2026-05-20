<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useTravelStore } from '../stores/travel'

const store = useTravelStore()
const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return
  
  const stats = store.userStats
  const typeData = Object.entries(stats.tripsByType).map(([type, count]) => ({
    name: getTypeLabel(type),
    value: count
  })).filter(item => item.value > 0)
  
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0
    },
    series: [
      {
        name: '旅行类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}次 ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: typeData.length > 0 ? typeData : [{ name: '暂无数据', value: 1 }],
        color: typeData.length > 0 
          ? ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#6b7280']
          : ['#e5e7eb']
      }
    ]
  }
  
  chart.setOption(option)
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    city: '城市',
    nature: '自然',
    food: '美食',
    culture: '文化',
    other: '其他'
  }
  return labels[type] || type
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

watch(() => store.diaries.length, () => {
  updateChart()
})
</script>

<template>
  <div class="stats-chart">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style scoped>
.stats-chart {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
