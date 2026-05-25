import type { Position, Direction } from '@/types'

export const manhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export const euclideanDistance = (a: Position, b: Position): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t
}

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getDirection = (from: Position, to: Position): Direction => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  
  if (dx === 0 && dy < 0) return 'north'
  if (dx === 0 && dy > 0) return 'south'
  if (dx > 0 && dy === 0) return 'east'
  if (dx < 0 && dy === 0) return 'west'
  if (dx > 0 && dy < 0) return 'northeast'
  if (dx < 0 && dy < 0) return 'northwest'
  if (dx > 0 && dy > 0) return 'southeast'
  if (dx < 0 && dy > 0) return 'southwest'
  
  return 'south'
}

export const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    northeast: 'southwest',
    southwest: 'northeast',
    northwest: 'southeast',
    southeast: 'northwest',
  }
  return opposites[dir]
}

export const isFlanked = (attacker: Position, defender: Position, defenderFacing: Direction): boolean => {
  const attackDirection = getDirection(defender, attacker)
  const oppositeFacing = getOppositeDirection(defenderFacing)
  
  const flankingDirections: Direction[] = [oppositeFacing]
  
  if (oppositeFacing === 'north') flankingDirections.push('northeast', 'northwest')
  if (oppositeFacing === 'south') flankingDirections.push('southeast', 'southwest')
  if (oppositeFacing === 'east') flankingDirections.push('northeast', 'southeast')
  if (oppositeFacing === 'west') flankingDirections.push('northwest', 'southwest')
  
  return flankingDirections.includes(attackDirection)
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}
