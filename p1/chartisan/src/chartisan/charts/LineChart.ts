import { BaseChart } from '../BaseChart'
import { ChartData, LineChartOptions, DataPoint, Point } from '../types'

export class LineChart extends BaseChart {
  private linePoints: { points: Point[]; data: DataPoint[]; datasetIndex: number }[] = []

  constructor(container: HTMLElement, data: ChartData, options: LineChartOptions = {}) {
    super(container, data, options)
    this.setupMouseEvents()
    this.startAnimation()
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let closestPoint: { point: Point; data: DataPoint; datasetIndex: number } | null = null
      let minDist = Infinity

      for (const line of this.linePoints) {
        for (let i = 0; i < line.points.length; i++) {
          const point = line.points[i]
          const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
          if (dist < 20 && dist < minDist) {
            minDist = dist
            closestPoint = { point, data: line.data[i], datasetIndex: line.datasetIndex }
          }
        }
      }

      if (closestPoint) {
        this.showTooltip(
          x,
          y,
          `<strong>${this.data.datasets[closestPoint.datasetIndex].name}</strong><br/>
           ${closestPoint.data.label}: ${closestPoint.data.value}`
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

    this.renderLines(chartLeft, chartRight, chartTop, chartBottom, min, max)
    this.drawXLabels(chartBottom)
  }

  private renderLines(
    chartLeft: number,
    chartRight: number,
    chartTop: number,
    chartBottom: number,
    yMin: number,
    yMax: number
  ): void {
    const dataCount = this.data.datasets[0]?.data.length || 0
    this.linePoints = []

    this.data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || this.theme.colors[datasetIndex % this.theme.colors.length]
      const points: Point[] = []

      dataset.data.forEach((point, i) => {
        const x = this.mapValueToX(i, dataCount)
        const heightRatio = ((point.value - yMin) / (yMax - yMin)) * this.animationProgress
        const y = chartBottom - heightRatio * (chartBottom - chartTop)
        points.push({ x, y })
      })

      this.linePoints.push({ points, data: dataset.data, datasetIndex })

      if (this.options.showArea) {
        this.ctx.fillStyle = color + '40'
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, chartBottom)
        points.forEach(p => this.ctx.lineTo(p.x, p.y))
        this.ctx.lineTo(points[points.length - 1].x, chartBottom)
        this.ctx.closePath()
        this.ctx.fill()
      }

      this.ctx.strokeStyle = color
      this.ctx.lineWidth = this.options.lineWidth || 2
      this.ctx.beginPath()

      if (this.options.smooth) {
        this.drawSmoothLine(points)
      } else {
        points.forEach((p, i) => {
          if (i === 0) this.ctx.moveTo(p.x, p.y)
          else this.ctx.lineTo(p.x, p.y)
        })
      }
      this.ctx.stroke()

      if (this.options.showPoints !== false) {
        points.forEach(p => {
          this.ctx.fillStyle = color
          this.ctx.beginPath()
          this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
          this.ctx.fill()
          this.ctx.fillStyle = this.theme.backgroundColor
          this.ctx.beginPath()
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          this.ctx.fill()
        })
      }
    })
  }

  private drawSmoothLine(points: Point[]): void {
    if (points.length < 2) return

    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  }

  private drawXLabels(chartBottom: number): void {
    const dataCount = this.data.datasets[0]?.data.length || 0
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
    return `Chartisan.init(container).line({
  data: ${JSON.stringify(this.data, null, 2)},
  options: ${JSON.stringify(this.options, null, 2)}
})`
  }
}
