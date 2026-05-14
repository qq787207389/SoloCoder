import { Rect } from './Entity';

interface SpatialObject {
  getBounds(): Rect;
}

export class SpatialHash {
  private cellSize: number;
  private grid: Map<string, SpatialObject[]>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  private getKeysForBounds(bounds: Rect): string[] {
    const keys: string[] = [];
    const startX = Math.floor(bounds.x / this.cellSize);
    const endX = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const startY = Math.floor(bounds.y / this.cellSize);
    const endY = Math.floor((bounds.y + bounds.height) / this.cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        keys.push(`${x},${y}`);
      }
    }
    return keys;
  }

  public insert(obj: SpatialObject): void {
    const bounds = obj.getBounds();
    const keys = this.getKeysForBounds(bounds);
    keys.forEach(key => {
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      const cell = this.grid.get(key)!;
      if (!cell.includes(obj)) {
        cell.push(obj);
      }
    });
  }

  public remove(obj: SpatialObject): void {
    const bounds = obj.getBounds();
    const keys = this.getKeysForBounds(bounds);
    keys.forEach(key => {
      const cell = this.grid.get(key);
      if (cell) {
        const index = cell.indexOf(obj);
        if (index !== -1) {
          cell.splice(index, 1);
        }
        if (cell.length === 0) {
          this.grid.delete(key);
        }
      }
    });
  }

  public query(bounds: Rect): SpatialObject[] {
    const candidates: Set<SpatialObject> = new Set();
    const keys = this.getKeysForBounds(bounds);
    keys.forEach(key => {
      const cell = this.grid.get(key);
      if (cell) {
        cell.forEach(obj => candidates.add(obj));
      }
    });
    return Array.from(candidates);
  }

  public clear(): void {
    this.grid.clear();
  }
}