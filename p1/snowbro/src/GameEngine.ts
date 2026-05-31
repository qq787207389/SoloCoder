import { CANVAS_W, CANVAS_H, COLOR, PlatformData, IcePillarData, EnemyType, EnemySpawn, GameState, LevelData, FLOAT_SPEED, FLOAT_RANGE } from './types'
import { InputManager } from './engine/InputManager'
import { Player } from './entities/Player'
import { Enemy, SnowThrow } from './entities/Enemy'
import { Snowball, SnowballSystem } from './systems/SnowballSystem'
import { ItemSystem } from './systems/ItemSystem'
import { ParticleSystem } from './systems/ParticleSystem'
import { AudioManager } from './systems/AudioManager'
import { HUD, TitleScreen, GameOverScreen, StageClearScreen } from './ui/Screens'
import { LEVELS } from './data/levels'

export class GameEngine {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  input: InputManager
  audio: AudioManager
  player: Player
  enemies: Enemy[] = []
  snowballSystem: SnowballSystem
  itemSystem: ItemSystem
  particles: ParticleSystem
  hud: HUD
  titleScreen: TitleScreen
  gameOverScreen: GameOverScreen
  stageClearScreen: StageClearScreen
  gameState: GameState = 'title'
  currentLevel: number = 0
  platforms: PlatformData[] = []
  pillars: IcePillarData[] = []
  chainCount: number = 0
  chainMax: number = 0
  stageClearTimer: number = 0
  bgSnowOffset: number = 0
  frameCount: number = 0
  floatOffsets: number[] = []
  scaleFactor: number = 1
  offsetX: number = 0
  offsetY: number = 0

  constructor() {
    this.canvas = document.getElementById('game') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.canvas.width = CANVAS_W
    this.canvas.height = CANVAS_H
    this.input = new InputManager()
    this.audio = AudioManager.getInstance()
    this.player = new Player()
    this.snowballSystem = new SnowballSystem()
    this.itemSystem = new ItemSystem()
    this.particles = new ParticleSystem()
    this.hud = new HUD()
    this.titleScreen = new TitleScreen()
    this.gameOverScreen = new GameOverScreen()
    this.stageClearScreen = new StageClearScreen()

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    const scaleX = window.innerWidth / CANVAS_W
    const scaleY = window.innerHeight / CANVAS_H
    this.scaleFactor = Math.min(scaleX, scaleY)
    this.canvas.style.width = `${Math.floor(CANVAS_W * this.scaleFactor)}px`
    this.canvas.style.height = `${Math.floor(CANVAS_H * this.scaleFactor)}px`
  }

  start() {
    this.gameLoop()
  }

  gameLoop() {
    this.update()
    this.draw()
    this.input.update()
    requestAnimationFrame(() => this.gameLoop())
  }

