<template>
  <div class="charts-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>支出构成</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="sunburst">旭日图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>趋势对比</span>
              <el-button size="small" @click="showCompareDialog = true">
                选择时间段
              </el-button>
            </div>
          </template>
          <div ref="barChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>收支趋势 (近30天)</span>
          </template>
          <div ref="lineChartRef" class="chart line-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showCompareDialog"
      title="选择对比时间段"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="时间段1">
          <el-date-picker
            v-model="period1"
            type="month"
            placeholder="选择月份"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="时间段2">
          <el-date-picker
            v-model="period2"
            type="month"
            placeholder="选择月份"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCompareDialog = false">取消</el-button>
        <el-button type="primary" @click="updateCompareChart">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBookStore } from '@/stores/bookStore'
import type { ECharts } from 'echarts'

const transactionStore = useTransactionStore()
const bookStore = useBookStore()

const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()

let pieChart: ECharts | null = null
let barChart: ECharts | null = null
let lineChart: ECharts | null = null

const chartType = ref<'pie' | 'sunburst'>('pie')
const showCompareDialog = ref(false)

const currentMonth = new Date()
const period1 = ref(currentMonth.toISOString().slice(0, 7))
const period2 = ref(
  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
    .toISOString()
    .slice(0, 7)
)

const currentBookTransactions = computed(() =>
  transactionStore.transactions.present.filter(
    (t) => t.bookId === bookStore.currentBookId
  )
)

function initPieChart() {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

function updatePieChart() {
  if (!pieChart) return

  const expenseData = currentBookTransactions.value.filter(
    (t) => t.type === 'expense'
  )
  const categoryMap = new Map<string, number>()

  expenseData.forEach((t) => {
    const current = categoryMap.get(t.categoryName) || 0
    categoryMap.set(t.categoryName, current + t.baseAmount)
  })

  const data = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }))

  if (chartType.value === 'pie') {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    }
    pieChart.setOption(option)
  } else {
    const sunburstData = data.map((item) => ({
      name: item.name,
      value: item.value,
      children: [
        {
          name: item.name,
          value: item.value,
        },
      ],
    }))

    const option = {
      tooltip: {
        formatter: '{b}: ¥{c}',
      },
      series: {
        type: 'sunburst',
        data: sunburstData,
        radius: [0, '90%'],
        label: {
          rotate: 'radial',
        },
      },
    }
    pieChart.setOption(option)
  }
}

function initBarChart() {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)
  updateCompareChart()
}

function getMonthData(period: string) {
  const [year, month] = period.split('-').map(Number)
  return currentBookTransactions.value.filter((t) => {
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
}

function updateCompareChart() {
  if (!barChart) return

  const data1 = getMonthData(period1.value)
  const data2 = getMonthData(period2.value)

  const income1 = data1
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.baseAmount, 0)
  const expense1 = data1
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.baseAmount, 0)
  const income2 = data2
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.baseAmount, 0)
  const expense2 = data2
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.baseAmount, 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}: ¥{c}',
    },
    legend: {
      data: ['收入', '支出'],
    },
    xAxis: {
      type: 'category',
      data: [period1.value, period2.value],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: [income1.toFixed(2), income2.toFixed(2)],
        itemStyle: {
          color: '#67C23A',
        },
      },
      {
        name: '支出',
        type: 'bar',
        data: [expense1.toFixed(2), expense2.toFixed(2)],
        itemStyle: {
          color: '#F56C6C',
        },
      },
    ],
  }

  barChart.setOption(option)
  showCompareDialog.value = false
}

function initLineChart() {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)
  updateLineChart()
}

function updateLineChart() {
  if (!lineChart) return

  const days = 30
  const dates: string[] = []
  const incomeData: number[] = []
  const expenseData: number[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dates.push(dateStr.slice(5))

    const dayTransactions = currentBookTransactions.value.filter(
      (t) => t.date === dateStr
    )
    incomeData.push(
      dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.baseAmount, 0)
    )
    expenseData.push(
      dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.baseAmount, 0)
    )
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ¥${item.value.toFixed(2)}<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['收入', '支出'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}',
      },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: incomeData,
        itemStyle: {
          color: '#67C23A',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
          ]),
        },
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: expenseData,
        itemStyle: {
          color: '#F56C6C',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' },
          ]),
        },
      },
    ],
  }

  lineChart.setOption(option)
}

function handleResize() {
  pieChart?.resize()
  barChart?.resize()
  lineChart?.resize()
}

watch(chartType, updatePieChart)

watch(
  () => transactionStore.transactions.present,
  () => {
    updatePieChart()
    updateCompareChart()
    updateLineChart()
  },
  { deep: true }
)

watch(
  () => bookStore.currentBookId,
  () => {
    updatePieChart()
    updateCompareChart()
    updateLineChart()
  }
)

onMounted(() => {
  initPieChart()
  initBarChart()
  initLineChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  pieChart?.dispose()
  barChart?.dispose()
  lineChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.charts-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 350px;
  width: 100%;
}

.line-chart {
  height: 300px;
}
</style>
