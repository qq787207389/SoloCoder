<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useStatisticsStore } from '@/stores/statistics'
import { getDayName } from '@/utils/time'

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const statisticsStore = useStatisticsStore()

function initChart() {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance) return
  
  const weekData = statisticsStore.weekRecords
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E0D8',
      textStyle: {
        color: '#4A4543'
      },
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>专注时长：${data.value} 分钟`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: weekData.map(r => getDayName(r.date)),
      axisLine: {
        lineStyle: {
          color: '#E5E0D8'
        }
      },
      axisLabel: {
        color: '#8B8680',
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#8B8680',
        fontSize: 12,
        formatter: '{value} 分'
      },
      splitLine: {
        lineStyle: {
          color: '#F2EFE9',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: weekData.map(r => r.focusMinutes),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#7D9D8D',
          width: 3
        },
        itemStyle: {
          color: '#7D9D8D',
          borderColor: '#FFFFFF',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(125, 157, 141, 0.3)' },
            { offset: 1, color: 'rgba(125, 157, 141, 0.05)' }
          ])
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

function handleResize() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

watch(() => statisticsStore.weekRecords, () => {
  updateChart()
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="w-full h-64"></div>
</template>
