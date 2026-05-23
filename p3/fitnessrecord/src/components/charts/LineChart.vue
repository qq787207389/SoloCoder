<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

interface ChartData {
  date: string;
  value: number;
}

const props = defineProps<{
  data: ChartData[];
  title?: string;
  color?: string;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value, 'dark');
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    title: {
      text: props.title,
      textStyle: {
        color: '#e5e7eb',
        fontSize: 16,
        fontWeight: 600
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: {
        color: '#e5e7eb'
      },
      formatter: (params: any) => {
        const data = params[0];
        return `<div style="padding: 4px 8px;">
          <div style="color: #9ca3af; font-size: 12px;">${data.axisValue}</div>
          <div style="color: ${props.color || '#10b981'}; font-size: 16px; font-weight: 600;">${data.value} kg</div>
        </div>`;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.date),
      axisLine: {
        lineStyle: {
          color: '#374151'
        }
      },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        rotate: 45
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
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: '{value} kg'
      },
      splitLine: {
        lineStyle: {
          color: '#1f2937',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: props.data.map(d => d.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: props.color || '#10b981',
          width: 3
        },
        itemStyle: {
          color: props.color || '#10b981',
          borderColor: '#0f0f0f',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: props.color || '#10b981' },
            { offset: 1, color: 'transparent' }
          ]),
          opacity: 0.2
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

const handleResize = () => {
  chartInstance?.resize();
};

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

<template>
  <div ref="chartRef" class="w-full h-64"></div>
</template>
