export type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

export type ChartMode = 'grouped' | 'stacked'

export interface Theme {
  name: string
  colors: string[]
  backgroundColor: string
  textColor: string
  gridColor: string
  tooltipBg: string
}

export interface DataPoint {
  label: string
  value: number
  series?: string
  x?: number
  y?: number
}

export interface SeriesData {
  name: string
  data: DataPoint[]
  color?: string
}

export interface ChartData {
  labels?: string[]
  datasets: SeriesData[]
}

export interface AxisConfig {
  show: boolean
  label?: string
  min?: number
  max?: number
  tickCount?: number
}

export interface LegendConfig {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
}

export interface TooltipConfig {
  show: boolean
  formatter?: (data: DataPoint | DataPoint[]) => string
}

export interface AnimationConfig {
  show: boolean
  duration: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
}

export interface BaseChartOptions {
  theme?: string | Theme
  width?: number
  height?: number
  padding?: { top: number; right: number; bottom: number; left: number }
  legend?: LegendConfig
  tooltip?: TooltipConfig
  animation?: AnimationConfig
  responsive?: boolean
}

export interface CartesianChartOptions extends BaseChartOptions {
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  mode?: ChartMode
}

export interface BarChartOptions extends CartesianChartOptions {
  barWidth?: number
  barGap?: number
}

export interface LineChartOptions extends CartesianChartOptions {
  smooth?: boolean
  showPoints?: boolean
  showArea?: boolean
  lineWidth?: number
}

export interface PieChartOptions extends BaseChartOptions {
  innerRadius?: number
  outerRadius?: number
  showLabel?: boolean
}

export interface ScatterChartOptions extends CartesianChartOptions {
  pointSize?: number
  showRegressionLine?: boolean
}

export type ChartOptions = BaseChartOptions & CartesianChartOptions & BarChartOptions & LineChartOptions & PieChartOptions & ScatterChartOptions

export interface ChartInstance {
  render: () => void
  update: (data: ChartData, options?: Partial<ChartOptions>) => void
  resize: () => void
  destroy: () => void
  toImage: () => string
  toCode: () => string
}

export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTreeItem {
  x: number
  y: number
  data: DataPoint
  seriesIndex: number
}
