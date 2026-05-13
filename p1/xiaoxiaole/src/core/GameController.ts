import { GameState, Position, SpecialType } from '../types'
import { GameGrid } from './Grid'
import { Matcher } from './Matcher'
import { GravitySystem } from './Gravity'
import { SpecialBlockSystem } from './SpecialBlocks'

export class GameController {
  grid: GameGrid
  matcher: Matcher
  gravity: GravitySystem
  specialSystem: SpecialBlockSystem
  state: GameState
  onStateChange: (() => void) | null = null

  constructor() {
    this.grid = new GameGrid()
    this.matcher = new Matcher(this.grid)
    this.gravity = new GravitySystem(this.grid)
    this.specialSystem = new SpecialBlockSystem(this.grid)
    
    this.state = {
      grid: this.grid.grid,
      score: 0,
      moves: 0,
      maxMoves: 30,
      combo: 0,
      isAnimating: false,
      selectedCell: null
    }
  }

  selectCell(pos: Position): boolean {
    if (this.state.isAnimating) return false
    
    if (!this.state.selectedCell) {
      this.state.selectedCell = pos
      return true
    }
    
    if (this.state.selectedCell.row === pos.row && this.state.selectedCell.col === pos.col) {
      this.state.selectedCell = null
      return false
    }
    
    if (this.grid.isAdjacent(this.state.selectedCell, pos)) {
      return this.trySwap(this.state.selectedCell, pos)
    }
    
    this.state.selectedCell = pos
    return true
  }

  private trySwap(pos1: Position, pos2: Position): boolean {
    this.grid.swapCells(pos1, pos2)
    
    if (this.matcher.hasMatches()) {
      this.state.selectedCell = null
      this.state.moves++
      this.notifyStateChange()
      this.processMatches()
      return true
    } else {
      this.grid.swapCells(pos1, pos2)
      this.state.selectedCell = null
      this.notifyStateChange()
      return false
    }
  }

  private processMatches(): void {
    this.state.combo = 0
    this.state.isAnimating = true
    this.processMatchCycle()
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  private processMatchCycle(): void {
    this.grid.resetMatchedFlags()
    this.specialSystem.resetTriggered()
    
    const matches = this.matcher.findAllMatches()
    
    if (matches.length === 0) {
      this.state.isAnimating = false
      this.notifyStateChange()
      return
    }
    
    this.state.combo++
    
    const allMatched: Position[] = []
    for (const match of matches) {
      allMatched.push(...match.cells)
      
      const baseScore = match.cells.length * 10 * this.state.combo
      this.state.score += baseScore
      
      if (match.cells.length >= 4) {
        const lastCell = match.cells[match.cells.length - 1]
        const isHorizontal = match.cells.every(c => c.row === match.cells[0].row)
        const specialType = this.matcher.determineSpecialType(match.cells.length, isHorizontal)
        this.specialSystem.createSpecialBlock(lastCell, specialType)
      }
    }
    
    const chainResult = this.specialSystem.processChainReaction(allMatched)
    this.state.score += chainResult.length * 5
    
    this.notifyStateChange()
    
    setTimeout(() => {
      this.gravity.applyGravity()
      this.notifyStateChange()
      setTimeout(() => {
        this.gravity.resetFallingFlags()
        this.processMatchCycle()
      }, 300)
    }, 200)
  }

  useHint(): Position[] | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (col < 7) {
          this.grid.swapCells({ row, col }, { row, col: col + 1 })
          if (this.matcher.hasMatches()) {
            this.grid.swapCells({ row, col }, { row, col: col + 1 })
            return [{ row, col }, { row, col: col + 1 }]
          }
          this.grid.swapCells({ row, col }, { row, col: col + 1 })
        }
        if (row < 7) {
          this.grid.swapCells({ row, col }, { row: row + 1, col })
          if (this.matcher.hasMatches()) {
            this.grid.swapCells({ row, col }, { row: row + 1, col })
            return [{ row, col }, { row: row + 1, col }]
          }
          this.grid.swapCells({ row, col }, { row: row + 1, col })
        }
      }
    }
    return null
  }

  shuffle(): void {
    const allCells: { color: number; special: SpecialType }[] = []
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        allCells.push({
          color: this.grid.grid[row][col].color,
          special: this.grid.grid[row][col].special
        })
      }
    }
    
    for (let i = allCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allCells[i], allCells[j]] = [allCells[j], allCells[i]]
    }
    
    let index = 0
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.grid.grid[row][col].color = allCells[index].color as any
        this.grid.grid[row][col].special = allCells[index].special
        this.grid.grid[row][col].isMatched = false
        index++
      }
    }
    this.notifyStateChange()
  }

  resetGame(): void {
    this.grid = new GameGrid()
    this.matcher = new Matcher(this.grid)
    this.gravity = new GravitySystem(this.grid)
    this.specialSystem = new SpecialBlockSystem(this.grid)
    
    this.state = {
      grid: this.grid.grid,
      score: 0,
      moves: 0,
      maxMoves: 30,
      combo: 0,
      isAnimating: false,
      selectedCell: null
    }
    this.notifyStateChange()
  }
}
