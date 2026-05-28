import Phaser from 'phaser'
import {
  TileType,
  PowerUpType,
  GameMode,
  AIType,
  Player,
  Bomb,
  Explosion,
  PowerUp,
  GameState,
  DEFAULT_CONFIG,
} from '../types/game'
import { generateMap, getSpawnPositions } from '../utils/mapGenerator'
import { AIController } from './AIController'

interface PlayerMoveState {
  isMoving: boolean
  targetX: number
  targetY: number
  startX: number
  startY: number
  progress: number
  direction: { dx: number; dy: number }
}

export default class GameScene extends Phaser.Scene {
  private gameState!: GameState
  private playerSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private bombSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()
  private explosionSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()
  private powerUpSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()
  private tileGraphics!: Phaser.GameObjects.Graphics
  private aiControllers: Map<string, AIController> = new Map()
  private keys: Map<string, Phaser.Input.Keyboard.Key> = new Map()
  private lastTime: number = 0
  private onGameEnd?: (stats: any) => void
  private playerMoveStates: Map<string, PlayerMoveState> = new Map()

  constructor() {
    super('GameScene')
  }

  init(data: any) {
    const mode = data.mode || GameMode.CLASSIC
    const playerCount = data.playerCount || 1
    const aiCount = data.aiCount || 3
    const aiDifficulty = data.aiDifficulty || AIType.SMART

    const map = generateMap(DEFAULT_CONFIG.mapWidth, DEFAULT_CONFIG.mapHeight, DEFAULT_CONFIG.boxDensity)
    const spawnPositions = getSpawnPositions(DEFAULT_CONFIG.mapWidth, DEFAULT_CONFIG.mapHeight)

    const players: Player[] = []
    const colors = [0xff6b6b, 0x4ecdc4, 0xffd93d, 0x95e1a3, 0xa29bfe, 0xfd79a8, 0xe17055, 0x74b9ff]
    const names = ['P1', 'P2', 'P3', 'P4', 'AI1', 'AI2', 'AI3', 'AI4']

    for (let i = 0; i < playerCount; i++) {
      const pos = spawnPositions[i]
      players.push(this.createPlayer(`player_${i}`, names[i], pos.x, pos.y, colors[i], false))
    }

    for (let i = 0; i < aiCount; i++) {
      const idx = playerCount + i
      if (idx < spawnPositions.length) {
        const pos = spawnPositions[idx]
        const aiPlayer = this.createPlayer(
          `ai_${i}`,
          names[idx],
          pos.x,
          pos.y,
          colors[idx],
          true,
          aiDifficulty
        )
        players.push(aiPlayer)
      }
    }

    this.gameState = {
      mode,
      players,
      bombs: [],
      explosions: [],
      powerUps: [],
      map,
      fallingTiles: new Set(),
      warningTiles: new Set(),
      gameTime: 0,
      isGameOver: false,
      scores: {},
      roundTime: 120,
    }
  }

  private createPlayer(
    id: string,
    name: string,
    x: number,
    y: number,
    color: number,
    isAI: boolean,
    aiType?: AIType
  ): Player {
    return {
      id,
      name,
      x,
      y,
      color,
      isAI,
      aiType,
      team: 0,
      alive: true,
      bombCount: 0,
      maxBombs: DEFAULT_CONFIG.initialBombs,
      fireRange: DEFAULT_CONFIG.initialFireRange,
      speed: DEFAULT_CONFIG.playerSpeed,
      canKick: false,
      hasRemote: false,
      hasPierce: false,
      hasShield: false,
      isSlowed: false,
      kills: 0,
      deaths: 0,
      powerUpsCollected: 0,
      selfDestructs: 0,
    }
  }

  preload() {
    this.load.setBaseURL('https://labs.phaser.io')
    this.load.image('bomb', 'assets/sprites/shinyball.png')
  }

  create() {
    this.cameras.main.setBackgroundColor(0x1a1a2e)

    const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
    const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2

    this.tileGraphics = this.add.graphics()
    this.tileGraphics.x = offsetX
    this.tileGraphics.y = offsetY

    this.gameState.players.forEach((player) => {
      this.createPlayerSprite(player, offsetX, offsetY)
      if (player.isAI && player.aiType) {
        this.aiControllers.set(player.id, new AIController(player.id, player.aiType, this))
      }
    })

    this.setupInput()
    this.lastTime = this.time.now
  }

