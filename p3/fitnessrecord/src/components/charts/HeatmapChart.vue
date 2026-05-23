<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import { getDaysInMonth } from '@/utils/storage';

interface HeatmapData {
  date: string;
  count: number;
}

const props = defineProps<{
  data: HeatmapData[];
  year?: number;
  month?: number;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const getWeekday = (dateStr: string): number => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

const getWeekNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const dayOfMonth = date.getDate() - 1;
  return Math.floor((dayOfMonth + firstWeekday) / 7);
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value, 'dark');
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;

  const currentYear = props.year || new Date().getFullYear();
  const currentMonth = props.month !== undefined ? props.month : new Date().getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  
  const heatmapData: [number, number, number][] = [];
  const maxWeeks = Math.ceil(daysInMonth / 7);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dataPoint = props.data.find(d => d.date === dateStr);
    const weekday = getWeekday(dateStr);
    const weekNum = getWeekNumber(dateStr);
    heatmapData.push([weekNum, weekday, dataPoint?.count || 0]);
  }

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    title: {
      text: `${currentYear}年${currentMonth + 1}月训练日历`,
      textStyle: {
        color: '#e5e7eb',
        fontSize: 16,
        fontWeight: 600
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: {
        color: '#e5e7eb'
      },
      formatter: (params: any) => {
        const [week, weekday, count] = params.value;
        const dateStr = props.data.find((_, i) => {
          const d = new Date(currentYear, currentMonth, 1 + week * 7 + weekday - getWeekday(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`));
          return d.getDate() === week * 7 + weekday - getWeekday(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`) + 1;
        })?.date || '';
        return `<div style="padding: 8px;">
          <div style="color: #9ca3af; font-size: 12px;">${dateStr}</div>
          <div style="color: #10b981; font-size: 18px; font-weight: 600;">${count} 次训练</div>
        </div>`;
      }
    },
    grid: {
      left: '12%',
      right: '5%',
      bottom: '15%',
      top: '18%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: maxWeeks }, (_, i) => `第${i + 1}周`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11
      }
    },
    visualMap: {
      min: 0,
      max: 3,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      inRange: {
        color: ['#1f2937', '#065f46', '#047857', '#10b981']
      },
      textStyle: {
        color: '#9ca3af'
      },
      show: false
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: false
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0f0f0f',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(16, 185, 129, 0.5)'
          }
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
  <div ref="chartRef" class="w-full h-48"></div>
</template>
