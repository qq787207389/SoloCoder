import { ChartType, ChartData, ChartOptions } from '../chartisan/types'

export interface BuilderState {
  chartType: ChartType
  data: ChartData
  options: ChartOptions
  rawData: { headers: string[]; rows: any[] } | null
  xField: string
  yField: string
  seriesField: string
}

export const initialState: BuilderState = {
  chartType: 'bar',
  data: {
    datasets: [{
      name: '数据系列',
      data: [
        { label: '一月', value: 65 },
        { label: '二月', value: 59 },
        { label: '三月', value: 80 },
        { label: '四月', value: 81 },
        { label: '五月', value: 56 },
        { label: '六月', value: 55 }
      ]
    }]
  },
  options: {
    theme: 'light',
    legend: { show: true, position: 'top' },
    animation: { show: true, duration: 800, easing: 'easeOut' },
    responsive: true
  },
  rawData: null,
  xField: '',
  yField: '',
  seriesField: ''
}

let currentState = { ...initialState }
const listeners: ((state: BuilderState) => void)[] = []

export const state = {
  get: () => currentState,
  set: (newState: Partial<BuilderState>) => {
    currentState = { ...currentState, ...newState }
    listeners.forEach(fn => fn(currentState))
  },
  subscribe: (fn: (state: BuilderState) => void) => {
    listeners.push(fn)
    return () => {
      const idx = listeners.indexOf(fn)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }
}
