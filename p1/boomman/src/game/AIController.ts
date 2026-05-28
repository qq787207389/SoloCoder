import { AIType, GameState, TileType, DEFAULT_CONFIG } from '../types/game'
import GameScene from './GameScene'

export class AIController {
  private playerId: string
  private aiType: AIType
  private scene: GameScene
  private lastActionTime: number = 0
  private actionInterval: number = 350
  private targetDirection: { dx: number; dy: number } = { dx: 0, dy: 0 }
  private directionTimer: number = 0

  constructor(playerId: string, aiType: AIType, scene: GameScene) {
    this.playerId = playerId
    this.aiType = aiType
    this.scene = scene
  }

  update(gameState: GameState, deltaTime: number) {
    const player = gameState.players.find((p) => p.id === this.playerId)
    if (!player || !player.alive) return

    this.lastActionTime += deltaTime
    this.directionTimer -= deltaTime

    if (this.lastActionTime < this.actionInterval) return

    switch (this.aiType) {
      case AIType.AGGRESSIVE:
        this.aggressiveAI(gameState, player)
        break
      case AIType.DEFENSIVE:
        this.defensiveAI(gameState, player)
        break
      case AIType.SMART:
        this.smartAI(gameState, player)
        break
    }
  }

  private aggressiveAI(gameState: GameState, player: any) {
    const nearestEnemy = this.findNearestEnemy(gameState, player)

    if (nearestEnemy) {
      const dist = this.getDistance(player, nearestEnemy)

      if (dist < 3 && player.bombCount < player.maxBombs) {
        this.scene.aiPlaceBomb(this.playerId)
        this.moveAwayFromBomb(gameState, player)
      } else {
        this.moveToward(gameState, player, nearestEnemy)
      }
    } else {
      this.randomMove(gameState, player)
    }

    if (Math.random() < 0.1 && player.bombCount < player.maxBombs) {
      this.scene.aiPlaceBomb(this.playerId)
    }
  }

  private defensiveAI(gameState: GameState, player: any) {
    if (this.isInDanger(gameState, player)) {
      this.moveToSafety(gameState, player)
      return
    }

    const nearestPowerUp = this.findNearestPowerUp(gameState, player)
    if (nearestPowerUp) {
      this.moveTowardPosition(gameState, player, nearestPowerUp.x, nearestPowerUp.y)
    } else {
      this.randomMove(gameState, player)
    }

    if (Math.random() < 0.03 && player.bombCount < player.maxBombs) {
      this.scene.aiPlaceBomb(this.playerId)
    }
  }

  private smartAI(gameState: GameState, player: any) {
    if (this.isInDanger(gameState, player)) {
      this.moveToSafety(gameState, player)
      return
    }

    const nearestEnemy = this.findNearestEnemy(gameState, player)
    const nearestPowerUp = this.findNearestPowerUp(gameState, player)

    if (nearestPowerUp && this.getDistance(player, nearestPowerUp) < 4) {
      this.moveTowardPosition(gameState, player, nearestPowerUp.x, nearestPowerUp.y)
      return
    }

    if (nearestEnemy) {
      const dist = this.getDistance(player, nearestEnemy)

      if (dist < 3 && player.bombCount < player.maxBombs) {
        this.scene.aiPlaceBomb(this.playerId)
        this.moveAwayFromBomb(gameState, player)
      } else if (dist < 6) {
        this.moveToward(gameState, player, nearestEnemy)
        if (Math.random() < 0.15 && player.bombCount < player.maxBombs) {
          this.scene.aiPlaceBomb(this.playerId)
        }
      } else {
        this.moveToward(gameState, player, nearestEnemy)
      }
    } else {
      this.randomMove(gameState, player)
    }
  }

  private findNearestEnemy(gameState: GameState, player: any): any {
    let nearest: any = null
    let minDist = Infinity

    gameState.players.forEach((p) => {
      if (p.id !== player.id && p.alive) {
        const dist = this.getDistance(player, p)
        if (dist < minDist) {
          minDist = dist
          nearest = p
        }
      }
    })

    return nearest
  }

  private findNearestPowerUp(gameState: GameState, player: any): any {
    let nearest: any = null
    let minDist = Infinity

    gameState.powerUps.forEach((p) => {
      const dist = Math.abs(Math.floor(player.x) - p.x) + Math.abs(Math.floor(player.y) - p.y)
      if (dist < minDist) {
        minDist = dist
        nearest = p
      }
    })

    return nearest
  }

  private getDistance(a: any, b: any): number {
    return Math.abs(Math.floor(a.x) - Math.floor(b.x)) + Math.abs(Math.floor(a.y) - Math.floor(b.y))
  }

