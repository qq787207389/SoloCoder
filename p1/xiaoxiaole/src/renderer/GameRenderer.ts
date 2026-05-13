import { GRID_SIZE, CELL_SIZE, PADDING, COLOR_MAP, SpecialType, Position } from '../types'
import { GameController } from '../core/GameController'
import { ParticleSystem } from './ParticleSystem'
import { AnimationManager, Easing } from './Easing'

export class GameRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private controller: GameController
  private particleSystem: ParticleSystem
  private animationManager: AnimationManager
  private dirtyRegions: Set<string> = new Set()
  private cellOffsets: Map<string, { x: number; y: number; scale: number }> = new Map()
  private hintCells: Position[] = []
  private animationFrame: number | null = null

  constructor(canvas: HTMLCanvasElement, controller: GameController) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.controller = controller
    this.particleSystem = new ParticleSystem(canvas)
    this.animationManager = new AnimationManager()
    
    this.canvas.width = GRID_SIZE * (CELL_SIZE + PADDING) + PADDING
    this.canvas.height = GRID_SIZE * (CELL_SIZE + PADDING) + PADDING
    
    this.setupEvents()
    this.markAllDirty()
  }

  private setupEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const col = Math.floor((x - PADDING) / (CELL_SIZE + PADDING))
      const row = Math.floor((y - PADDING) / (CELL_SIZE + PADDING))
      
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const prevSelected = this.controller.state.selectedCell
        this.controller.selectCell({ row, col })
        this.markCellDirty(row, col)
        if (prevSelected) {
          this.markCellDirty(prevSelected.row, prevSelected.col)
        }
        this.hintCells = []
      }
    })
  }

  private markAllDirty(): void {
    this.dirtyRegions.add('all')
  }

  private markCellDirty(row: number, col: number): void {
    this.dirtyRegions.add(`${row},${col}`)
  }

  private clearDirtyRegions(): void {
    const regions = Array.from(this.dirtyRegions)
    for (const region of regions) {
      if (region === 'all') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        return
      }
      const [row, col] = region.split(',').map(Number)
      const x = col * (CELL_SIZE + PADDING)
      const y = row * (CELL_SIZE + PADDING)
      this.ctx.clearRect(x, y, CELL_SIZE + PADDING * 2, CELL_SIZE + PADDING * 2)
    }
  }

  private drawCell(row: number, col: number): void {
    const cell = this.controller.grid.grid[row][col]
    const x = col * (CELL_SIZE + PADDING) + PADDING
    const y = row * (CELL_SIZE + PADDING) + PADDING
    
    const offsetKey = `${row},${col}`
    const offset = this.cellOffsets.get(offsetKey) || { x: 0, y: 0, scale: 1 }
    
    const drawX = x + offset.x
    const drawY = y + offset.y
    const scale = offset.scale

    this.ctx.save()
    this.ctx.translate(drawX + CELL_SIZE / 2, drawY + CELL_SIZE / 2)
    this.ctx.scale(scale, scale)
    this.ctx.translate(-(drawX + CELL_SIZE / 2), -(drawY + CELL_SIZE / 2))

    this.ctx.globalAlpha = 1

    const isSelected = this.controller.state.selectedCell &&
      this.controller.state.selectedCell.row === row &&
      this.controller.state.selectedCell.col === col
    
    const isHint = this.hintCells.some(h => h.row === row && h.col === col)

    if (isSelected) {
      this.ctx.strokeStyle = '#FFD700'
      this.ctx.lineWidth = 4
    } else if (isHint) {
      this.ctx.strokeStyle = '#00FF00'
      this.ctx.lineWidth = 3
    }

    if (cell.isMatched) {
      this.ctx.globalAlpha = 0.3
    }

    const color = COLOR_MAP[cell.color as keyof typeof COLOR_MAP]
    
    const gradient = this.ctx.createRadialGradient(
      drawX + CELL_SIZE / 2, drawY + CELL_SIZE / 2, 0,
      drawX + CELL_SIZE / 2, drawY + CELL_SIZE / 2, CELL_SIZE / 2
    )
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, this.darkenColor(color, 30))

    this.ctx.fillStyle = gradient
    this.roundRect(drawX, drawY, CELL_SIZE, CELL_SIZE, 8)
    this.ctx.fill()

    if (isSelected || isHint) {
      this.roundRect(drawX + 2, drawY + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6)
      this.ctx.stroke()
    }

    this.drawSpecialOverlay(drawX, drawY, cell.special)

    this.ctx.restore()
  }

  private drawSpecialOverlay(x: number, y: number, special: SpecialType): void {
    const centerX = x + CELL_SIZE / 2
    const centerY = y + CELL_SIZE / 2
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    
    switch (special) {
      case SpecialType.HORIZONTAL_ROCKET:
        this.ctx.fillRect(x + 10, centerY - 3, CELL_SIZE - 20, 6)
        this.ctx.beginPath()
        this.ctx.moveTo(x + CELL_SIZE - 8, centerY - 8)
        this.ctx.lineTo(x + CELL_SIZE - 2, centerY)
        this.ctx.lineTo(x + CELL_SIZE - 8, centerY + 8)
        this.ctx.fill()
        break
        
      case SpecialType.VERTICAL_ROCKET:
        this.ctx.fillRect(centerX - 3, y + 10, 6, CELL_SIZE - 20)
        this.ctx.beginPath()
        this.ctx.moveTo(centerX - 8, y + 8)
        this.ctx.lineTo(centerX, y + 2)
        this.ctx.lineTo(centerX + 8, y + 8)
        this.ctx.fill()
        break
        
      case SpecialType.BOMB:
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.fillStyle = '#333'
        this.ctx.beginPath()
        this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
        this.ctx.fill()
        break
        
      case SpecialType.RAINBOW:
        const colors = ['#FF6B6B', '#FFEAA7', '#96CEB4', '#4ECDC4', '#45B7D1', '#DDA0DD']
        for (let i = 0; i < 6; i++) {
          this.ctx.fillStyle = colors[i]
          this.ctx.beginPath()
          const startAngle = (i / 6) * Math.PI * 2
          const endAngle = ((i + 1) / 6) * Math.PI * 2
          this.ctx.moveTo(centerX, centerY)
          this.ctx.arc(centerX, centerY, 18, startAngle, endAngle)
          this.ctx.fill()
        }
        break
    }
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount)
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount)
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + w - r, y)
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    this.ctx.lineTo(x + w, y + h - r)
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    this.ctx.lineTo(x + r, y + h)
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    this.ctx.lineTo(x, y + r)
    this.ctx.quadraticCurveTo(x, y, x + r, y)
    this.ctx.closePath()
  }

  private render(): void {
    this.animationManager.update()
    this.particleSystem.update()
    
    if (this.dirtyRegions.size === 0) {
      this.particleSystem.render()
      return
    }

    const regions = new Set(this.dirtyRegions)
    this.clearDirtyRegions()
    
    if (regions.has('all')) {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          this.drawCell(row, col)
        }
      }
    } else {
      for (const region of regions) {
        const [row, col] = region.split(',').map(Number)
        this.drawCell(row, col)
      }
    }

    this.particleSystem.render()
    this.dirtyRegions.clear()
  }

  public start(): void {
    const loop = () => {
      this.render()
      this.animationFrame = requestAnimationFrame(loop)
    }
    loop()
  }

  public stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  public refresh(): void {
    this.markAllDirty()
  }

  public emitParticles(row: number, col: number, color: number): void {
    this.particleSystem.emit(row, col, color)
  }

  public animateCellPop(row: number, col: number): void {
    const key = `pop_${row}_${col}`
    this.animationManager.animate(
      key,
      1,
      1.2,
      150,
      Easing.easeOutQuad,
      (value) => {
        this.cellOffsets.set(`${row},${col}`, { x: 0, y: 0, scale: value })
        this.markCellDirty(row, col)
      },
      () => {
        this.animationManager.animate(
          key + '_back',
          1.2,
          1,
          150,
          Easing.easeInQuad,
          (value) => {
            this.cellOffsets.set(`${row},${col}`, { x: 0, y: 0, scale: value })
            this.markCellDirty(row, col)
          },
          () => {
            this.cellOffsets.delete(`${row},${col}`)
          }
        )
      }
    )
  }

  public setHintCells(cells: Position[]): void {
    this.hintCells = cells
    for (const cell of cells) {
      this.markCellDirty(cell.row, cell.col)
    }
  }
}
