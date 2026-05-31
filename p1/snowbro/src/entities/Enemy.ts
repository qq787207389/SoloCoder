import {
  ENEMY_W, ENEMY_H, GRAVITY, MAX_FALL, COLOR,
  PlatformData, IcePillarData, EnemyType, Rect, Vec2,
  THROW_SPEED, THROW_INTERVAL, SNOW_THROW_W, SNOW_THROW_H,
  BOSS_W, BOSS_H, BOSS_STUN_TIME, ESCAPE_TIME_NORMAL, ESCAPE_TIME_FAST,
} from '../types'

export class SnowThrow {
  x: number
  y: number
  vx: number
  vy: number
  w = SNOW_THROW_W
  h = SNOW_THROW_H
  life = 120

  constructor(x: number, y: number, dir: number) {
    this.x = x
    this.y = y
    this.vx = dir * THROW_SPEED
    this.vy = 0
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += GRAVITY * 0.3
    this.life--
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#b0d0e8'
    ctx.fillRect(Math.round(this.x), Math.round(this.y), this.w, this.h)
    ctx.fillStyle = '#e0f0ff'
    ctx.fillRect(Math.round(this.x) + 1, Math.round(this.y) + 1, this.w - 2, this.h - 2)
  }
}

export class Enemy {
  x: number
  y: number
  vx: number = 0
  vy: number = 0
  w: number = ENEMY_W
  h: number = ENEMY_H
  type: EnemyType
  facing: number = 1
  grounded: boolean = false
  alive: boolean = true
  wrapped: boolean = false
  escapeTimer: number = 0
  stunTimer: number = 0
  patrolDir: number = 1
  jumpTimer: number = 0
  throwTimer: number = 0
  throws: SnowThrow[] = []
  hp: number = 1
  animFrame: number = 0

  constructor(type: EnemyType, x: number, y: number) {
    this.type = type
    this.x = x
    this.y = y
    if (type === 'boss') {
      this.w = BOSS_W
      this.h = BOSS_H
      this.hp = 8
    }
    this.escapeTimer = this.getEscapeTime()
    this.throwTimer = THROW_INTERVAL
  }

  getEscapeTime(): number {
    if (this.type === 'fast') return ESCAPE_TIME_FAST
    if (this.type === 'boss') return 9999
    return ESCAPE_TIME_NORMAL
  }

