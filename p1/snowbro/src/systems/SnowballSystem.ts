import {
  SNOWBALL_SPEED, KICK_SPEED, COLOR, SnowballState, Rect, Vec2,
  PlatformData, IcePillarData,
} from '../types'
import { Enemy } from '../entities/Enemy'
import { ParticleSystem } from './ParticleSystem'
import { AudioManager } from './AudioManager'

export class Snowball {
  x: number
  y: number
  vx: number = 0
  vy: number = 0
  r: number
  state: SnowballState = 'flying'
  enemy: Enemy | null = null
  escapeTimer: number = 0
  life: number = 300
  facing: number = 1
  chainCount: number = 0
  penetrating: boolean = false
  rollAnim: number = 0

  constructor(x: number, y: number, facing: number, r: number, penetrating: boolean = false) {
    this.x = x
    this.y = y
    this.r = r
    this.facing = facing
    this.vx = facing * SNOWBALL_SPEED
    this.vy = 0
    this.penetrating = penetrating
  }

  get rect(): Rect {
    return {
      x: this.x - this.r,
      y: this.y - this.r,
      w: this.r * 2,
      h: this.r * 2,
    }
  }

  update(platforms: PlatformData[], pillars: IcePillarData[], particles: ParticleSystem): { hitEnemy?: Enemy; wallBreak?: boolean; escaped?: Enemy } {
    this.rollAnim++
    const events: { hitEnemy?: Enemy; wallBreak?: boolean; escaped?: Enemy } = {}

    if (this.state === 'flying') {
      this.x += this.vx
      this.y += this.vy
      this.vy += 0.1

      if (Math.random() < 0.3) {
        particles.emitSnow(this.x, this.y, 1)
      }

      if (this.x < 0 || this.x > 480 || this.y > 340 || this.y < -20) {
        this.life = 0
      }
    }

    if (this.state === 'rolling') {
      this.escapeTimer--
      if (Math.random() < 0.15) {
        particles.emitSnow(this.x, this.y - this.r, 1)
      }
      if (this.escapeTimer <= 0) {
        if (this.enemy) {
          this.enemy.unwrap()
          events.escaped = this.enemy
        }
        particles.emitIce(this.x, this.y, 6)
        this.life = 0
      }
    }

    if (this.state === 'kicked') {
      this.x += this.vx
      this.y += this.vy

      if (Math.random() < 0.5) {
        particles.emitSnow(this.x, this.y, 2)
      }

      const audio = AudioManager.getInstance()
      if (this.rollAnim % 12 === 0) {
        audio.playRoll()
      }

      let hitWall = false
      if (this.x - this.r < 0) { hitWall = true }
      if (this.x + this.r > 480) { hitWall = true }
      for (const p of platforms) {
        if (this.rectOverlaps(this.rect, p)) {
          hitWall = true
          break
        }
      }
      for (const pil of pillars) {
        const pr: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
        if (this.rectOverlaps(this.rect, pr)) {
          hitWall = true
          break
        }
      }

      if (hitWall && !this.penetrating) {
        events.wallBreak = true
        particles.emitIce(this.x, this.y, 12)
        audio.playCrash()
        this.life = 0
      } else if (hitWall && this.penetrating) {
        if (this.x - this.r < 0) { this.vx = Math.abs(this.vx); this.x = this.r }
        if (this.x + this.r > 480) { this.vx = -Math.abs(this.vx); this.x = 480 - this.r }
        for (const pil of pillars) {
          const pr: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
          if (this.rectOverlaps(this.rect, pr)) {
            this.vx *= -1
            this.x += this.vx * 2
            break
          }
        }
      }

      if (this.x < -20 || this.x > 500 || this.y > 340) {
        this.life = 0
      }
    }

    this.life--
    return events
  }

  wrapEnemy(enemy: Enemy) {
    this.enemy = enemy
    enemy.wrap()
    this.state = 'rolling'
    this.vx = 0
    this.vy = 0
    this.r = this.type === 'boss' ? 14 : 10
    this.escapeTimer = enemy.getEscapeTime()
    this.x = enemy.x + enemy.w / 2
    this.y = enemy.y + enemy.h / 2
    AudioManager.getInstance().playShoot()
  }

  kick(facing: number) {
    this.state = 'kicked'
    this.vx = facing * KICK_SPEED
    this.vy = 0
    this.rollAnim = 0
    AudioManager.getInstance().playKick()
  }

  chainHit(enemy: Enemy) {
    this.chainCount++
    if (this.enemy) {
      this.enemy.alive = false
    }
    this.enemy = enemy
    enemy.wrap()
    this.state = 'rolling'
    this.vx = 0
    this.vy = 0
    this.r = 10
    this.escapeTimer = enemy.getEscapeTime()
    this.x = enemy.x + enemy.w / 2
    this.y = enemy.y + enemy.h / 2
    const pitch = 1 + this.chainCount * 0.3
    AudioManager.getInstance().playChain(pitch)
  }

  private get type(): string {
    return this.enemy?.type || 'patrol'
  }

