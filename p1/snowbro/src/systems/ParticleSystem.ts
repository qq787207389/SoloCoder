import { Particle, GRAVITY } from '../types'

export class ParticleSystem {
  particles: Particle[] = []

  emitSnow(x: number, y: number, count: number) {
    const colors = ['#f0f8ff', '#dceeff', '#c8e0f8', '#ffffff']
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.3 + Math.random() * 0.5,
        life: 60 + Math.random() * 40,
        maxLife: 0,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'snow',
      })
      this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life
    }
  }

  emitIce(x: number, y: number, count: number) {
    const colors = ['#8ad4f0', '#5ab8d8', '#c0efff', '#4090c0']
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20 + Math.random() * 20,
        maxLife: 0,
        size: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'ice',
      })
      this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life
    }
  }

  emitSparkle(x: number, y: number, count: number) {
    const colors = ['#ffcc00', '#ffe066', '#ffffff', '#fff4b0']
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: 30 + Math.random() * 20,
        maxLife: 0,
        size: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'sparkle',
      })
      this.particles[this.particles.length - 1].maxLife = this.particles[this.particles.length - 1].life
    }
  }

  emitStruggle(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -0.3,
      life: 40,
      maxLife: 40,
      size: 6,
      color: '#ff6030',
      type: 'struggle',
    })
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= 1

      if (p.type === 'ice') {
        p.vy += GRAVITY
        if (p.vy > 6) p.vy = 6
      }

      if (p.type === 'sparkle') {
        p.size = Math.max(0, (p.life / p.maxLife) * 4)
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      if (p.type === 'struggle') {
        const alpha = Math.min(1, p.life / p.maxLife * 2)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.font = '8px monospace'
        ctx.fillText('!!', p.x - 4, p.y)
        ctx.globalAlpha = 1
      } else {
        const alpha = Math.min(1, p.life / p.maxLife * 2)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        const s = Math.max(1, Math.round(p.size))
        ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s)
        ctx.globalAlpha = 1
      }
    }
  }
}