  update() {
    this.frameCount++
    this.bgSnowOffset += 0.3

    if (this.gameState === 'title') {
      this.titleScreen.update()
      if (this.input.justPressed('Enter') || this.input.justPressed('Space')) {
        this.audio.init()
        this.startGame()
      }
      return
    }

    if (this.gameState === 'gameover') {
      this.gameOverScreen.update()
      if (this.input.justPressed('Enter') || this.input.justPressed('Space')) {
        this.startGame()
      }
      return
    }

    if (this.gameState === 'stageclear') {
      this.stageClearScreen.update()
      this.particles.update()
      if (this.input.justPressed('Enter') || this.input.justPressed('Space')) {
        if (this.stageClearScreen.animFrame > 30) {
          this.nextLevel()
        }
      }
      return
    }

    const left = this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')
    const right = this.input.isDown('ArrowRight') || this.input.isDown('KeyD')
    const jump = this.input.isDown('ArrowUp') || this.input.isDown('KeyW')
    const shoot = this.input.justPressed('KeyZ') || this.input.justPressed('KeyJ')
    const kick = this.input.justPressed('KeyX') || this.input.justPressed('KeyK')

    this.updateFloatingPlatforms()

    this.player.update(left, right, jump, shoot, kick, this.platforms, this.pillars)

    if (shoot && this.player.tryShoot()) {
      const r = this.player.snowballR
      const sx = this.player.facing === 1 ? this.player.x + this.player.w + r : this.player.x - r
      const sy = this.player.y + 8
      this.snowballSystem.add(new Snowball(sx, sy, this.player.facing, r, this.player.penetrating))
      this.audio.playShoot()
    }

    if (kick) {
      const kickRangeX = this.player.facing === 1
        ? this.player.x + this.player.w
        : this.player.x - 28
      const kickRangeW = 28
      const kickRangeY = this.player.y - 6
      const kickRangeH = this.player.h + 12

      const rolling = this.snowballSystem.getRollingAt(
        kickRangeX,
        kickRangeY,
        kickRangeW,
        kickRangeH
      )
      if (rolling) {
        this.player.tryKick()
        rolling.kick(this.player.facing)
        this.particles.emitSnow(rolling.x, rolling.y, 4)
      }
    }

    for (const e of this.enemies) {
      e.update(this.platforms, this.pillars, this.player.x + this.player.w / 2)

      if (!e.wrapped && e.alive && e.stunTimer <= 0) {
        if (this.player.invincible <= 0) {
          if (this.player.x < e.x + e.w && this.player.x + this.player.w > e.x &&
              this.player.y < e.y + e.h && this.player.y + this.player.h > e.y) {
            this.player.takeDamage()
            this.audio.playHurt()
            this.chainCount = 0
            if (this.player.lives <= 0) {
              this.gameState = 'gameover'
              this.audio.playGameOver()
            }
          }
        }

        for (const t of e.throws) {
          if (this.player.invincible <= 0 &&
              this.player.x < t.x + t.w && this.player.x + this.player.w > t.x &&
              this.player.y < t.y + t.h && this.player.y + this.player.h > t.y) {
            this.player.takeDamage()
            this.audio.playHurt()
            this.chainCount = 0
            t.life = 0
            if (this.player.lives <= 0) {
              this.gameState = 'gameover'
              this.audio.playGameOver()
            }
          }
        }
      }

      if (e.type === 'boss' && e.hp <= 0 && e.alive) {
        e.alive = false
        this.player.score += 1000
        this.particles.emitIce(e.x + e.w / 2, e.y + e.h / 2, 20)
        this.particles.emitSparkle(e.x + e.w / 2, e.y + e.h / 2, 15)
        this.audio.playCrash()
      }

      if (e.wrapped && e.type !== 'boss') {
        if (this.frameCount % 30 === 0) {
          this.particles.emitStruggle(e.x + e.w / 2, e.y - 4)
        }
      }
    }

    const result = this.snowballSystem.update(this.platforms, this.pillars, this.enemies, this.particles)

    for (const e of result.killedEnemies) {
      this.player.score += 200 * (this.chainCount + 1)
      this.chainCount++
      if (this.chainCount > this.chainMax) this.chainMax = this.chainCount
    }

    for (let i = 0; i < result.chainKills; i++) {
      this.player.score += 500 * (this.chainCount + 1)
      this.chainCount++
      if (this.chainCount > this.chainMax) this.chainMax = this.chainCount
      this.particles.emitSparkle(CANVAS_W / 2, CANVAS_H / 2, 3)
    }

    for (const pos of result.wallBreakItems) {
      this.itemSystem.spawn(pos.x, pos.y)
    }

    for (const e of result.escapedEnemies) {
      this.chainCount = 0
    }

    this.itemSystem.update(this.platforms, this.pillars, this.player, this.particles)
    this.particles.update()

    const allDead = this.enemies.every(e => !e.alive)
    const anyWrapped = this.enemies.some(e => e.alive && e.wrapped)

    if (allDead && !anyWrapped) {
      this.gameState = 'stageclear'
      this.chainCount = 0
      this.audio.playStageClear()
    }
  }

  draw() {
    const ctx = this.ctx
    ctx.imageSmoothingEnabled = false

    if (this.gameState === 'title') {
      this.titleScreen.draw(ctx)
      return
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    gradient.addColorStop(0, COLOR.SKY_TOP)
    gradient.addColorStop(1, COLOR.SKY_BOT)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    this.drawBgSnow(ctx)
    this.drawPlatforms(ctx)
    this.drawPillars(ctx)
    this.itemSystem.draw(ctx)
    this.snowballSystem.draw(ctx)
    for (const e of this.enemies) {
      e.draw(ctx)
    }
    this.player.draw(ctx)
    this.particles.draw(ctx)
    this.hud.draw(ctx, this.player, this.currentLevel + 1, this.chainMax, this.gameState, this.stageClearTimer)

    if (this.gameState === 'gameover') {
      this.gameOverScreen.draw(ctx, this.player.score)
    }
    if (this.gameState === 'stageclear') {
      this.stageClearScreen.draw(ctx, this.player.score, this.chainMax)
    }
  }

  drawBgSnow(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    for (let i = 0; i < 20; i++) {
      const x = (i * 67 + this.bgSnowOffset * (0.5 + (i % 3) * 0.2)) % CANVAS_W
      const y = (i * 53 + this.bgSnowOffset * (0.3 + (i % 4) * 0.15)) % CANVAS_H
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2)
    }
  }

