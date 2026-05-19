import { BaseChart } from '../BaseChart'
import { ChartData, PieChartOptions, DataPoint } from '../types'

interface SliceElement {
  startAngle: number
  endAngle: number
  data: DataPoint
  datasetIndex: number
}

export class PieChart extends BaseChart {
  private slices: SliceElement[] = []

  constructor(container: HTMLElement, data: ChartData, options: PieChartOptions = {}) {
    super(container, data, options)
    this.setupMouseEvents()
    this.startAnimation()
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = this.chartWidth / 2
      const centerY = this.chartHeight / 2
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const outerRadius = Math.min(this.chartWidth, this.chartHeight) / 2 - 50
      const innerRadius = this.options.innerRadius || 0

      if (distance >= innerRadius && distance <= outerRadius) {
        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += Math.PI * 2

        const hovered = this.slices.find(
          (slice) => angle >= slice.startAngle && angle < slice.endAngle
        )

        if (hovered) {
          this.showTooltip(
            x,
            y,
            `<strong>${hovered.data.label}</strong><br/>
             值: ${hovered.data.value}`
          )
          return
        }
      }
      this.hideTooltip()
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip()
    })
  }

  render(): void {
    this.clearCanvas()
    this.drawLegend()

    const centerX = this.chartWidth / 2
    const centerY = this.chartHeight / 2
    const outerRadius = (Math.min(this.chartWidth, this.chartHeight) / 2 - 50) * this.animationProgress
    const innerRadius = (this.options.innerRadius || 0) * this.animationProgress

    const allData = this.data.datasets.flatMap(ds => ds.data)
    const total = allData.reduce((sum, point) => sum + point.value, 0)

    let startAngle = 0
    this.slices = []

    allData.forEach((point, index) => {
      const sliceAngle = (point.value / total) * Math.PI * 2
      const endAngle = startAngle + sliceAngle
      const datasetIndex = Math.min(index, this.data.datasets.length - 1)
      const color = this.data.datasets[datasetIndex].color || this.theme.colors[index % this.theme.colors.length]

      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
      this.ctx.closePath()
      this.ctx.fill()

      if (innerRadius > 0) {
        this.ctx.fillStyle = this.theme.backgroundColor
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }

      this.slices.push({ startAngle, endAngle, data: point, datasetIndex })

      if (this.options.showLabel !== false) {
        const midAngle = startAngle + sliceAngle / 2
        const labelRadius = outerRadius * 0.6
        const labelX = centerX + Math.cos(midAngle) * labelRadius
        const labelY = centerY + Math.sin(midAngle) * labelRadius

        this.ctx.fillStyle = '#fff'
        this.ctx.font = 'bold 11px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(point.label, labelX, labelY)
      }

      startAngle = endAngle
    })
  }

  toCode(): string {
    return `Chartisan.init(container).pie({
  data: ${JSON.stringify(this.data, null, 2)},
  options: ${JSON.stringify(this.options, null, 2)}
})`
  }
}
