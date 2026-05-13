export const GRID_SIZE = 8
export const COLORS = 6
export const CELL_SIZE = 64
export const PADDING = 8

export type ColorType = 0 | 1 | 2 | 3 | 4 | 5

export enum SpecialType {
  NONE = 0,
  HORIZONTAL_ROCKET = 1,
  VERTICAL_ROCKET = 2,
  BOMB = 3,
  RAINBOW = 4
}

export interface Cell {
  color: ColorType
  special: SpecialType
  isMatched: boolean
  isFalling: boolean
  targetY: number
}

export interface Position {
  row: number
  col: number
}

export interface MatchResult {
  cells: Position[]
  hasSpecial: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  maxLife: number
  size: number
}

export interface GameState {
  grid: Cell[][]
  score: number
  moves: number
  maxMoves: number
  combo: number
  isAnimating: boolean
  selectedCell: Position | null
}

export const COLOR_MAP: Record<ColorType, string> = {
  0: '#FF6B6B',
  1: '#4ECDC4',
  2: '#45B7D1',
  3: '#96CEB4',
  4: '#FFEAA7',
  5: '#DDA0DD'
}