  private isInDanger(gameState: GameState, player: any): boolean {
    const px = Math.floor(player.x + 0.5)
    const py = Math.floor(player.y + 0.5)

    for (const bomb of gameState.bombs) {
      const bx = Math.floor(bomb.x + 0.5)
      const by = Math.floor(bomb.y + 0.5)

      if (bx === px) {
        const dist = Math.abs(by - py)
        if (dist <= bomb.range) return true
      }
      if (by === py) {
        const dist = Math.abs(bx - px)
        if (dist <= bomb.range) return true
      }
    }

    for (const explosion of gameState.explosions) {
      if (explosion.x === px && explosion.y === py) return true
    }

    return false
  }

  private moveToward(gameState: GameState, player: any, target: any) {
    this.moveTowardPosition(gameState, player, target.x, target.y)
  }

  private moveTowardPosition(gameState: GameState, player: any, tx: number, ty: number) {
    const px = Math.floor(player.x + 0.5)
    const py = Math.floor(player.y + 0.5)

    let dx = 0,
      dy = 0

    if (tx > px) dx = 1
    else if (tx < px) dx = -1

    if (ty > py) dy = 1
    else if (ty < py) dy = -1

    if (Math.random() < 0.5 && dx !== 0) {
      if (this.canMove(gameState, px + dx, py)) {
        this.scene.aiMovePlayer(this.playerId, dx, 0)
        return
      }
    }

    if (dy !== 0) {
      if (this.canMove(gameState, px, py + dy)) {
        this.scene.aiMovePlayer(this.playerId, 0, dy)
        return
      }
    }

    if (dx !== 0) {
      if (this.canMove(gameState, px + dx, py)) {
        this.scene.aiMovePlayer(this.playerId, dx, 0)
        return
      }
    }

    this.randomMove(gameState, player)
  }

  private moveAwayFromBomb(gameState: GameState, player: any) {
    const px = Math.floor(player.x + 0.5)
    const py = Math.floor(player.y + 0.5)

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    const safeDirs = directions.filter((d) => this.canMove(gameState, px + d.dx, py + d.dy))
    if (safeDirs.length > 0) {
      const dir = safeDirs[Math.floor(Math.random() * safeDirs.length)]
      this.scene.aiMovePlayer(this.playerId, dir.dx, dir.dy)
    }
  }

  private moveToSafety(gameState: GameState, player: any) {
    const px = Math.floor(player.x + 0.5)
    const py = Math.floor(player.y + 0.5)

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    for (const dir of directions) {
      const nx = px + dir.dx
      const ny = py + dir.dy
      if (this.canMove(gameState, nx, ny) && !this.willBeInDanger(gameState, nx, ny)) {
        this.scene.aiMovePlayer(this.playerId, dir.dx, dir.dy)
        return
      }
    }

    for (const dir of directions) {
      const nx = px + dir.dx
      const ny = py + dir.dy
      if (this.canMove(gameState, nx, ny)) {
        this.scene.aiMovePlayer(this.playerId, dir.dx, dir.dy)
        return
      }
    }
  }

  private willBeInDanger(gameState: GameState, x: number, y: number): boolean {
    for (const bomb of gameState.bombs) {
      const bx = Math.floor(bomb.x + 0.5)
      const by = Math.floor(bomb.y + 0.5)

      if (bx === x) {
        const dist = Math.abs(by - y)
        if (dist <= bomb.range) return true
      }
      if (by === y) {
        const dist = Math.abs(bx - x)
        if (dist <= bomb.range) return true
      }
    }
    return false
  }

  private randomMove(gameState: GameState, player: any) {
    if (this.directionTimer > 0 && this.targetDirection.dx !== 0 || this.targetDirection.dy !== 0) {
      const px = Math.floor(player.x + 0.5)
      const py = Math.floor(player.y + 0.5)
      if (this.canMove(gameState, px + this.targetDirection.dx, py + this.targetDirection.dy)) {
        this.scene.aiMovePlayer(this.playerId, this.targetDirection.dx, this.targetDirection.dy)
        return
      }
    }

    const px = Math.floor(player.x + 0.5)
    const py = Math.floor(player.y + 0.5)

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    const validDirs = directions.filter((d) => this.canMove(gameState, px + d.dx, py + d.dy))
    if (validDirs.length > 0) {
      const dir = validDirs[Math.floor(Math.random() * validDirs.length)]
      this.targetDirection = dir
      this.directionTimer = 500 + Math.random() * 1000
      this.scene.aiMovePlayer(this.playerId, dir.dx, dir.dy)
    }
  }

  private canMove(gameState: GameState, x: number, y: number): boolean {
    if (x < 0 || x >= DEFAULT_CONFIG.mapWidth || y < 0 || y >= DEFAULT_CONFIG.mapHeight) {
      return false
    }

    const tile = gameState.map[y][x]
    if (tile === TileType.WALL || tile === TileType.BOX || tile === TileType.FALLING) {
      return false
    }

    const hasBomb = gameState.bombs.some(
      (b) => Math.floor(b.x + 0.5) === x && Math.floor(b.y + 0.5) === y
    )
    if (hasBomb) return false

    return true
  }
}
