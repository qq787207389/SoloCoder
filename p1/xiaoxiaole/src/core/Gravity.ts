import { GRID_SIZE, COLORS, ColorType, SpecialType } from '../types'
import { GameGrid } from './Grid'

export class GravitySystem {
  private grid: GameGrid

  constructor(grid: GameGrid) {
    this.grid = grid
  }

  applyGravity(): boolean {
    let hasMoved = false
    
    for (let col = 0; col < GRID_SIZE; col++) {
      hasMoved = this.processColumn(col) || hasMoved
    }
    
    return hasMoved
  }

  private processColumn(col: number): boolean {
    let writeRow = GRID_SIZE - 1
    let hasMoved = false
    
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      const cell = this.grid.grid[row][col]
      if (!cell.isMatched) {
        if (writeRow !== row) {
          this.grid.grid[writeRow][col].color = cell.color
          this.grid.grid[writeRow][col].special = cell.special
          this.grid.grid[writeRow][col].isFalling = true
          this.grid.grid[writeRow][col].targetY = writeRow
          hasMoved = true
        }
        writeRow--
      }
    }
    
    for (let row = writeRow; row >= 0; row--) {
      this.grid.grid[row][col].color = Math.floor(Math.random() * COLORS) as ColorType
      this.grid.grid[row][col].special = SpecialType.NONE
      this.grid.grid[row][col].isFalling = true
      this.grid.grid[row][col].targetY = row
      this.grid.grid[row][col].isMatched = false
      hasMoved = true
    }
    
    return hasMoved
  }

  resetFallingFlags(): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        this.grid.grid[row][col].isFalling = false
      }
    }
  }
}
