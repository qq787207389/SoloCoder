import { ITEM_SIZE, COLOR, ItemType, PlatformData, IcePillarData, Vec2, GRAVITY, MAX_FALL } from '../types'
import { Player } from '../entities/Player'
import { AudioManager } from './AudioManager'
import { ParticleSystem } from './ParticleSystem'

export class Item {
  x: number
  y: number
  vy: number = 0
  w: number = ITEM_SIZE
  h: number = ITEM_SIZE
  type: ItemType
  life: number = 300
  grounded: boolean = false
  animFrame: number = 0

  constructor(x: number, y: number, type: ItemType) {
    this.x = x
    this.y = y
    this.type = type
  }

  update(platforms: PlatformData[], pillars: IcePillarData[]) {
    this.animFrame++
    this.life--
    if (!this.grounded) {
      this.vy += GRAVITY
      if (this.vy > MAX_FALL) this.vy = MAX_FALL
      this.y += this.vy
      for (const p of platforms) {
        if (this.x + this.w > p.x && this.x < p.x + p.w &&
            this.y + this.h > p.y && this.y + this.h < p.y + p.h + 8 &&
            this.vy > 0) {
          this.y = p.y - this.h
          this.vy = 0
          this.grounded = true
        }
      }
      if (this.y + this.h > 320) {
        this.y = 320 - this.h
        this.vy = 0
        this.grounded = true
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const x = Math.round(this.x)
    const y = Math.round(this.y) + Math.sin(this.animFrame * 0.1) * 2

    let color: string
    let highlight: string
    switch (this.type) {
      case 'red': color = COLOR.RED_POTION; highlight = '#ff8080'; break
      case 'blue': color = COLOR.BLUE_POTION; highlight = '#80b0ff'; break
      case 'yellow': color = COLOR.YELLOW_POTION; highlight = '#ffe880'; break
    }

    ctx.fillStyle = color
    ctx.fillRect(x, y + 2, this.w, this.h - 2)
    ctx.fillStyle = highlight
    ctx.fillRect(x + 1, y + 3, this.w - 4, 3)
    ctx.fillStyle = '#e0e0e0'
    ctx.fillRect(x + 2, y, this.w - 4, 3)
    ctx.fillStyle = '#c0c0c0'
    ctx.fillRect(x + 3, y - 2, this.w - 6, 3)
  }
}

export class ItemSystem {
  items: Item[] = []

  spawn(x: number, y: number) {
    const types: ItemType[] = ['red', 'blue', 'yellow']
    const type = types[Math.floor(Math.random() * types.length)]
    this.items.push(new Item(x, y, type))
  }

  update(platforms: PlatformData[], pillars: IcePillarData[], player: Player, particles: ParticleSystem) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      item.update(platforms, pillars)

      if (item.life <= 0) {
        this.items.splice(i, 1)
        continue
      }

      if (player.x < item.x + item.w && player.x + player.w > item.x &&
          player.y < item.y + item.h && player.y + player.h > item.y) {
        player.addPowerUp(item.type)
        player.score += 100
        AudioManager.getInstance().playPowerUp()
        particles.emitSparkle(item.x + item.w / 2, item.y + item.h / 2, 8)
        this.items.splice(i, 1)
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const item of this.items) {
      item.draw(ctx)
    }
  }
}
