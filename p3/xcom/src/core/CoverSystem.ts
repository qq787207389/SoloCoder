import type { Position, Tile, Character, RaycastResult } from '@/types'
import { TILE_PROPERTIES } from '@/config/constants'
import { isInBounds, getNeighbors } from '@/utils/isometric'
import { isFlanked, getDirection } from '@/utils/math'

export class CoverSystem {
  private tiles: Tile[][]
  private width: number
  private height: number

  constructor(tiles: Tile[][], width: number, height: number) {
    this.tiles = tiles
    this.width = width
    this.height = height
  }

  raycast(from: Position, to: Position, smokePositions: Position[] = []): RaycastResult {
    const tiles: Tile[] = []
    let coverLevel: 'none' | 'half' | 'full' = 'none'
    let hitObstacle = false

    const dx = to.x - from.x
    const dy = to.y - from.y
    const steps = Math.max(Math.abs(dx), Math.abs(dy))

    if (steps === 0) {
      return {
        hit: false,
        tiles: [],
        distance: 0,
        coverLevel: 'none',
        flanked: false,
      }
    }

    const xStep = dx / steps
    const yStep = dy / steps

    for (let i = 1; i < steps; i++) {
      const x = Math.round(from.x + xStep * i)
      const y = Math.round(from.y + yStep * i)

      if (!isInBounds(x, y, this.width, this.height)) {
        hitObstacle = true
        break
      }

      const tile = this.tiles[y][x]
      const props = TILE_PROPERTIES[tile.type]

      if (x === to.x && y === to.y) {
        continue
      }

      if (props.blocksLOS) {
        hitObstacle = true
        tiles.push(tile)
        break
      }

      const inSmoke = smokePositions.some(
        (s) => Math.abs(s.x - x) <= 1 && Math.abs(s.y - y) <= 1
      )
      if (inSmoke) {
        if (coverLevel !== 'full') {
          coverLevel = 'half'
        }
      }

      if (props.coverLevel !== 'none') {
        tiles.push(tile)
        if (props.coverLevel === 'full' && coverLevel !== 'full') {
          coverLevel = 'full'
        } else if (props.coverLevel === 'half' && coverLevel === 'none') {
          coverLevel = 'half'
        }
      }
    }

    return {
      hit: hitObstacle,
      tiles,
      distance: steps,
      coverLevel,
      flanked: false,
    }
  }

  calculateCover(
    attacker: Position,
    defender: Character,
    smokePositions: Position[] = []
  ): { coverLevel: 'none' | 'half' | 'full'; flanked: boolean; defenseBonus: number; dodgeBonus: number } {
    const raycast = this.raycast(attacker, defender.position, smokePositions)
    const flanked = isFlanked(attacker, defender.position, defender.facing)

    let coverLevel = raycast.coverLevel
    if (flanked) {
      coverLevel = 'none'
    }

    const directionalCover = this.getDirectionalCover(attacker, defender.position)
    if (directionalCover === 'full' && coverLevel !== 'full') {
      coverLevel = 'full'
    } else if (directionalCover === 'half' && coverLevel === 'none') {
      coverLevel = 'half'
    }

    let defenseBonus = 0
    let dodgeBonus = 0

    if (coverLevel === 'half') {
      defenseBonus = 20
      dodgeBonus = 15
    } else if (coverLevel === 'full') {
      defenseBonus = 40
      dodgeBonus = 30
    }

    if (flanked) {
      defenseBonus -= 40
      dodgeBonus -= 20
    }

    const defenderTile = this.tiles[defender.position.y][defender.position.x]
    if (defenderTile.type === 'high_ground') {
      defenseBonus += 5
    }

    const attackerTile = this.tiles[attacker.y][attacker.x]
    if (attackerTile.type === 'high_ground' && defenderTile.type !== 'high_ground') {
      defenseBonus -= 10
    }

    return {
      coverLevel,
      flanked,
      defenseBonus,
      dodgeBonus,
    }
  }

  private getDirectionalCover(
    attacker: Position,
    defender: Position
  ): 'none' | 'half' | 'full' {
    const attackDirection = getDirection(defender, attacker)
    const neighbors = getNeighbors(defender.x, defender.y, true)
    let bestCover: 'none' | 'half' | 'full' = 'none'

    for (const neighbor of neighbors) {
      if (!isInBounds(neighbor.x, neighbor.y, this.width, this.height)) continue

      const tile = this.tiles[neighbor.y][neighbor.x]
      const props = TILE_PROPERTIES[tile.type]

      if (props.coverLevel === 'none') continue

      const neighborDirection = getDirection(defender, neighbor)
      if (this.isDirectionBetween(neighborDirection, attackDirection)) {
        if (props.coverLevel === 'full') {
          bestCover = 'full'
        } else if (props.coverLevel === 'half' && bestCover === 'none') {
          bestCover = 'half'
        }
      }
    }

    return bestCover
  }

  private isDirectionBetween(dir1: string, dir2: string): boolean {
    const directions = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest']
    const idx1 = directions.indexOf(dir1)
    const idx2 = directions.indexOf(dir2)

    if (idx1 === -1 || idx2 === -1) return false

    const diff = Math.abs(idx1 - idx2)
    return diff <= 1 || diff >= 7
  }

  getCoverPositions(around: Position, team: 'player' | 'enemy', units: Character[]): Position[] {
    const covers: Position[] = []
    const neighbors = getNeighbors(around.x, around.y, true)

    for (const pos of neighbors) {
      if (!isInBounds(pos.x, pos.y, this.width, this.height)) continue

      const tile = this.tiles[pos.y][pos.x]
      const props = TILE_PROPERTIES[tile.type]

      if (!props.walkable) continue
      if (units.some((u) => u.stats.hp > 0 && u.position.x === pos.x && u.position.y === pos.y)) continue

      const coverFromEnemies = this.hasCoverFromEnemies(pos, team, units)
      if (coverFromEnemies) {
        covers.push(pos)
      }
    }

    return covers
  }

  private hasCoverFromEnemies(pos: Position, team: 'player' | 'enemy', units: Character[]): boolean {
    const enemies = units.filter((u) => u.team !== team && u.stats.hp > 0)

    for (const enemy of enemies) {
      const cover = this.calculateCover(enemy.position, {
        ...enemy,
        position: pos,
      } as Character)

      if (cover.coverLevel === 'none' && !cover.flanked) {
        return false
      }
    }

    return true
  }

  hasLineOfSight(from: Position, to: Position, smokePositions: Position[] = []): boolean {
    const result = this.raycast(from, to, smokePositions)
    return !result.hit
  }

  getTilesInRange(center: Position, range: number): Position[] {
    const tiles: Position[] = []

    for (let y = center.y - range; y <= center.y + range; y++) {
      for (let x = center.x - range; x <= center.x + range; x++) {
        if (!isInBounds(x, y, this.width, this.height)) continue
        if (x === center.x && y === center.y) continue

        const dist = Math.max(Math.abs(x - center.x), Math.abs(y - center.y))
        if (dist <= range) {
          tiles.push({ x, y })
        }
      }
    }

    return tiles
  }
}
