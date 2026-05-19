import { BaseChart } from '../BaseChart'
import { ChartData, ScatterChartOptions, DataPoint } from '../types'
import { QuadTree } from '../quadtree'

export class ScatterChart extends BaseChart {
  private quadTree: QuadTree | null = null

  constructor(container: HTMLElement, data: ChartData, options: ScatterChartOptions = {}) {
    super(container, data, options)
    this.setupMouseEvents()
    this.startAnimation()
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (this.quadTree) {
        const nearest = this.quadTree.query(x, y, 10)
        if (nearest.length > 0) {
          const item = nearest[0]
          this.showTooltip(
            x,
            y,
            `<strong>${this.data.datasets[item.seriesIndex].name}</strong><br/>
             X: ${item.data.x?.toFixed(2)}<br/>
             Y: ${item.data.y?.toFixed(2)}`
          )
        } else {
          this.hideTooltip()
        }
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

    const { xMin, xMax, yMin, yMax } = this.getRanges()
    const yTicks = this.generateYTicks(yMin, yMax)
    this.drawGrid(chartLeft, chartRight, chartTop, chartBottom, yTicks)

    this.renderPoints(chartLeft, chartRight, chartTop, chartBottom, xMin, xMax, yMin, yMax)
    this.drawAxesLabels(chartLeft, chartRight, chartBottom, xMin, xMax)
  }

  private getRanges(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity

    for (const dataset of this.data.datasets) {
      for (const point of dataset.data) {
        if (point.x !== undefined) {
          xMin = Math.min(xMin, point.x)
          xMax = Math.max(xMax, point.x)
        }
        if (point.y !== undefined) {
          yMin = Math.min(yMin, point.y)
          yMax = Math.max(yMax, point.y)
        }
      }
    }

    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1

    return {
      xMin: xMin - xPadding,
      xMax: xMax + xPadding,
      yMin: yMin - yPadding,
      yMax: yMax + yPadding
    }
  }

  private renderPoints(
    chartLeft: number,
    chartRight: number,
    chartTop: number,
    chartBottom: number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number
  ): void {
    const chartWidth = chartRight - chartLeft
    const chartHeight = chartBottom - chartTop
    const pointSize = this.options.pointSize || 4

    this.quadTree = new QuadTree({
      x: chartLeft,
      y: chartTop,
      width: chartWidth,
      height: chartHeight
    })

    this.data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || this.theme.colors[datasetIndex % this.theme.colors.length]

      dataset.data.forEach((point) => {
        if (point.x === undefined || point.y === undefined) return

        const x = chartLeft + ((point.x - xMin) / (xMax - xMin)) * chartWidth
        const y = chartBottom - ((point.y - yMin) / (yMax - yMin)) * chartHeight * this.animationProgress

        this.ctx.fillStyle = color + '80'
        this.ctx.beginPath()
        this.ctx.arc(x, y, pointSize, 0, Math.PI * 2)
        this.ctx.fill()

        this.quadTree!.insert({
          x,
          y,
          data: point,
          seriesIndex: datasetIndex
        })
      })
    })
  }

  private drawAxesLabels(
    chartLeft: number,
    chartRight: number,
    chartBottom: number,
    xMin: number,
    xMax: number
  ): void {
    this.ctx.fillStyle = this.theme.textColor
    this.ctx.font = '11px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'

    const xTicks = this.generateYTicks(xMin, xMax, 5)
    const chartWidth = chartRight - chartLeft

    xTicks.forEach((tick) => {
      const x = chartLeft + ((tick - xMin) / (xMax - xMin)) * chartWidth
      this.ctx.fillText(tick.toFixed(1), x, chartBottom + 15)
    })
  }

  toCode(): string {
    return `Chartisan.init(container).scatter({
  data: ${JSON.stringify(this.data, null, 2)},
  options: ${JSON.stringify(this.options, null, 2)}
})`
  }
}
