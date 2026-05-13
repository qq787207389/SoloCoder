import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';
import { Piece, PieceType } from './Piece';

export type Cell = {
  filled: boolean;
  color: string;
  type?: PieceType;
};

export class Board {
  grid: Cell[][];
  width: number;
  height: number;

  constructor(width = BOARD_WIDTH, height = BOARD_HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({
        filled: false,
        color: 'transparent'
      }))
    );
  }

  reset(): void {
    this.grid = this.createEmptyGrid();
  }

  isValidPosition(piece: Piece, offsetX = 0, offsetY = 0): boolean {
    const blocks = piece.getBlocks();
    for (const block of blocks) {
      const x = block.x + offsetX;
      const y = block.y + offsetY;
      
      if (x < 0 || x >= this.width || y >= this.height) {
        return false;
      }
      
      if (y >= 0 && this.grid[y][x].filled) {
        return false;
      }
    }
    return true;
  }

  placePiece(piece: Piece): void {
    const blocks = piece.getBlocks();
    for (const block of blocks) {
      if (block.y >= 0) {
        this.grid[block.y][block.x] = {
          filled: true,
          color: piece.color,
          type: piece.type
        };
      }
    }
  }

  getGhostY(piece: Piece): number {
    let ghostY = piece.y;
    while (this.isValidPosition(piece, 0, ghostY - piece.y + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  clearLines(): { linesCleared: number; clearedRows: number[] } {
    const clearedRows: number[] = [];
    
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell.filled)) {
        clearedRows.push(y);
      }
    }

    for (const row of clearedRows) {
      this.grid.splice(row, 1);
      this.grid.unshift(
        Array.from({ length: this.width }, () => ({
          filled: false,
          color: 'transparent'
        }))
      );
    }

    return {
      linesCleared: clearedRows.length,
      clearedRows
    };
  }

  addGarbageLines(count: number, holeColumn?: number): void {
    for (let i = 0; i < count; i++) {
      const hole = holeColumn ?? Math.floor(Math.random() * this.width);
      const garbageRow: Cell[] = Array.from({ length: this.width }, (_, x) => ({
        filled: x !== hole,
        color: x !== hole ? '#666666' : 'transparent'
      }));
      
      this.grid.push(garbageRow);
      this.grid.shift();
    }
  }

  isEmpty(): boolean {
    return this.grid.every(row => row.every(cell => !cell.filled));
  }

  getLineFillCount(y: number): number {
    return this.grid[y].filter(cell => cell.filled).length;
  }
}
