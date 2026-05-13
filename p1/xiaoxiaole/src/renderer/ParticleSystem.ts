import { Particle, COLOR_MAP, CELL_SIZE, PADDING } from '../types'

export class ParticleSystem {
  private particles: Particle[] = []
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  emit(row: number, col: number, color: number, count: number = 15): void {
    const centerX = col * (CELL_SIZE + PADDING) + CELL_SIZE / 2 + PADDING
    const centerY = row * (CELL_SIZE + PADDING) + CELL_SIZE / 2 + PADDING

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 4
      
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: COLOR_MAP[color as keyof typeof COLOR_MAP],
        life: 1,
        maxLife: 1,
        size: 4 + Math.random() * 4
      })
    }
  }

  update(deltaTime: number = 0.016): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.2
      p.life -= deltaTime * 2
      
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  render(): void {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      this.ctx.globalAlpha = alpha
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      this.ctx.fill()
    }
    this.ctx.globalAlpha = 1
  }

  clear(): void {
    this.particles = []
  }

  hasParticles(): boolean {
    return this.particles.length > 0
  }
}
