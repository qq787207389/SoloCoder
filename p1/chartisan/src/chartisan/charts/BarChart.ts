import { BaseChart } from '../BaseChart'
import { ChartData, BarChartOptions, DataPoint } from '../types'

interface BarElement {
  x: number
  y: number
  width: number
  height: number
  data: DataPoint
  datasetIndex: number
}

export class BarChart extends BaseChart {
  private barElements: BarElement[] = []

  constructor(container: HTMLElement, data: ChartData, options: BarChartOptions = {}) {
    super(container, data, options)
    this.setupMouseEvents()
    this.startAnimation()
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const hovered = this.barElements.find(
        (bar) => x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height
      )

      if (hovered) {
        this.showTooltip(
          x,
          y,
          `<strong>${this.data.datasets[hovered.datasetIndex].name}</strong><br/>
           ${hovered.data.label}: ${hovered.data.value}`
        )
      } else {
        this.hideTooltip()
      }
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip()
    })
  }

  render(): void {
    this.clearCanvas()
    this.drawLegend()

    const chartLeft = this.padding.left
    const chartRight = this.chartWidth - this.padding.right
    const chartTop = this.padding.top
    const chartBottom = this.chartHeight - this.padding.bottom

    const { min, max } = this.getYRange()
    const ticks = this.generateYTicks(min, max)
    this.drawGrid(chartLeft, chartRight, chartTop, chartBottom, ticks)

    const dataCount = this.data.datasets[0]?.data.length || 0
    const groupWidth = (chartRight - chartLeft) / dataCount
    const barGap = this.options.barGap || 0.2
    const mode = this.options.mode || 'grouped'

    if (mode === 'grouped') {
      this.renderGroupedBars(chartLeft, chartTop, chartBottom, groupWidth, barGap, min, max)
    } else {
      this.renderStackedBars(chartLeft, chartTop, chartBottom, groupWidth, min, max)
    }

    this.drawXLabels(chartLeft, chartRight, chartBottom, dataCount)
  }

  private renderGroupedBars(
    chartLeft: number,
    chartTop: number,
    chartBottom: number,
    groupWidth: number,
    barGap: number,
    yMin: number,
    yMax: number
  ): void {
    const datasetCount = this.data.datasets.length
    const barWidth = (groupWidth * (1 - barGap)) / datasetCount
    this.barElements = []

    this.data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || this.theme.colors[datasetIndex % this.theme.colors.length]

      dataset.data.forEach((point, dataIndex) => {
        const groupX = chartLeft + groupWidth * dataIndex
        const barX = groupX + barWidth * datasetIndex + (groupWidth * barGap) / 2
        const barHeight = ((point.value - yMin) / (yMax - yMin)) * (chartBottom - chartTop) * this.animationProgress
        const barY = chartBottom - barHeight

        this.ctx.fillStyle = color
        this.ctx.fillRect(barX, barY, barWidth * 0.9, barHeight)

        this.barElements.push({
          x: barX,
          y: barY,
          width: barWidth * 0.9,
          height: barHeight,
          data: point,
          datasetIndex
        })
      })
    })
  }

  private renderStackedBars(
    chartLeft: number,
    chartTop: number,
    chartBottom: number,
    groupWidth: number,
    yMin: number,
    yMax: number
  ): void {
    const dataCount = this.data.datasets[0]?.data.length || 0
    this.barElements = []

    for (let dataIndex = 0; dataIndex < dataCount; dataIndex++) {
      let stackY = chartBottom

      this.data.datasets.forEach((dataset, datasetIndex) => {
        const point = dataset.data[dataIndex]
        if (!point) return

        const color = dataset.color || this.theme.colors[datasetIndex % this.theme.colors.length]
        const barHeight = ((point.value - yMin) / (yMax - yMin)) * (chartBottom - chartTop) * this.animationProgress
        const barY = stackY - barHeight
        const barX = chartLeft + groupWidth * dataIndex + groupWidth * 0.1
        const barWidth = groupWidth * 0.8

        this.ctx.fillStyle = color
        this.ctx.fillRect(barX, barY, barWidth, barHeight)

        this.barElements.push({
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
          data: point,
          datasetIndex
        })

        stackY = barY
      })
    }
  }

  private drawXLabels(chartLeft: number, chartRight: number, chartBottom: number, dataCount: number): void {
    this.ctx.fillStyle = this.theme.textColor
    this.ctx.font = '11px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'

    const labels = this.data.labels || this.data.datasets[0]?.data.map(d => d.label) || []
    labels.forEach((label, i) => {
      const x = this.mapValueToX(i, dataCount)
      this.ctx.fillText(label, x, chartBottom + 15)
    })
  }

  toCode(): string {
    return `Chartisan.init(container).bar({
  data: ${JSON.stringify(this.data, null, 2)},
  options: ${JSON.stringify(this.options, null, 2)}
})`
  }
}
