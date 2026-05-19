import { ChartData, ChartOptions, Theme, DataPoint } from './types'
import { getTheme } from './themes'
import { createAnimationController, AnimationController } from './animation'

export abstract class BaseChart {
  protected container: HTMLElement
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D
  protected data: ChartData
  protected options: ChartOptions
  protected theme: Theme
  protected animationController: AnimationController
  protected animationProgress: number = 0
  protected tooltipElement: HTMLElement | null = null
  protected resizeObserver: ResizeObserver | null = null
  private lastWidth: number = 0
  private lastHeight: number = 0

  protected chartWidth: number = 0
  protected chartHeight: number = 0
  protected padding = { top: 40, right: 40, bottom: 60, left: 60 }

  constructor(container: HTMLElement, data: ChartData, options: ChartOptions = {}) {
    this.container = container
    this.data = data
    this.options = options
    this.theme = getTheme(options.theme || 'light')
    this.animationController = createAnimationController()

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)

    // 强制设置 canvas 样式，避免尺寸变化
    this.canvas.style.display = 'block'
    this.canvas.style.boxSizing = 'border-box'
    
    this.initTooltip()
    this.setupResize()
    
    // 如果禁用响应式，立即设置固定尺寸
    if (this.options.responsive === false) {
      this.setFixedDimensions()
    } else {
      this.updateDimensions()
    }
  }

  private setFixedDimensions(): void {
    const dpr = window.devicePixelRatio || 1
    const width = this.options.width || this.container.clientWidth || 600
    const height = this.options.height || this.container.clientHeight || 400
    
    this.chartWidth = width
    this.chartHeight = height
    
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(dpr, dpr)
    
    this.lastWidth = width
    this.lastHeight = height
  }

  protected initTooltip(): void {
    this.tooltipElement = document.createElement('div')
    this.tooltipElement.style.cssText = `
      position: absolute;
      padding: 8px 12px;
      background: ${this.theme.tooltipBg};
      color: ${this.theme.textColor};
      border-radius: 4px;
      font-size: 12px;
      font-family: Arial, sans-serif;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 200px;
    `
    this.container.style.position = 'relative'
    this.container.appendChild(this.tooltipElement)
  }

  protected showTooltip(x: number, y: number, content: string): void {
    if (!this.tooltipElement) return
    this.tooltipElement.innerHTML = content
    this.tooltipElement.style.opacity = '1'
    
    const rect = this.container.getBoundingClientRect()
    let tipX = x + 15
    let tipY = y - 10
    
    if (tipX + 200 > rect.width) tipX = x - 200
    if (tipY < 0) tipY = y + 15
    
    this.tooltipElement.style.left = `${tipX}px`
    this.tooltipElement.style.top = `${tipY}px`
  }

  protected hideTooltip(): void {
    if (this.tooltipElement) {
      this.tooltipElement.style.opacity = '0'
    }
  }

  protected setupResize(): void {
    if (this.options.responsive === false) {
      // 响应式已禁用，跳过
      return
    }
    
    if (this.options.responsive !== false) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.updateDimensions()) {
          this.render()
        }
      })
      this.resizeObserver.observe(this.container)
    }
  }

  protected updateDimensions(): boolean {
    const dpr = window.devicePixelRatio || 1
    const rect = this.container.getBoundingClientRect()
    
    const newWidth = rect.width > 0 ? rect.width : (this.options.width || 600)
    const newHeight = rect.height > 0 ? rect.height : (this.options.height || 400)
    
    // 尺寸没有变化，不更新
    if (Math.abs(newWidth - this.lastWidth) < 2 && Math.abs(newHeight - this.lastHeight) < 2) {
      return false
    }
    
    this.lastWidth = newWidth
    this.lastHeight = newHeight
    this.chartWidth = newWidth
    this.chartHeight = newHeight
    
    this.canvas.width = this.chartWidth * dpr
    this.canvas.height = this.chartHeight * dpr
    this.canvas.style.width = `${this.chartWidth}px`
    this.canvas.style.height = `${this.chartHeight}px`
    this.ctx.scale(dpr, dpr)
    
    if (this.options.padding) {
      this.padding = { ...this.padding, ...this.options.padding }
    }
    
    return true
  }

  protected clearCanvas(): void {
    this.ctx.fillStyle = this.theme.backgroundColor
    this.ctx.fillRect(0, 0, this.chartWidth, this.chartHeight)
  }

  protected drawGrid(xStart: number, xEnd: number, yStart: number, yEnd: number, ticks: number[]): void {
    this.ctx.strokeStyle = this.theme.gridColor
    this.ctx.lineWidth = 1

    for (const tick of ticks) {
      const y = this.mapValueToY(tick, yStart, yEnd)
      this.ctx.beginPath()
      this.ctx.moveTo(xStart, y)
      this.ctx.lineTo(xEnd, y)
      this.ctx.stroke()

      this.ctx.fillStyle = this.theme.textColor
      this.ctx.font = '11px Arial'
      this.ctx.textAlign = 'right'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(tick.toFixed(1), xStart - 10, y)
    }
  }

  protected mapValueToY(value: number, yMin: number, yMax: number): number {
    const chartTop = this.padding.top
    const chartBottom = this.chartHeight - this.padding.bottom
    const range = yMax - yMin
    return chartBottom - ((value - yMin) / range) * (chartBottom - chartTop)
  }

  protected mapValueToX(index: number, total: number): number {
    const chartLeft = this.padding.left
    const chartRight = this.chartWidth - this.padding.right
    const step = (chartRight - chartLeft) / total
    return chartLeft + step * (index + 0.5)
  }

  protected getYRange(): { min: number; max: number } {
    let min = Infinity
    let max = -Infinity

    for (const dataset of this.data.datasets) {
      for (const point of dataset.data) {
        min = Math.min(min, point.value)
        max = Math.max(max, point.value)
      }
    }

    const padding = (max - min) * 0.1
    return {
      min: min - padding,
      max: max + padding
    }
  }

  protected generateYTicks(min: number, max: number, count: number = 5): number[] {
    const ticks: number[] = []
    const step = (max - min) / (count - 1)
    for (let i = 0; i < count; i++) {
      ticks.push(min + step * i)
    }
    return ticks
  }

  protected drawLegend(): void {
    if (!this.options.legend?.show) return

    const legendItems = this.data.datasets.map((ds, i) => ({
      color: ds.color || this.theme.colors[i % this.theme.colors.length],
      name: ds.name
    }))

    const itemHeight = 20
    const itemPadding = 15
    const totalWidth = legendItems.reduce((sum, item) => {
      this.ctx.font = '12px Arial'
      return sum + this.ctx.measureText(item.name).width + 30
    }, 0) + (legendItems.length - 1) * itemPadding

    let startX = (this.chartWidth - totalWidth) / 2
    const startY = 15

    legendItems.forEach((item) => {
      this.ctx.fillStyle = item.color
      this.ctx.fillRect(startX, startY, 12, 12)

      this.ctx.fillStyle = this.theme.textColor
      this.ctx.font = '12px Arial'
      this.ctx.textAlign = 'left'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(item.name, startX + 18, startY + 6)

      startX += this.ctx.measureText(item.name).width + 30 + itemPadding
    })
  }

  protected startAnimation(onComplete?: () => void): void {
    if (this.options.animation?.show === false) {
      this.animationProgress = 1
      this.render()
      onComplete?.()
      return
    }

    const duration = this.options.animation?.duration || 800
    const easing = this.options.animation?.easing || 'easeOut'

    this.animationController.start(
      duration,
      easing,
      (progress) => {
        this.animationProgress = progress
        this.render()
      },
      onComplete
    )
  }

  abstract render(): void

  update(data: ChartData, options?: Partial<ChartOptions>): void {
    this.data = data
    if (options) {
      this.options = { ...this.options, ...options }
      if (options.theme) {
        this.theme = getTheme(options.theme)
      }
    }
    this.startAnimation()
  }

  resize(): void {
    this.updateDimensions()
    this.render()
  }

  destroy(): void {
    this.animationController.stop()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    if (this.tooltipElement) {
      this.tooltipElement.remove()
      this.tooltipElement = null
    }
    this.canvas.remove()
  }

  toImage(): string {
    return this.canvas.toDataURL('image/png')
  }

  abstract toCode(): string
}