  private createPlayerSprite(player: Player, offsetX: number, offsetY: number) {
    const container = this.add.container(
      offsetX + player.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      offsetY + player.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2
    )

    const body = this.add.circle(0, 0, 16, player.color)
    body.setStrokeStyle(3, 0x000000)

    const eyes = this.add.graphics()
    eyes.fillStyle(0xffffff)
    eyes.fillCircle(-6, -4, 5)
    eyes.fillCircle(6, -4, 5)
    eyes.fillStyle(0x000000)
    eyes.fillCircle(-5, -4, 2)
    eyes.fillCircle(7, -4, 2)

    const nameText = this.add.text(0, -28, player.name, {
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    })
    nameText.setOrigin(0.5)

    container.add([body, eyes, nameText])
    this.playerSprites.set(player.id, container)
  }

  private setupInput() {
    const p1Keys = {
      up: this.input.keyboard!.addKey('W'),
      down: this.input.keyboard!.addKey('S'),
      left: this.input.keyboard!.addKey('A'),
      right: this.input.keyboard!.addKey('D'),
      bomb: this.input.keyboard!.addKey('SPACE'),
      remote: this.input.keyboard!.addKey('Q'),
    }
    this.keys.set('p1_up', p1Keys.up)
    this.keys.set('p1_down', p1Keys.down)
    this.keys.set('p1_left', p1Keys.left)
    this.keys.set('p1_right', p1Keys.right)
    this.keys.set('p1_bomb', p1Keys.bomb)
    this.keys.set('p1_remote', p1Keys.remote)

    const p2Keys = {
      up: this.input.keyboard!.addKey('UP'),
      down: this.input.keyboard!.addKey('DOWN'),
      left: this.input.keyboard!.addKey('LEFT'),
      right: this.input.keyboard!.addKey('RIGHT'),
      bomb: this.input.keyboard!.addKey('ENTER'),
      remote: this.input.keyboard!.addKey('CONTROL_RIGHT'),
    }
    this.keys.set('p2_up', p2Keys.up)
    this.keys.set('p2_down', p2Keys.down)
    this.keys.set('p2_left', p2Keys.left)
    this.keys.set('p2_right', p2Keys.right)
    this.keys.set('p2_bomb', p2Keys.bomb)
    this.keys.set('p2_remote', p2Keys.remote)
  }

  update() {
    if (this.gameState.isGameOver) return

    const deltaTime = this.time.now - this.lastTime
    this.lastTime = this.time.now

    this.gameState.gameTime += deltaTime / 1000

    this.updatePlayerMovement(deltaTime)
    this.handlePlayerInput()
    this.updateAI(deltaTime)
    this.updateBombs(deltaTime)
    this.updateExplosions(deltaTime)
    this.updateMovingBombs(deltaTime)
    this.checkCollisions()
    this.checkGameShrink()
    this.checkGameOver()

    this.render()
  }

  private updatePlayerMovement(deltaTime: number) {
    this.gameState.players.forEach((player) => {
      const moveState = this.playerMoveStates.get(player.id)
      if (moveState && moveState.isMoving) {
        const speed = player.isSlowed ? player.speed * 0.5 : player.speed
        const moveSpeed = speed * 0.008 * deltaTime
        moveState.progress = Math.min(moveState.progress + moveSpeed, 1)

        player.x = Phaser.Math.Linear(moveState.startX, moveState.targetX, moveState.progress)
        player.y = Phaser.Math.Linear(moveState.startY, moveState.targetY, moveState.progress)

        if (moveState.progress >= 1) {
          player.x = moveState.targetX
          player.y = moveState.targetY
          moveState.isMoving = false
          moveState.progress = 0

          const tileX = Math.floor(player.x + 0.5)
          const tileY = Math.floor(player.y + 0.5)
          this.handleTileEffect(player, tileX, tileY)
        }
      }
    })
  }

