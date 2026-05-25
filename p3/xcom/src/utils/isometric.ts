import type { Position, IsometricPosition } from '@/types'
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT, TILE_HEIGHT } from '@/config/constants'

export const chebyshevDistance = (a: Position, b: Position): number => {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export const gridToIso = (gridX: number, gridY: number, height: number = 0): IsometricPosition => {
  const x = (gridX - gridY) * (ISO_TILE_WIDTH / 2)
  const y = (gridX + gridY) * (ISO_TILE_HEIGHT / 2) - height * TILE_HEIGHT
  const z = height * TILE_HEIGHT
  return { x, y, z }
}

export const isoToGrid = (isoX: number, isoY: number): Position => {
  const x = (isoX / (ISO_TILE_WIDTH / 2) + isoY / (ISO_TILE_HEIGHT / 2)) / 2
  const y = (isoY / (ISO_TILE_HEIGHT / 2) - isoX / (ISO_TILE_WIDTH / 2)) / 2
  return { x: Math.floor(x), y: Math.floor(y) }
}

export const getDepth = (gridX: number, gridY: number, height: number = 0): number => {
  return (gridX + gridY) * ISO_TILE_HEIGHT - height * TILE_HEIGHT
}

export const getScreenCenter = (mapWidth: number, mapHeight: number, screenWidth: number, screenHeight: number): { x: number; y: number } => {
  const centerX = (mapWidth - mapHeight) * (ISO_TILE_WIDTH / 2)
  const centerY = (mapWidth + mapHeight) * (ISO_TILE_HEIGHT / 4)
  return {
    x: screenWidth / 2 - centerX,
    y: screenHeight / 2 - centerY,
  }
}

export const isInBounds = (x: number, y: number, width: number, height: number): boolean => {
  return x >= 0 && x < width && y >= 0 && y < height
}

export const getNeighbors = (x: number, y: number, includeDiagonal: boolean = false): Position[] => {
  const neighbors: Position[] = [
    { x: x, y: y - 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
  ]
  
  if (includeDiagonal) {
    neighbors.push(
      { x: x - 1, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
      { x: x + 1, y: y + 1 }
    )
  }
  
  return neighbors
}
