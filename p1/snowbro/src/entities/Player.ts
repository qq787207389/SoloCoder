import {
  PLAYER_W, PLAYER_H, PLAYER_SPEED, PLAYER_JUMP,
  GRAVITY, MAX_FALL, SNOWBALL_SMALL_R, SNOWBALL_BIG_R,
  SNOWBALL_ROLL_R, SNOWBALL_BIG_ROLL_R,
  COLOR, PlatformData, IcePillarData, ItemType, PowerUp,
  ITEM_DURATION, Rect,
} from '../types'

export class Player {
  x: number = 64
  y: number = 200
  vx: number = 0
  vy: number = 0
  w: number = PLAYER_W
  h: number = PLAYER_H
  facing: number = 1
  grounded: boolean = false
  shooting: boolean = false
  shootTimer: number = 0
  kicking: boolean = false
  kickTimer: number = 0
  hurt: boolean = false
  hurtTimer: number = 0
  lives: number = 3
  score: number = 0
  powerUps: PowerUp[] = []
  shootCooldown: number = 0
  invincible: number = 0

  get speed(): number {
    const pu = this.powerUps.find(p => p.type === 'red')
    return pu ? PLAYER_SPEED * 1.5 : PLAYER_SPEED
  }

  get snowballR(): number {
    const pu = this.powerUps.find(p => p.type === 'blue')
    return pu ? SNOWBALL_BIG_R : SNOWBALL_SMALL_R
  }

  get snowballRollR(): number {
    const pu = this.powerUps.find(p => p.type === 'blue')
    return pu ? SNOWBALL_BIG_ROLL_R : SNOWBALL_ROLL_R
  }

  get penetrating(): boolean {
    return this.powerUps.some(p => p.type === 'yellow')
  }