  drawPlatforms(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i]
      const floatY = this.getFloatOffset(i)

      if (p.y === 0 && p.type === 'ice') {
        ctx.fillStyle = COLOR.PILLAR
        ctx.fillRect(p.x, p.y, p.w, p.h)
        ctx.fillStyle = COLOR.PILLAR_LIGHT
        ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3)
        continue
      }

      ctx.fillStyle = COLOR.ICE
      ctx.fillRect(p.x, p.y + floatY, p.w, p.h)

      ctx.fillStyle = COLOR.ICE_LIGHT
      ctx.fillRect(p.x, p.y + floatY, p.w, 2)

      ctx.fillStyle = COLOR.ICE_DARK
      ctx.fillRect(p.x, p.y + floatY + p.h - 2, p.w, 2)

      if (p.type === 'float') {
        ctx.fillStyle = 'rgba(200,240,255,0.3)'
        for (let j = 0; j < p.w; j += 6) {
          ctx.fillRect(p.x + j, p.y + floatY + 3, 3, 1)
        }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      for (let j = 4; j < p.w - 4; j += 8) {
        ctx.fillRect(p.x + j, p.y + floatY + 2, 1, 1)
      }
    }
  }

  drawPillars(ctx: CanvasRenderingContext2D) {
    for (const pil of this.pillars) {
      ctx.fillStyle = COLOR.PILLAR
      ctx.fillRect(pil.x, pil.y, 16, pil.h)

      ctx.fillStyle = COLOR.PILLAR_LIGHT
      ctx.fillRect(pil.x + 2, pil.y, 4, pil.h)
      ctx.fillRect(pil.x, pil.y, 16, 3)

      ctx.fillStyle = COLOR.ICE_DARK
      ctx.fillRect(pil.x + 14, pil.y, 2, pil.h)
      ctx.fillRect(pil.x, pil.y + pil.h - 2, 16, 2)

      for (let j = 8; j < pil.h - 8; j += 12) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(pil.x + 4, pil.y + j, 3, 2)
        ctx.fillRect(pil.x + 10, pil.y + j + 6, 3, 2)
      }
    }
  }

  startGame() {
    this.gameState = 'playing'
    this.currentLevel = 0
    this.chainMax = 0
    this.chainCount = 0
    this.player = new Player()
    this.loadLevel(this.currentLevel)
  }

  loadLevel(index: number) {
    const data = LEVELS[index % LEVELS.length]
    this.platforms = data.platforms.map((p: PlatformData) => ({ ...p }))
    this.pillars = data.icePillars.map((p: IcePillarData) => ({ ...p }))
    this.enemies = data.enemies.map((e: EnemySpawn) => new Enemy(e.type, e.x, e.y))
    this.snowballSystem.snowballs = []
    this.itemSystem.items = []
    this.particles.particles = []
    this.floatOffsets = new Array(this.platforms.length).fill(0)
    this.player.x = 64
    this.player.y = 200
    this.player.vx = 0
    this.player.vy = 0
    this.player.invincible = 60
    this.chainCount = 0
  }

  nextLevel() {
    this.currentLevel++
    if (this.currentLevel >= LEVELS.length) {
      this.currentLevel = 0
      this.player.score += 5000
    }
    this.loadLevel(this.currentLevel)
    this.gameState = 'playing'
  }

  updateFloatingPlatforms() {
    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i]
      if (p.type === 'float') {
        this.floatOffsets[i] = Math.sin(this.frameCount * FLOAT_SPEED * 0.02) * FLOAT_RANGE * 0.3
        const orig = LEVELS[this.currentLevel % LEVELS.length].platforms[i]
        if (orig) {
          p.y = orig.y + this.floatOffsets[i]
        }
      }
    }
  }

  getFloatOffset(index: number): number {
    return this.floatOffsets[index] || 0
  }
}
