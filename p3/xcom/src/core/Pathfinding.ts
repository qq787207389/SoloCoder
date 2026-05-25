import type { Position, Tile, Character } from '@/types'
import { TILE_PROPERTIES } from '@/config/constants'
import { chebyshevDistance, isInBounds } from '@/utils/isometric'

interface PathNode {
  position: Position
  g: number
  h: number
  f: number
  parent: PathNode | null
}

export class Pathfinding {
  private tiles: Tile[][]
  private width: number
  private height: number

  constructor(tiles: Tile[][], width: number, height: number) {
    this.tiles = tiles
    this.width = width
    this.height = height
  }

  findPath(
    start: Position,
    end: Position,
    units: Character[],
    maxDistance: number = Infinity
  ): Position[] | null {
    if (!isInBounds(end.x, end.y, this.width, this.height)) {
      return null
    }

    const endTile = this.tiles[end.y][end.x]
    if (!this.isWalkable(endTile)) {
      return null
    }

    if (this.isOccupied(end, units, start)) {
      return null
    }

    const openSet: PathNode[] = []
    const closedSet = new Set<string>()
    const startNode: PathNode = {
      position: start,
      g: 0,
      h: chebyshevDistance(start, end),
      f: 0,
      parent: null,
    }
    startNode.f = startNode.g + startNode.h
    openSet.push(startNode)

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f)
      const current = openSet.shift()!

      if (current.position.x === end.x && current.position.y === end.y) {
        return this.reconstructPath(current)
      }

      if (current.g > maxDistance) {
        continue
      }

      closedSet.add(`${current.position.x},${current.position.y}`)

      const neighbors = this.getNeighbors(current.position)
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`
        if (closedSet.has(key)) continue

        const tile = this.tiles[neighbor.y][neighbor.x]
        if (!this.isWalkable(tile)) continue
        if (this.isOccupied(neighbor, units, start)) continue

        const moveCost = this.getMoveCost(current.position, neighbor)
        const tentativeG = current.g + moveCost

        if (tentativeG > maxDistance) continue

        const existingNode = openSet.find(
          (n) => n.position.x === neighbor.x && n.position.y === neighbor.y
        )

        if (!existingNode) {
          const newNode: PathNode = {
            position: neighbor,
            g: tentativeG,
            h: chebyshevDistance(neighbor, end),
            f: 0,
            parent: current,
          }
          newNode.f = newNode.g + newNode.h
          openSet.push(newNode)
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG
          existingNode.f = existingNode.g + existingNode.h
          existingNode.parent = current
        }
      }
    }

    return null
  }

  getReachableTiles(
    start: Position,
    moveRange: number,
    units: Character[]
  ): Position[] {
    const reachable: Position[] = []
    const visited = new Set<string>()
    const queue: { pos: Position; cost: number }[] = [{ pos: start, cost: 0 }]
    visited.add(`${start.x},${start.y}`)

    while (queue.length > 0) {
      const { pos, cost } = queue.shift()!

      if (cost <= moveRange && (pos.x !== start.x || pos.y !== start.y)) {
        const tile = this.tiles[pos.y][pos.x]
        if (this.isWalkable(tile) && !this.isOccupied(pos, units, start)) {
          reachable.push(pos)
        }
      }

      if (cost < moveRange) {
        const neighbors = this.getNeighbors(pos)
        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`
          if (visited.has(key)) continue

          const tile = this.tiles[neighbor.y]?.[neighbor.x]
          if (!tile || !this.isWalkable(tile)) continue
          if (this.isOccupied(neighbor, units, start)) continue

          const moveCost = this.getMoveCost(pos, neighbor)
          const newCost = cost + moveCost

          if (newCost <= moveRange) {
            visited.add(key)
            queue.push({ pos: neighbor, cost: newCost })
          }
        }
      }
    }

    return reachable
  }

  private isWalkable(tile: Tile): boolean {
    return TILE_PROPERTIES[tile.type].walkable
  }

  private isOccupied(pos: Position, units: Character[], exclude: Position): boolean {
    return units.some(
      (u) =>
        u.stats.hp > 0 &&
        u.position.x === pos.x &&
        u.position.y === pos.y &&
        !(u.position.x === exclude.x && u.position.y === exclude.y)
    )
  }

  private getMoveCost(from: Position, to: Position): number {
    const tile = this.tiles[to.y][to.x]
    let cost = 1

    if (tile.type === 'rubble') cost = 2
    if (tile.type === 'high_ground') {
      const fromTile = this.tiles[from.y][from.x]
      if (fromTile.height < tile.height) cost = 2
    }

    return cost
  }

  private getNeighbors(pos: Position): Position[] {
    const neighbors: Position[] = []
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]

    for (const dir of directions) {
      const nx = pos.x + dir.x
      const ny = pos.y + dir.y
      if (isInBounds(nx, ny, this.width, this.height)) {
        neighbors.push({ x: nx, y: ny })
      }
    }

    return neighbors
  }

  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = []
    let current: PathNode | null = node

    while (current) {
      path.unshift(current.position)
      current = current.parent
    }

    return path
  }
}