  private handlePlayerInput() {
    const p1 = this.gameState.players.find((p) => p.id === 'player_0')
    if (p1 && p1.alive) {
      const moveState = this.playerMoveStates.get(p1.id)
      if (!moveState || !moveState.isMoving) {
        let dx = 0,
          dy = 0

        if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_up')!)) dy = -1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_down')!)) dy = 1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_left')!)) dx = -1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_right')!)) dx = 1

        if (this.keys.get('p1_up')?.isDown && (moveState?.direction.dy !== -1 || !moveState?.isMoving)) dy = -1
        else if (this.keys.get('p1_down')?.isDown && (moveState?.direction.dy !== 1 || !moveState?.isMoving)) dy = 1
        else if (this.keys.get('p1_left')?.isDown && (moveState?.direction.dx !== -1 || !moveState?.isMoving)) dx = -1
        else if (this.keys.get('p1_right')?.isDown && (moveState?.direction.dx !== 1 || !moveState?.isMoving)) dx = 1

        if (dx !== 0 || dy !== 0) {
          this.startPlayerMove(p1, dx, dy)
        }
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_bomb')!)) {
        this.placeBomb(p1)
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.get('p1_remote')!)) {
        this.triggerRemoteBombs(p1)
      }
    }

    const p2 = this.gameState.players.find((p) => p.id === 'player_1')
    if (p2 && p2.alive) {
      const moveState = this.playerMoveStates.get(p2.id)
      if (!moveState || !moveState.isMoving) {
        let dx = 0,
          dy = 0

        if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_up')!)) dy = -1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_down')!)) dy = 1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_left')!)) dx = -1
        else if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_right')!)) dx = 1

        if (this.keys.get('p2_up')?.isDown && (moveState?.direction.dy !== -1 || !moveState?.isMoving)) dy = -1
        else if (this.keys.get('p2_down')?.isDown && (moveState?.direction.dy !== 1 || !moveState?.isMoving)) dy = 1
        else if (this.keys.get('p2_left')?.isDown && (moveState?.direction.dx !== -1 || !moveState?.isMoving)) dx = -1
        else if (this.keys.get('p2_right')?.isDown && (moveState?.direction.dx !== 1 || !moveState?.isMoving)) dx = 1

        if (dx !== 0 || dy !== 0) {
          this.startPlayerMove(p2, dx, dy)
        }
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_bomb')!)) {
        this.placeBomb(p2)
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.get('p2_remote')!)) {
        this.triggerRemoteBombs(p2)
      }
    }
  }

  private startPlayerMove(player: Player, dx: number, dy: number) {
    const tileX = Math.floor(player.x + 0.5)
    const tileY = Math.floor(player.y + 0.5)

    const newX = tileX + dx
    const newY = tileY + dy

    if (this.canMoveTo(newX, newY, player)) {
      this.playerMoveStates.set(player.id, {
        isMoving: true,
        startX: tileX,
        startY: tileY,
        targetX: newX,
        targetY: newY,
        progress: 0,
        direction: { dx, dy },
      })
    }
  }

  private movePlayer(player: Player, dx: number, dy: number) {
    this.startPlayerMove(player, dx, dy)
  }

  private canMoveTo(tileX: number, tileY: number, player: Player): boolean {
    const tx = Math.floor(tileX + 0.5)
    const ty = Math.floor(tileY + 0.5)

    if (tx < 0 || tx >= DEFAULT_CONFIG.mapWidth || ty < 0 || ty >= DEFAULT_CONFIG.mapHeight) {
      return false
    }

    const tile = this.gameState.map[ty][tx]

    if (tile === TileType.WALL || tile === TileType.BOX || tile === TileType.FALLING) {
      return false
    }

    const bombAtPos = this.gameState.bombs.find((b) => Math.floor(b.x + 0.5) === tx && Math.floor(b.y + 0.5) === ty)
    if (bombAtPos) {
      if (player.canKick && !bombAtPos.isMoving) {
        const playerTileX = Math.floor(player.x + 0.5)
        const playerTileY = Math.floor(player.y + 0.5)
        const kickDx = tx - playerTileX
        const kickDy = ty - playerTileY
        if (kickDx !== 0 || kickDy !== 0) {
          this.kickBomb(bombAtPos, kickDx, kickDy)
        }
      }
      return false
    }

    return true
  }

  private handleTileEffect(player: Player, tileX: number, tileY: number) {
    const tile = this.gameState.map[tileY]?.[tileX]
    if (tile === undefined) return

    if (this.gameState.warningTiles.has(`${tileX},${tileY}`)) {
      return
    }

    if (this.gameState.fallingTiles.has(`${tileX},${tileY}`)) {
      this.killPlayer(player, player.id)
    }

    const moveState = this.playerMoveStates.get(player.id)
    if (moveState && moveState.isMoving) {
      return
    }

    if (tile >= TileType.CONVEYOR_UP && tile <= TileType.CONVEYOR_RIGHT) {
      const directions: { [key: number]: { dx: number; dy: number } } = {
        [TileType.CONVEYOR_UP]: { dx: 0, dy: -1 },
        [TileType.CONVEYOR_DOWN]: { dx: 0, dy: 1 },
        [TileType.CONVEYOR_LEFT]: { dx: -1, dy: 0 },
        [TileType.CONVEYOR_RIGHT]: { dx: 1, dy: 0 },
      }
      const dir = directions[tile]
      const newX = tileX + dir.dx
      const newY = tileY + dir.dy
      if (this.canMoveTo(newX, newY, player)) {
        this.startPlayerMove(player, dir.dx, dir.dy)
      }
    }
  }

  private placeBomb(player: Player) {
    if (player.bombCount >= player.maxBombs) return

    const tileX = Math.floor(player.x + 0.5)
    const tileY = Math.floor(player.y + 0.5)

    if (this.gameState.bombs.find((b) => b.x === tileX && b.y === tileY)) {
      return
    }

    const bomb: Bomb = {
      id: `bomb_${Date.now()}_${Math.random()}`,
      x: tileX,
      y: tileY,
      ownerId: player.id,
      timer: DEFAULT_CONFIG.bombTimer,
      maxTimer: DEFAULT_CONFIG.bombTimer,
      range: player.fireRange,
      isRemote: player.hasRemote,
      isMoving: false,
      hasPierce: player.hasPierce,
    }

    this.gameState.bombs.push(bomb)
    player.bombCount++

    this.createBombSprite(bomb)
  }

  private createBombSprite(bomb: Bomb) {
    const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
    const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2

    const sprite = this.add.sprite(
      offsetX + bomb.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      offsetY + bomb.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      'bomb'
    )
    sprite.setDisplaySize(32, 32)
    this.bombSprites.set(bomb.id, sprite)
  }

  private kickBomb(bomb: Bomb, dx: number, dy: number) {
    bomb.isMoving = true
    if (dx > 0) bomb.direction = 'right'
    else if (dx < 0) bomb.direction = 'left'
    else if (dy > 0) bomb.direction = 'down'
    else if (dy < 0) bomb.direction = 'up'
  }

  private triggerRemoteBombs(player: Player) {
    if (!player.hasRemote) return

    const remoteBombs = this.gameState.bombs.filter((b) => b.ownerId === player.id && b.isRemote)
    remoteBombs.forEach((bomb) => {
      bomb.timer = 0
    })
  }

  private updateBombs(deltaTime: number) {
    const bombsToRemove: string[] = []

    this.gameState.bombs.forEach((bomb) => {
      if (!bomb.isRemote) {
        bomb.timer -= deltaTime
      }

      const sprite = this.bombSprites.get(bomb.id)
      if (sprite) {
        const flash = Math.sin(bomb.timer / 100) > 0
        sprite.setTint(flash ? 0xffffff : 0xff6666)
      }

      if (bomb.timer <= 0) {
        this.explodeBomb(bomb)
        bombsToRemove.push(bomb.id)
      }
    })

    bombsToRemove.forEach((id) => {
      this.gameState.bombs = this.gameState.bombs.filter((b) => b.id !== id)
      this.bombSprites.get(id)?.destroy()
      this.bombSprites.delete(id)
    })
  }

  private updateMovingBombs(deltaTime: number) {
    const moveSpeed = 0.003 * deltaTime

    this.gameState.bombs.forEach((bomb) => {
      if (!bomb.isMoving || !bomb.direction) return

      const directions: { [key: string]: { dx: number; dy: number } } = {
        up: { dx: 0, dy: -moveSpeed },
        down: { dx: 0, dy: moveSpeed },
        left: { dx: -moveSpeed, dy: 0 },
        right: { dx: moveSpeed, dy: 0 },
      }

      const dir = directions[bomb.direction]
      const newX = bomb.x + dir.dx
      const newY = bomb.y + dir.dy

      const tileX = Math.floor(newX + 0.5)
      const tileY = Math.floor(newY + 0.5)

      if (
        tileX >= 0 &&
        tileX < DEFAULT_CONFIG.mapWidth &&
        tileY >= 0 &&
        tileY < DEFAULT_CONFIG.mapHeight &&
        this.gameState.map[tileY][tileX] !== TileType.WALL &&
        this.gameState.map[tileY][tileX] !== TileType.BOX &&
        !this.gameState.bombs.find((b) => b.id !== bomb.id && b.x === tileX && b.y === tileY)
      ) {
        bomb.x = newX
        bomb.y = newY

        const sprite = this.bombSprites.get(bomb.id)
        const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
        const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2
        if (sprite) {
          sprite.x = offsetX + bomb.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2
          sprite.y = offsetY + bomb.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2
        }
      } else {
        bomb.isMoving = false
        bomb.x = Math.round(bomb.x)
        bomb.y = Math.round(bomb.y)

        const sprite = this.bombSprites.get(bomb.id)
        const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
        const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2
        if (sprite) {
          sprite.x = offsetX + bomb.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2
          sprite.y = offsetY + bomb.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2
        }
      }
    })
  }

  private explodeBomb(bomb: Bomb) {
    const owner = this.gameState.players.find((p) => p.id === bomb.ownerId)
    if (owner) {
      owner.bombCount--
    }

    this.createExplosion(bomb.x, bomb.y, 'center', bomb.ownerId)

    const directions = [
      { dx: 0, dy: -1, name: 'up' as const },
      { dx: 0, dy: 1, name: 'down' as const },
      { dx: -1, dy: 0, name: 'left' as const },
      { dx: 1, dy: 0, name: 'right' as const },
    ]

    directions.forEach((dir) => {
      for (let i = 1; i <= bomb.range; i++) {
        const tileX = bomb.x + dir.dx * i
        const tileY = bomb.y + dir.dy * i

        if (
          tileX < 0 ||
          tileX >= DEFAULT_CONFIG.mapWidth ||
          tileY < 0 ||
          tileY >= DEFAULT_CONFIG.mapHeight
        ) {
          break
        }

        const tile = this.gameState.map[tileY][tileX]

        if (tile === TileType.WALL) {
          break
        }

        this.createExplosion(tileX, tileY, dir.name, bomb.ownerId)

        if (tile === TileType.BOX) {
          this.destroyBox(tileX, tileY)
          if (!bomb.hasPierce) break
        }
      }
    })

    this.cameras.main.shake(100, 0.01)
  }

  private createExplosion(x: number, y: number, direction: Explosion['direction'], ownerId: string) {
    const explosion: Explosion = {
      id: `explosion_${Date.now()}_${Math.random()}`,
      x,
      y,
      direction,
      timer: DEFAULT_CONFIG.explosionDuration,
      ownerId,
    }

    this.gameState.explosions.push(explosion)

    const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
    const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2

    const sprite = this.add.sprite(
      offsetX + x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      offsetY + y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      'bomb'
    )
    sprite.setDisplaySize(40, 40)
    sprite.setTint(0xffaa00)
    this.explosionSprites.set(explosion.id, sprite)

    const bombsAtPos = this.gameState.bombs.filter((b) => Math.floor(b.x + 0.5) === x && Math.floor(b.y + 0.5) === y)
    bombsAtPos.forEach((b) => {
      b.timer = 0
    })
  }

  private updateExplosions(deltaTime: number) {
    const explosionsToRemove: string[] = []

    this.gameState.explosions.forEach((explosion) => {
      explosion.timer -= deltaTime

      const sprite = this.explosionSprites.get(explosion.id)
      if (sprite) {
        sprite.setAlpha(explosion.timer / DEFAULT_CONFIG.explosionDuration)
        sprite.setScale(1 + (1 - explosion.timer / DEFAULT_CONFIG.explosionDuration) * 0.5)
      }

      if (explosion.timer <= 0) {
        explosionsToRemove.push(explosion.id)
      }
    })

    explosionsToRemove.forEach((id) => {
      this.gameState.explosions = this.gameState.explosions.filter((e) => e.id !== id)
      this.explosionSprites.get(id)?.destroy()
      this.explosionSprites.delete(id)
    })
  }

  private destroyBox(x: number, y: number) {
    this.gameState.map[y][x] = TileType.EMPTY

    if (Math.random() < DEFAULT_CONFIG.powerUpChance) {
      this.spawnPowerUp(x, y)
    }
  }

  private spawnPowerUp(x: number, y: number) {
    const powerUpTypes = [
      { type: PowerUpType.FIRE, weight: 25 },
      { type: PowerUpType.BOMB, weight: 25 },
      { type: PowerUpType.SPEED, weight: 20 },
      { type: PowerUpType.KICK, weight: 10 },
      { type: PowerUpType.REMOTE, weight: 8 },
      { type: PowerUpType.PIERCE, weight: 5 },
      { type: PowerUpType.SLOW, weight: 5 },
      { type: PowerUpType.SHIELD, weight: 2 },
    ]

    const totalWeight = powerUpTypes.reduce((sum, p) => sum + p.weight, 0)
    let random = Math.random() * totalWeight

    let selectedType = PowerUpType.FIRE
    for (const powerUp of powerUpTypes) {
      random -= powerUp.weight
      if (random <= 0) {
        selectedType = powerUp.type
        break
      }
    }

    const powerUp: PowerUp = {
      id: `powerup_${Date.now()}_${Math.random()}`,
      x,
      y,
      type: selectedType,
    }

    this.gameState.powerUps.push(powerUp)
    this.createPowerUpSprite(powerUp)
  }

  private createPowerUpSprite(powerUp: PowerUp) {
    const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
    const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2

    const colors: { [key: string]: number } = {
      [PowerUpType.FIRE]: 0xff4444,
      [PowerUpType.BOMB]: 0x444444,
      [PowerUpType.SPEED]: 0x44ff44,
      [PowerUpType.KICK]: 0x4444ff,
      [PowerUpType.REMOTE]: 0xffff44,
      [PowerUpType.PIERCE]: 0xff44ff,
      [PowerUpType.SLOW]: 0x888888,
      [PowerUpType.SHIELD]: 0x44ffff,
    }

    const sprite = this.add.circle(
      offsetX + powerUp.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      offsetY + powerUp.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      12,
      colors[powerUp.type]
    )
    sprite.setStrokeStyle(2, 0xffffff)

    const label = this.add.text(
      offsetX + powerUp.x * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      offsetY + powerUp.y * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2,
      this.getPowerUpLabel(powerUp.type),
      { fontSize: '10px', color: '#ffffff', stroke: '#000', strokeThickness: 2 }
    )
    label.setOrigin(0.5)

    const container = this.add.container(0, 0, [sprite, label])
    this.powerUpSprites.set(powerUp.id, container as any)
  }

  private getPowerUpLabel(type: PowerUpType): string {
    const labels: { [key: string]: string } = {
      [PowerUpType.FIRE]: '火',
      [PowerUpType.BOMB]: '弹',
      [PowerUpType.SPEED]: '速',
      [PowerUpType.KICK]: '踢',
      [PowerUpType.REMOTE]: '控',
      [PowerUpType.PIERCE]: '穿',
      [PowerUpType.SLOW]: '慢',
      [PowerUpType.SHIELD]: '盾',
    }
    return labels[type]
  }

  private checkCollisions() {
    this.gameState.players.forEach((player) => {
      if (!player.alive) return

      const tileX = Math.floor(player.x + 0.5)
      const tileY = Math.floor(player.y + 0.5)

      const inExplosion = this.gameState.explosions.some((e) => e.x === tileX && e.y === tileY)
      if (inExplosion) {
        if (player.hasShield) {
          player.hasShield = false
        } else {
          const explosion = this.gameState.explosions.find((e) => e.x === tileX && e.y === tileY)
          this.killPlayer(player, explosion?.ownerId || player.id)
        }
      }

      const powerUp = this.gameState.powerUps.find((p) => p.x === tileX && p.y === tileY)
      if (powerUp) {
        this.collectPowerUp(player, powerUp)
      }
    })
  }

  private collectPowerUp(player: Player, powerUp: PowerUp) {
    switch (powerUp.type) {
      case PowerUpType.FIRE:
        player.fireRange++
        break
      case PowerUpType.BOMB:
        player.maxBombs++
        break
      case PowerUpType.SPEED:
        player.speed = Math.min(player.speed + 1, 8)
        break
      case PowerUpType.KICK:
        player.canKick = true
        break
      case PowerUpType.REMOTE:
        player.hasRemote = true
        break
      case PowerUpType.PIERCE:
        player.hasPierce = true
        break
      case PowerUpType.SLOW:
        this.gameState.players.forEach((p) => {
          if (p.id !== player.id && p.alive) {
            p.isSlowed = true
            this.time.delayedCall(5000, () => {
              p.isSlowed = false
            })
          }
        })
        break
      case PowerUpType.SHIELD:
        player.hasShield = true
        break
    }

    player.powerUpsCollected++
    this.gameState.powerUps = this.gameState.powerUps.filter((p) => p.id !== powerUp.id)
    this.powerUpSprites.get(powerUp.id)?.destroy()
    this.powerUpSprites.delete(powerUp.id)
  }

  private killPlayer(player: Player, killerId: string) {
    if (!player.alive) return

    player.alive = false
    player.deaths++

    if (killerId === player.id) {
      player.selfDestructs++
    } else {
      const killer = this.gameState.players.find((p) => p.id === killerId)
      if (killer) {
        killer.kills++
      }
    }

    const sprite = this.playerSprites.get(player.id)
    if (sprite) {
      this.tweens.add({
        targets: sprite,
        rotation: Math.PI * 4,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          sprite.destroy()
        },
      })
    }

    this.gameState.bombs
      .filter((b) => b.ownerId === player.id)
      .forEach((b) => {
        if (b.isRemote) b.timer = 0
      })
  }

  private updateAI(deltaTime: number) {
    this.aiControllers.forEach((controller) => {
      controller.update(this.gameState, deltaTime)
    })
  }

  private checkGameShrink() {
    if (this.gameState.gameTime < DEFAULT_CONFIG.shrinkStartTime) return

    const shrinkLevel = Math.floor(
      (this.gameState.gameTime - DEFAULT_CONFIG.shrinkStartTime) / DEFAULT_CONFIG.shrinkInterval
    )

    for (let i = 0; i <= shrinkLevel; i++) {
      for (let x = i; x < DEFAULT_CONFIG.mapWidth - i; x++) {
        this.addWarningTile(x, i)
        this.addWarningTile(x, DEFAULT_CONFIG.mapHeight - 1 - i)
      }
      for (let y = i; y < DEFAULT_CONFIG.mapHeight - i; y++) {
        this.addWarningTile(i, y)
        this.addWarningTile(DEFAULT_CONFIG.mapWidth - 1 - i, y)
      }
    }

    this.time.delayedCall(2000, () => {
      for (let i = 0; i <= shrinkLevel; i++) {
        for (let x = i; x < DEFAULT_CONFIG.mapWidth - i; x++) {
          this.makeTileFall(x, i)
          this.makeTileFall(x, DEFAULT_CONFIG.mapHeight - 1 - i)
        }
        for (let y = i; y < DEFAULT_CONFIG.mapHeight - i; y++) {
          this.makeTileFall(i, y)
          this.makeTileFall(DEFAULT_CONFIG.mapWidth - 1 - i, y)
        }
      }
    })
  }

  private addWarningTile(x: number, y: number) {
    const key = `${x},${y}`
    if (!this.gameState.warningTiles.has(key) && !this.gameState.fallingTiles.has(key)) {
      this.gameState.warningTiles.add(key)
    }
  }

  private makeTileFall(x: number, y: number) {
    const key = `${x},${y}`
    if (!this.gameState.fallingTiles.has(key)) {
      this.gameState.fallingTiles.add(key)
      this.gameState.warningTiles.delete(key)
      this.gameState.map[y][x] = TileType.FALLING
    }
  }

  private checkGameOver() {
    const alivePlayers = this.gameState.players.filter((p) => p.alive)

    if (alivePlayers.length <= 1) {
      this.gameState.isGameOver = true
      this.gameState.winner = alivePlayers[0]

      this.time.delayedCall(2000, () => {
        this.onGameEnd?.(this.getGameStats())
      })
    }
  }

  private getGameStats() {
    return {
      players: this.gameState.players.map((p) => ({
        name: p.name,
        kills: p.kills,
        deaths: p.deaths,
        powerUpsCollected: p.powerUpsCollected,
        selfDestructs: p.selfDestructs,
        isWinner: p.id === this.gameState.winner?.id,
      })),
    }
  }

  private render() {
    this.tileGraphics.clear()
    const tileSize = DEFAULT_CONFIG.tileSize

    for (let y = 0; y < DEFAULT_CONFIG.mapHeight; y++) {
      for (let x = 0; x < DEFAULT_CONFIG.mapWidth; x++) {
        const tile = this.gameState.map[y][x]
        const px = x * tileSize
        const py = y * tileSize

        this.tileGraphics.fillStyle(0x2a2a4a)
        this.tileGraphics.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2)

        if (this.gameState.warningTiles.has(`${x},${y}`)) {
          const flash = Math.sin(this.gameState.gameTime * 10) > 0
          this.tileGraphics.fillStyle(flash ? 0xff4444 : 0xffaa00, 0.5)
          this.tileGraphics.fillRect(px, py, tileSize, tileSize)
        }

        if (this.gameState.fallingTiles.has(`${x},${y}`)) {
          this.tileGraphics.fillStyle(0x000000)
          this.tileGraphics.fillRect(px, py, tileSize, tileSize)
          continue
        }

        switch (tile) {
          case TileType.WALL:
            this.tileGraphics.fillStyle(0x4a4a6a)
            this.tileGraphics.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4)
            this.tileGraphics.lineStyle(2, 0x3a3a5a)
            this.tileGraphics.strokeRect(px + 4, py + 4, tileSize - 8, tileSize - 8)
            break
          case TileType.BOX:
            this.tileGraphics.fillStyle(0x8b4513)
            this.tileGraphics.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8)
            this.tileGraphics.lineStyle(2, 0x654321)
            this.tileGraphics.strokeRect(px + 6, py + 6, tileSize - 12, tileSize - 12)
            this.tileGraphics.lineStyle(1, 0x654321)
            this.tileGraphics.lineBetween(px + 4, py + tileSize / 2, px + tileSize - 4, py + tileSize / 2)
            break
          case TileType.CONVEYOR_UP:
          case TileType.CONVEYOR_DOWN:
          case TileType.CONVEYOR_LEFT:
          case TileType.CONVEYOR_RIGHT:
            this.tileGraphics.fillStyle(0x666666)
            this.tileGraphics.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8)
            this.tileGraphics.fillStyle(0x888888)
            const arrowDir = {
              [TileType.CONVEYOR_UP]: { x: 0, y: -1 },
              [TileType.CONVEYOR_DOWN]: { x: 0, y: 1 },
              [TileType.CONVEYOR_LEFT]: { x: -1, y: 0 },
              [TileType.CONVEYOR_RIGHT]: { x: 1, y: 0 },
            }[tile]
            this.tileGraphics.fillTriangle(
              px + tileSize / 2 + arrowDir.x * 10,
              py + tileSize / 2 + arrowDir.y * 10,
              px + tileSize / 2 - arrowDir.y * 8 - arrowDir.x * 5,
              py + tileSize / 2 + arrowDir.x * 8 - arrowDir.y * 5,
              px + tileSize / 2 + arrowDir.y * 8 - arrowDir.x * 5,
              py + tileSize / 2 - arrowDir.x * 8 - arrowDir.y * 5
            )
            break
        }
      }
    }

    const offsetX = (this.cameras.main.width - DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize) / 2
    const offsetY = (this.cameras.main.height - DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize) / 2

    this.gameState.players.forEach((player) => {
      const sprite = this.playerSprites.get(player.id)
      if (sprite && player.alive) {
        sprite.x = offsetX + player.x * tileSize + tileSize / 2
        sprite.y = offsetY + player.y * tileSize + tileSize / 2

        if (player.isSlowed) {
          sprite.setAlpha(0.6)
        } else {
          sprite.setAlpha(1)
        }
      }
    })
  }

  public aiPlaceBomb(playerId: string) {
    const player = this.gameState.players.find((p) => p.id === playerId)
    if (player && player.alive) {
      this.placeBomb(player)
    }
  }

  public aiMovePlayer(playerId: string, dx: number, dy: number) {
    const player = this.gameState.players.find((p) => p.id === playerId)
    if (player && player.alive) {
      this.movePlayer(player, dx, dy)
    }
  }

  public getGameState(): GameState {
    return this.gameState
  }

  setOnGameEnd(callback: (stats: any) => void) {
    this.onGameEnd = callback
  }
}
