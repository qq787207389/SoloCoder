import { GRID_SIZE, ColorType, SpecialType, Position, MatchResult } from '../types'
import { GameGrid } from './Grid'

export class Matcher {
  private grid: GameGrid

  constructor(grid: GameGrid) {
    this.grid = grid
  }

  findAllMatches(): MatchResult[] {
    const matches: MatchResult[] = []
    const matchedPositions = new Set<string>()
    
    this.findHorizontalMatches(matchedPositions, matches)
    this.findVerticalMatches(matchedPositions, matches)
    
    return matches
  }

  private findHorizontalMatches(matchedPositions: Set<string>, matches: MatchResult[]): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      let col = 0
      while (col < GRID_SIZE) {
        const color = this.grid.grid[row][col].color
        let matchLength = 1
        
        while (col + matchLength < GRID_SIZE && 
               this.grid.grid[row][col + matchLength].color === color) {
          matchLength++
        }
        
        if (matchLength >= 3) {
          const cells: Position[] = []
          let hasSpecial = false
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row},${col + i}`
            if (!matchedPositions.has(key)) {
              matchedPositions.add(key)
              cells.push({ row, col: col + i })
              if (this.grid.grid[row][col + i].special !== SpecialType.NONE) {
                hasSpecial = true
              }
              this.grid.grid[row][col + i].isMatched = true
            }
          }
          
          if (cells.length > 0) {
            matches.push({ cells, hasSpecial })
          }
        }
        col += matchLength
      }
    }
  }

  private findVerticalMatches(matchedPositions: Set<string>, matches: MatchResult[]): void {
    for (let col = 0; col < GRID_SIZE; col++) {
      let row = 0
      while (row < GRID_SIZE) {
        const color = this.grid.grid[row][col].color
        let matchLength = 1
        
        while (row + matchLength < GRID_SIZE && 
               this.grid.grid[row + matchLength][col].color === color) {
          matchLength++
        }
        
        if (matchLength >= 3) {
          const cells: Position[] = []
          let hasSpecial = false
          
          for (let i = 0; i < matchLength; i++) {
            const key = `${row + i},${col}`
            if (!matchedPositions.has(key)) {
              matchedPositions.add(key)
              cells.push({ row: row + i, col })
              if (this.grid.grid[row + i][col].special !== SpecialType.NONE) {
                hasSpecial = true
              }
              this.grid.grid[row + i][col].isMatched = true
            }
          }
          
          if (cells.length > 0) {
            matches.push({ cells, hasSpecial })
          }
        }
        row += matchLength
      }
    }
  }

  determineSpecialType(matchLength: number, isHorizontal: boolean): SpecialType {
    if (matchLength === 4) {
      return isHorizontal ? SpecialType.HORIZONTAL_ROCKET : SpecialType.VERTICAL_ROCKET
    } else if (matchLength >= 5) {
      return SpecialType.RAINBOW
    } else if (matchLength === 3 && Math.random() > 0.7) {
      return SpecialType.BOMB
    }
    return SpecialType.NONE
  }

  markMatchedCells(): void {
    this.findAllMatches()
  }

  hasMatches(): boolean {
    const matches = this.findAllMatches()
    return matches.length > 0
  }
}
