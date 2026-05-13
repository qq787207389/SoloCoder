import { GRID_SIZE, COLORS, ColorType, SpecialType, Cell, Position } from '../types'

export class GameGrid {
  grid: Cell[][]

  constructor() {
    this.grid = this.createEmptyGrid()
    this.initializeGrid()
  }

  createEmptyGrid(): Cell[][] {
    return Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        color: 0 as ColorType,
        special: SpecialType.NONE,
        isMatched: false,
        isFalling: false,
        targetY: 0
      }))
    )
  }

  initializeGrid(): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let color: ColorType
        do {
          color = Math.floor(Math.random() * COLORS) as ColorType
        } while (this.wouldCreateMatch(row, col, color))
        this.grid[row][col].color = color
      }
    }
  }

  wouldCreateMatch(row: number, col: number, color: ColorType): boolean {
    let horizontalCount = 1
    if (col >= 2 && 
        this.grid[row][col - 1].color === color && 
        this.grid[row][col - 2].color === color) {
      horizontalCount = 3
    }
    
    let verticalCount = 1
    if (row >= 2 && 
        this.grid[row - 1][col].color === color && 
        this.grid[row - 2][col].color === color) {
      verticalCount = 3
    }
    
    return horizontalCount >= 3 || verticalCount >= 3
  }

  getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return null
    }
    return this.grid[row][col]
  }

  swapCells(pos1: Position, pos2: Position): boolean {
    const cell1 = this.getCell(pos1.row, pos1.col)
    const cell2 = this.getCell(pos2.row, pos2.col)
    
    if (!cell1 || !cell2) return false
    
    const tempColor = cell1.color
    const tempSpecial = cell1.special
    
    cell1.color = cell2.color
    cell1.special = cell2.special
    cell2.color = tempColor
    cell2.special = tempSpecial
    
    return true
  }

  isAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row)
    const colDiff = Math.abs(pos1.col - pos2.col)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  resetMatchedFlags(): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.grid[row][col].isMatched = false
      }
    }
  }
}