  rectOverlaps(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = Math.round(this.x)
    const cy = Math.round(this.y)

    if (this.state === 'flying') {
      ctx.fillStyle = COLOR.SNOWBALL
      ctx.beginPath()
      ctx.arc(cx, cy, this.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = COLOR.SNOWBALL_SHINE
      ctx.beginPath()
      ctx.arc(cx - 1, cy - 1, Math.max(1, this.r / 2), 0, Math.PI * 2)
      ctx.fill()
      return
    }

    const shake = this.state === 'rolling' ? Math.sin(this.rollAnim * 0.3) * 1.5 : 0
    const drawR = Math.round(this.r)

    ctx.fillStyle = COLOR.SNOWBALL
    ctx.beginPath()
    ctx.arc(cx + shake, cy, drawR, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLOR.SNOWBALL_SHINE
    ctx.beginPath()
    ctx.arc(cx - 3 + shake, cy - 3, 2, 0, Math.PI * 2)
    ctx.fill()

    if (this.enemy) {
      const eyeShake = Math.sin(this.rollAnim * 0.4) * 2
      ctx.fillStyle = COLOR.PLAYER_EYES
      ctx.fillRect(cx - 3 + eyeShake, cy - 2, 2, 2)
      ctx.fillRect(cx + 2 + eyeShake, cy - 2, 2, 2)

      const escapeRatio = 1 - this.escapeTimer / (this.enemy.getEscapeTime() || 1)
      if (escapeRatio > 0.5 && this.state === 'rolling') {
        ctx.fillStyle = '#ff4040'
        const barW = drawR * 2
        ctx.fillRect(cx - drawR, cy - drawR - 4, barW, 2)
        ctx.fillStyle = '#40ff40'
        ctx.fillRect(cx - drawR, cy - drawR - 4, barW * (1 - escapeRatio), 2)
      }
    }

    if (this.state === 'kicked') {
      const trailLen = 4
      for (let i = 1; i <= trailLen; i++) {
        const tx = cx - this.vx * i * 2
        const alpha = 0.3 - i * 0.06
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.fillStyle = COLOR.SNOWBALL
        ctx.beginPath()
        ctx.arc(tx, cy, drawR - i, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }
}

export class SnowballSystem {
  snowballs: Snowball[] = []

  add(snowball: Snowball) {
    this.snowballs.push(snowball)
  }

  update(platforms: PlatformData[], pillars: IcePillarData[], enemies: Enemy[], particles: ParticleSystem): { killedEnemies: Enemy[]; wallBreakItems: Vec2[]; escapedEnemies: Enemy[]; chainKills: number } {
    const killedEnemies: Enemy[] = []
    const wallBreakItems: Vec2[] = []
    const escapedEnemies: Enemy[] = []
    let chainKills = 0

    for (let i = this.snowballs.length - 1; i >= 0; i--) {
      const sb = this.snowballs[i]
      const events = sb.update(platforms, pillars, particles)

      if (events.escaped) {
        escapedEnemies.push(events.escaped)
      }

      if (events.wallBreak) {
        wallBreakItems.push({ x: sb.x, y: sb.y })
        if (sb.enemy) {
          sb.enemy.alive = false
          killedEnemies.push(sb.enemy)
        }
      }

      if (sb.state === 'flying') {
        for (const e of enemies) {
          if (!e.alive || e.wrapped) continue
          if (e.type === 'boss') {
            const dist = Math.hypot(sb.x - e.center.x, sb.y - e.center.y)
            if (dist < sb.r + e.w / 2) {
              e.stun()
              sb.life = 0
              particles.emitIce(sb.x, sb.y, 6)
              AudioManager.getInstance().playCrash()
              break
            }
          } else {
            if (sb.rectOverlaps(sb.rect, e.rect)) {
              sb.wrapEnemy(e)
              particles.emitSnow(sb.x, sb.y, 4)
              break
            }
          }
        }
      }

      if (sb.state === 'kicked') {
        for (const e of enemies) {
          if (!e.alive || e.wrapped || e === sb.enemy) continue
          if (sb.rectOverlaps(sb.rect, e.rect)) {
            const prevEnemy = sb.enemy
            sb.chainHit(e)
            if (prevEnemy) {
              killedEnemies.push(prevEnemy)
            }
            chainKills++
            particles.emitSparkle(sb.x, sb.y, 6)
            break
          }
        }
      }

      if (sb.life <= 0) {
        this.snowballs.splice(i, 1)
      }
    }

    return { killedEnemies, wallBreakItems, escapedEnemies, chainKills }
  }

  getRollingAt(x: number, y: number, w: number, h: number): Snowball | null {
    for (const sb of this.snowballs) {
      if (sb.state !== 'rolling') continue
      const sr = sb.rect
      if (x < sr.x + sr.w && x + w > sr.x && y < sr.y + sr.h && y + h > sr.y) {
        return sb
      }
    }
    return null
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const sb of this.snowballs) {
      sb.draw(ctx)
    }
  }
}
