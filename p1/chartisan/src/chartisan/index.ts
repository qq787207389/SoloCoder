import { BarChart } from './charts/BarChart'
import { LineChart } from './charts/LineChart'
import { PieChart } from './charts/PieChart'
import { ScatterChart } from './charts/ScatterChart'
import { ChartData, ChartOptions, BarChartOptions, LineChartOptions, PieChartOptions, ScatterChartOptions } from './types'

export * from './types'
export * from './themes'

interface ChartisanInstance {
  bar: (config: { data: ChartData; options?: BarChartOptions }) => BarChart
  line: (config: { data: ChartData; options?: LineChartOptions }) => LineChart
  pie: (config: { data: ChartData; options?: PieChartOptions }) => PieChart
  scatter: (config: { data: ChartData; options?: ScatterChartOptions }) => ScatterChart
}

export const Chartisan = {
  init(container: HTMLElement): ChartisanInstance {
    return {
      bar: ({ data, options }) => new BarChart(container, data, options),
      line: ({ data, options }) => new LineChart(container, data, options),
      pie: ({ data, options }) => new PieChart(container, data, options),
      scatter: ({ data, options }) => new ScatterChart(container, data, options)
    }
  }
}

export default Chartisan