  update(platforms: PlatformData[], pillars: IcePillarData[], playerX: number) {
    if (!this.alive) return

    if (this.wrapped) {
      this.animFrame++
      this.escapeTimer--
      if (this.escapeTimer <= 0) {
        this.wrapped = false
        this.escapeTimer = this.getEscapeTime()
      }
      return
    }

    if (this.stunTimer > 0) {
      this.stunTimer--
      return
    }

    this.animFrame++

    switch (this.type) {
      case 'patrol':
        this.patrol(platforms, pillars)
        break
      case 'jump':
        this.patrol(platforms, pillars)
        this.jumpTimer++
        if (this.jumpTimer > 140 && this.grounded) {
          this.vy = -4.5
          this.grounded = false
          this.jumpTimer = 0
        }
        break
      case 'throw':
        this.patrol(platforms, pillars)
        this.throwTimer++
        if (this.throwTimer >= THROW_INTERVAL) {
          const dir = playerX > this.x + this.w / 2 ? 1 : -1
          this.throws.push(new SnowThrow(
            this.x + (dir === 1 ? this.w : -SNOW_THROW_W),
            this.y + 4,
            dir
          ))
          this.throwTimer = 0
        }
        break
      case 'fast':
        this.vx = this.patrolDir * 0.9
        this.facing = this.patrolDir

        const fastNextX = this.x + this.vx
        const fastFootY = this.y + this.h + 2
        const fastCheckX = this.patrolDir === 1 ? fastNextX + this.w + 2 : fastNextX - 2

        let fastOnPlatform = false
        for (const p of platforms) {
          if (fastCheckX >= p.x && fastCheckX <= p.x + p.w &&
              fastFootY >= p.y && fastFootY <= p.y + p.h + 4) {
            fastOnPlatform = true
            break
          }
        }

        if (fastNextX < 0 || fastNextX + this.w > 480) {
          this.patrolDir *= -1
          break
        }
        if (this.grounded && !fastOnPlatform) {
          this.patrolDir *= -1
          break
        }
        for (const pil of pillars) {
          const pilRect: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
          const nextRect: Rect = { x: fastNextX, y: this.y, w: this.w, h: this.h }
          if (this.overlaps(nextRect, pilRect)) {
            this.patrolDir *= -1
            break
          }
        }
        break
      case 'boss':
        this.vx = this.patrolDir * 0.4
        this.facing = this.patrolDir

        const bossNextX = this.x + this.vx
        if (bossNextX < 0 || bossNextX + this.w > 480) {
          this.patrolDir *= -1
          break
        }
        for (const pil of pillars) {
          const pilRect: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
          const nextRect: Rect = { x: bossNextX, y: this.y, w: this.w, h: this.h }
          if (this.overlaps(nextRect, pilRect)) {
            this.patrolDir *= -1
            break
          }
        }
        break
    }

    this.vy += GRAVITY
    if (this.vy > MAX_FALL) this.vy = MAX_FALL

    this.x += this.vx
    this.resolveX(platforms, pillars)
    this.y += this.vy
    this.grounded = false
    this.resolveY(platforms, pillars)

    if (this.x < 0) this.x = 0
    if (this.x + this.w > 480) this.x = 480 - this.w
    if (this.y + this.h > 320) { this.y = 320 - this.h; this.vy = 0; this.grounded = true }
    if (this.y < 0) { this.y = 0; this.vy = 0 }

    for (let i = this.throws.length - 1; i >= 0; i--) {
      this.throws[i].update()
      if (this.throws[i].life <= 0 || this.throws[i].x < -20 || this.throws[i].x > 500) {
        this.throws.splice(i, 1)
      }
    }
  }

  private patrol(platforms: PlatformData[], pillars: IcePillarData[]) {
    this.vx = this.patrolDir * 0.5
    this.facing = this.patrolDir

    const nextX = this.x + this.vx
    const footY = this.y + this.h + 2
    const checkX = this.patrolDir === 1 ? nextX + this.w + 2 : nextX - 2

    let onPlatform = false
    for (const p of platforms) {
      if (checkX >= p.x && checkX <= p.x + p.w &&
          footY >= p.y && footY <= p.y + p.h + 4) {
        onPlatform = true
        break
      }
    }

    if (nextX < 0 || nextX + this.w > 480) {
      this.patrolDir *= -1
      return
    }

    if (this.grounded && !onPlatform) {
      this.patrolDir *= -1
      return
    }

    for (const pil of pillars) {
      const pilRect: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
      const nextRect: Rect = { x: nextX, y: this.y, w: this.w, h: this.h }
      if (this.overlaps(nextRect, pilRect)) {
        this.patrolDir *= -1
        return
      }
    }
  }

  wrap() {
    this.wrapped = true
    this.escapeTimer = this.getEscapeTime()
    this.vx = 0
    this.vy = 0
    this.throws = []
  }

  unwrap() {
    this.wrapped = false
    this.escapeTimer = this.getEscapeTime()
  }

  stun() {
    this.stunTimer = BOSS_STUN_TIME
    this.hp--
  }

  get center(): Vec2 {
    return { x: this.x + this.w / 2, y: this.y + this.h / 2 }
  }