  update(left: boolean, right: boolean, jump: boolean, shoot: boolean, kick: boolean, platforms: PlatformData[], pillars: IcePillarData[]) {
    if (this.hurtTimer > 0) {
      this.hurtTimer--
      if (this.hurtTimer <= 0) this.hurt = false
    }
    if (this.invincible > 0) this.invincible--
    if (this.shootCooldown > 0) this.shootCooldown--

    if (this.shootTimer > 0) {
      this.shootTimer--
      if (this.shootTimer <= 0) this.shooting = false
    }
    if (this.kickTimer > 0) {
      this.kickTimer--
      if (this.kickTimer <= 0) this.kicking = false
    }

    if (!this.hurt) {
      this.vx = 0
      if (left) { this.vx = -this.speed; this.facing = -1 }
      if (right) { this.vx = this.speed; this.facing = 1 }
      if (jump && this.grounded) {
        this.vy = PLAYER_JUMP
        this.grounded = false
      }
    }

    this.vy += GRAVITY
    if (this.vy > MAX_FALL) this.vy = MAX_FALL

    this.x += this.vx
    this.resolveCollisionX(platforms, pillars)

    this.y += this.vy
    this.grounded = false
    this.resolveCollisionY(platforms, pillars)

    if (this.x < 0) this.x = 0
    if (this.x + this.w > 480) this.x = 480 - this.w
    if (this.y < 0) { this.y = 0; this.vy = 0 }
    if (this.y + this.h > 320) { this.y = 320 - this.h; this.vy = 0; this.grounded = true }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      this.powerUps[i].timer--
      if (this.powerUps[i].timer <= 0) {
        this.powerUps.splice(i, 1)
      }
    }
  }

  tryShoot(): boolean {
    if (this.shootCooldown <= 0 && !this.hurt) {
      this.shooting = true
      this.shootTimer = 10
      this.shootCooldown = 12
      return true
    }
    return false
  }

  tryKick(): boolean {
    if (!this.hurt && !this.kicking) {
      this.kicking = true
      this.kickTimer = 12
      return true
    }
    return false
  }

  takeDamage() {
    if (this.invincible > 0) return
    this.hurt = true
    this.hurtTimer = 40
    this.invincible = 90
    this.vy = -3
    this.vx = -this.facing * 2
    this.lives--
  }

  addPowerUp(type: ItemType) {
    const existing = this.powerUps.find(p => p.type === type)
    if (existing) {
      existing.timer = ITEM_DURATION
    } else {
      this.powerUps.push({ type, timer: ITEM_DURATION, maxTimer: ITEM_DURATION })
    }
  }

  private rect(): Rect {
    return { x: this.x, y: this.y, w: this.w, h: this.h }
  }

  private resolveCollisionX(platforms: PlatformData[], pillars: IcePillarData[]) {
    const pr = this.rect()
    for (const p of platforms) {
      if (this.overlaps(pr, p)) {
        if (this.vx > 0) {
          this.x = p.x - this.w
        } else if (this.vx < 0) {
          this.x = p.x + p.w
        }
      }
    }
    for (const pil of pillars) {
      const pilRect: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
      if (this.overlaps(pr, pilRect)) {
        if (this.vx > 0) {
          this.x = pilRect.x - this.w
        } else if (this.vx < 0) {
          this.x = pilRect.x + pilRect.w
        }
      }
    }
  }

  private resolveCollisionY(platforms: PlatformData[], pillars: IcePillarData[]) {
    const pr = this.rect()
    for (const p of platforms) {
      if (this.overlaps(pr, p)) {
        if (this.vy > 0) {
          this.y = p.y - this.h
          this.vy = 0
          this.grounded = true
        } else if (this.vy < 0) {
          this.y = p.y + p.h
          this.vy = 0
        }
      }
    }
    for (const pil of pillars) {
      const pilRect: Rect = { x: pil.x, y: pil.y, w: 16, h: pil.h }
      if (this.overlaps(pr, pilRect)) {
        if (this.vy > 0) {
          this.y = pilRect.y - this.h
          this.vy = 0
          this.grounded = true
        } else if (this.vy < 0) {
          this.y = pilRect.y + pilRect.h
          this.vy = 0
        }
      }
    }
  }

  private overlaps(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.invincible > 0 && Math.floor(this.invincible / 3) % 2 === 0) return

    const x = Math.round(this.x)
    const y = Math.round(this.y)
    const cx = x + this.w / 2

    ctx.save()
    if (this.kicking) {
      ctx.translate(cx, y + this.h)
      ctx.scale(this.facing, 1)
      ctx.translate(-cx, -(y + this.h))
    }

    ctx.fillStyle = COLOR.PLAYER_BODY
    const bodyTop = y + 4
    ctx.beginPath()
    ctx.arc(cx, bodyTop + 6, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLOR.PLAYER_BODY
    ctx.fillRect(x + 3, bodyTop + 8, 8, 8)

    ctx.fillStyle = COLOR.PLAYER_SHADOW
    ctx.fillRect(x + 3, bodyTop + 12, 8, 4)

    if (this.kicking) {
      ctx.fillStyle = COLOR.PLAYER_BODY
      const legY = y + this.h - 4
      ctx.fillRect(x + 2, legY, 4, 6)
      ctx.fillRect(x + 10, legY - 2, 8, 4)
    } else {
      ctx.fillStyle = COLOR.PLAYER_BODY
      ctx.fillRect(x + 3, y + this.h - 4, 4, 4)
      ctx.fillRect(x + 7, y + this.h - 4, 4, 4)
    }

    ctx.fillStyle = COLOR.PLAYER_HAT
    ctx.fillRect(x + 2, y + 1, 10, 4)
    ctx.fillRect(x + 4, y - 3, 6, 5)

    ctx.fillStyle = COLOR.PLAYER_HAT_BAND
    ctx.fillRect(x + 2, y + 4, 10, 2)

    const eyeX = this.facing === 1 ? x + 8 : x + 4
    ctx.fillStyle = COLOR.PLAYER_EYES
    ctx.fillRect(eyeX, bodyTop + 3, 2, 2)

    if (this.facing === 1) {
      ctx.fillStyle = COLOR.PLAYER_NOSE
      ctx.fillRect(x + 11, bodyTop + 4, 3, 2)
    } else {
      ctx.fillStyle = COLOR.PLAYER_NOSE
      ctx.fillRect(x, bodyTop + 4, 3, 2)
    }

    if (this.shooting) {
      ctx.fillStyle = COLOR.SNOWBALL
      const sx = this.facing === 1 ? x + this.w + 1 : x - 5
      ctx.beginPath()
      ctx.arc(sx + 2, bodyTop + 5, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}
