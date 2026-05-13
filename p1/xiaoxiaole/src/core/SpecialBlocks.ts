import { GRID_SIZE, SpecialType, Position } from '../types'
import { GameGrid } from './Grid'

export class SpecialBlockSystem {
  private grid: GameGrid
  private triggeredPositions: Set<string>

  constructor(grid: GameGrid) {
    this.grid = grid
    this.triggeredPositions = new Set()
  }

  resetTriggered(): void {
    this.triggeredPositions.clear()
  }

  triggerSpecial(pos: Position): Position[] {
    const key = `${pos.row},${pos.col}`
    if (this.triggeredPositions.has(key)) return []
    
    this.triggeredPositions.add(key)
    const cell = this.grid.getCell(pos.row, pos.col)
    if (!cell) return []

    switch (cell.special) {
      case SpecialType.HORIZONTAL_ROCKET:
        return this.triggerHorizontalRocket(pos)
      case SpecialType.VERTICAL_ROCKET:
        return this.triggerVerticalRocket(pos)
      case SpecialType.BOMB:
        return this.triggerBomb(pos)
      case SpecialType.RAINBOW:
        return this.triggerRainbow(pos)
      default:
        return []
    }
  }

  private triggerHorizontalRocket(pos: Position): Position[] {
    const affected: Position[] = []
    for (let col = 0; col < GRID_SIZE; col++) {
      if (this.grid.getCell(pos.row, col)) {
        affected.push({ row: pos.row, col })
        this.grid.grid[pos.row][col].isMatched = true
      }
    }
    return affected
  }

  private triggerVerticalRocket(pos: Position): Position[] {
    const affected: Position[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      if (this.grid.getCell(row, pos.col)) {
        affected.push({ row, col: pos.col })
        this.grid.grid[row][pos.col].isMatched = true
      }
    }
    return affected
  }

  private triggerBomb(pos: Position): Position[] {
    const affected: Position[] = []
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const row = pos.row + dr
        const col = pos.col + dc
        if (this.grid.getCell(row, col)) {
          affected.push({ row, col })
          this.grid.grid[row][col].isMatched = true
        }
      }
    }
    return affected
  }

  private triggerRainbow(pos: Position): Position[] {
    const affected: Position[] = []
    const targetColor = this.findMostCommonColor()
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = this.grid.getCell(row, col)
        if (cell && cell.color === targetColor) {
          affected.push({ row, col })
          cell.isMatched = true
        }
      }
    }
    return affected
  }

  private findMostCommonColor(): number {
    const counts: Record<number, number> = {}
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = this.grid.grid[row][col]
        counts[cell.color] = (counts[cell.color] || 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as unknown as number
  }

  handleSpecialCombination(pos1: Position, pos2: Position): Position[] {
    const cell1 = this.grid.getCell(pos1.row, pos1.col)
    const cell2 = this.grid.getCell(pos2.row, pos2.col)
    
    if (!cell1 || !cell2) return []
    
    const s1 = cell1.special
    const s2 = cell2.special
    
    if (s1 === SpecialType.NONE && s2 === SpecialType.NONE) return []
    
    const affected: Position[] = []
    
    if ((s1 === SpecialType.HORIZONTAL_ROCKET && s2 === SpecialType.VERTICAL_ROCKET) ||
        (s1 === SpecialType.VERTICAL_ROCKET && s2 === SpecialType.HORIZONTAL_ROCKET)) {
      affected.push(...this.triggerCrossRocket(pos1))
    }
    else if ((s1 === SpecialType.BOMB && s2 === SpecialType.BOMB)) {
      affected.push(...this.triggerBigBomb(pos1))
    }
    else if ((s1 === SpecialType.RAINBOW || s2 === SpecialType.RAINBOW)) {
      const otherPos = s1 === SpecialType.RAINBOW ? pos2 : pos1
      affected.push(...this.triggerRainbowCombo(otherPos))
    }
    else if ((s1 === SpecialType.RAINBOW && (s2 === SpecialType.HORIZONTAL_ROCKET || s2 === SpecialType.VERTICAL_ROCKET)) ||
             (s2 === SpecialType.RAINBOW && (s1 === SpecialType.HORIZONTAL_ROCKET || s1 === SpecialType.VERTICAL_ROCKET))) {
      affected.push(...this.triggerRainbowRocketCombo(pos1))
    }
    
    return affected
  }

  private triggerCrossRocket(pos: Position): Position[] {
    const affected: Position[] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      if (this.grid.getCell(pos.row, i)) {
        affected.push({ row: pos.row, col: i })
        this.grid.grid[pos.row][i].isMatched = true
      }
      if (this.grid.getCell(i, pos.col) && i !== pos.row) {
        affected.push({ row: i, col: pos.col })
        this.grid.grid[i][pos.col].isMatched = true
      }
    }
    return affected
  }

  private triggerBigBomb(pos: Position): Position[] {
    const affected: Position[] = []
    for (let dr = -3; dr <= 3; dr++) {
      for (let dc = -3; dc <= 3; dc++) {
        const row = pos.row + dr
        const col = pos.col + dc
        if (this.grid.getCell(row, col)) {
          affected.push({ row, col })
          this.grid.grid[row][col].isMatched = true
        }
      }
    }
    return affected
  }

  private triggerRainbowCombo(pos: Position): Position[] {
    const affected: Position[] = []
    const cell = this.grid.getCell(pos.row, pos.col)
    if (!cell) return affected
    
    const targetColor = cell.color
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const c = this.grid.getCell(row, col)
        if (c && c.color === targetColor) {
          affected.push({ row, col })
          c.isMatched = true
        }
      }
    }
    return affected
  }

  private triggerRainbowRocketCombo(pos: Position): Position[] {
    const affected: Position[] = []
    const cell = this.grid.getCell(pos.row, pos.col)
    if (!cell) return affected
    
    const targetColor = cell.color
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const c = this.grid.getCell(row, col)
        if (c && c.color === targetColor) {
          c.special = Math.random() > 0.5 ? SpecialType.HORIZONTAL_ROCKET : SpecialType.VERTICAL_ROCKET
          affected.push({ row, col })
          c.isMatched = true
        }
      }
    }
    return affected
  }

  createSpecialBlock(pos: Position, type: SpecialType): void {
    const cell = this.grid.getCell(pos.row, pos.col)
    if (cell) {
      cell.special = type
      cell.isMatched = false
    }
  }

  processChainReaction(initialMatches: Position[]): Position[] {
    const allAffected: Position[] = [...initialMatches]
    let queue: Position[] = [...initialMatches]
    const processed = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()!
      const key = `${current.row},${current.col}`
      
      if (processed.has(key)) continue
      processed.add(key)
      
      const cell = this.grid.getCell(current.row, current.col)
      if (cell && cell.special !== SpecialType.NONE && !this.triggeredPositions.has(key)) {
        const triggered = this.triggerSpecial(current)
        for (const t of triggered) {
          const tKey = `${t.row},${t.col}`
          if (!processed.has(tKey)) {
            allAffected.push(t)
            queue.push(t)
          }
        }
      }
    }
    
    return allAffected
  }
}