  get rect(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h }
  }

  private resolveX(platforms: PlatformData[], pillars: IcePillarData[]) {
    const pr = this.rect
    for (const p of platforms) {
      if (this.overlaps(pr, p)) {
        if (this.vx > 0) this.x = p.x - this.w
        else if (this.vx < 0) this.x = p.x + p.w
      }
    }
    for (const pil of pillars) {
      const r: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
      if (this.overlaps(pr, r)) {
        if (this.vx > 0) this.x = r.x - this.w
        else if (this.vx < 0) this.x = r.x + r.w
      }
    }
  }

  private resolveY(platforms: PlatformData[], pillars: IcePillarData[]) {
    const pr = this.rect
    for (const p of platforms) {
      if (this.overlaps(pr, p)) {
        if (this.vy > 0) { this.y = p.y - this.h; this.vy = 0; this.grounded = true }
        else if (this.vy < 0) { this.y = p.y + p.h; this.vy = 0 }
      }
    }
  }

  private overlaps(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return

    if (this.wrapped) {
      this.drawWrapped(ctx)
      return
    }

    if (this.stunTimer > 0) {
      this.drawStunned(ctx)
      return
    }

    const x = Math.round(this.x)
    const y = Math.round(this.y)
    const color = this.getColor()
    const cx = x + this.w / 2

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, y + 6, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(x + 2, y + 8, this.w - 4, 6)

    ctx.fillStyle = '#1a1a2e'
    const ex1 = x + (this.facing === 1 ? 5 : 3)
    const ex2 = x + (this.facing === 1 ? 9 : 7)
    ctx.fillRect(ex1, y + 4, 2, 2)
    ctx.fillRect(ex2, y + 4, 2, 2)

    ctx.fillStyle = this.getDetailColor()
    if (this.type === 'boss') {
      ctx.fillRect(x + 4, y - 4, this.w - 8, 4)
      ctx.fillRect(x + 6, y - 8, this.w - 12, 5)
      ctx.fillStyle = '#ff2020'
      ctx.fillRect(x + 8, y - 6, 4, 3)
      ctx.fillRect(x + 16, y - 6, 4, 3)
    } else if (this.type === 'throw') {
      ctx.fillRect(x + (this.facing === 1 ? this.w : -4), y + 6, 4, 3)
    }

    for (const t of this.throws) {
      t.draw(ctx)
    }
  }

  private drawWrapped(ctx: CanvasRenderingContext2D) {
    const cx = Math.round(this.x + this.w / 2)
    const cy = Math.round(this.y + this.h / 2)
    const r = this.type === 'boss' ? 14 : 10

    ctx.fillStyle = COLOR.SNOWBALL
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLOR.SNOWBALL_SHINE
    ctx.beginPath()
    ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI * 2)
    ctx.fill()

    const shake = Math.sin(this.animFrame * 0.3) * 2
    ctx.fillStyle = COLOR.PLAYER_EYES
    ctx.fillRect(cx - 3 + shake, cy - 2, 2, 2)
    ctx.fillRect(cx + 2 + shake, cy - 2, 2, 2)
  }

  private drawStunned(ctx: CanvasRenderingContext2D) {
    const x = Math.round(this.x)
    const y = Math.round(this.y)
    const color = this.getColor()
    const cx = x + this.w / 2

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, y + 6, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(x + 2, y + 8, this.w - 4, 6)

    const blink = Math.floor(this.stunTimer / 4) % 2
    ctx.fillStyle = blink ? '#ffff00' : '#1a1a2e'
    ctx.fillRect(x + 5, y + 4, 2, 2)
    ctx.fillRect(x + 9, y + 4, 2, 2)

    ctx.fillStyle = '#ffff00'
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + this.animFrame * 0.1
      const sx = cx + Math.cos(angle) * 12
      const sy = y - 2 + Math.sin(angle) * 4
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2)
    }
  }

  private getColor(): string {
    switch (this.type) {
      case 'patrol': return COLOR.ENEMY_PATROL
      case 'jump': return COLOR.ENEMY_JUMP
      case 'throw': return COLOR.ENEMY_THROW
      case 'fast': return COLOR.ENEMY_FAST
      case 'boss': return COLOR.BOSS_BODY
    }
  }

  private getDetailColor(): string {
    switch (this.type) {
      case 'patrol': return '#b02020'
      case 'jump': return '#208020'
      case 'throw': return '#902090'
      case 'fast': return '#b08010'
      case 'boss': return '#602010'
    }
  }
}
