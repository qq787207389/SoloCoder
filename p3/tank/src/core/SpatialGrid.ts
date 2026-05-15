import { Rectangle } from '../math/Rectangle';
import { GameObject } from './GameObject';

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Set<GameObject>>;
  private bounds: Rectangle;

  constructor(cellSize: number, bounds: Rectangle) {
    this.cellSize = cellSize;
    this.bounds = bounds;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private getCellIndices(bounds: Rectangle): { startX: number; startY: number; endX: number; endY: number } {
    const startX = Math.floor((bounds.left - this.bounds.x) / this.cellSize);
    const startY = Math.floor((bounds.top - this.bounds.y) / this.cellSize);
    const endX = Math.ceil((bounds.right - this.bounds.x) / this.cellSize);
    const endY = Math.ceil((bounds.bottom - this.bounds.y) / this.cellSize);
    return { startX, startY, endX, endY };
  }

  insert(obj: GameObject): void {
    const { startX, startY, endX, endY } = this.getCellIndices(obj.bounds);
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = this.getKey(x, y);
        if (!this.grid.has(key)) {
          this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(obj);
      }
    }
  }

  remove(obj: GameObject): void {
    const { startX, startY, endX, endY } = this.getCellIndices(obj.bounds);
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = this.getKey(x, y);
        const cell = this.grid.get(key);
        if (cell) {
          cell.delete(obj);
          if (cell.size === 0) {
            this.grid.delete(key);
          }
        }
      }
    }
  }

  update(obj: GameObject): void {
    this.remove(obj);
    this.insert(obj);
  }

  query(bounds: Rectangle): GameObject[] {
    const candidates = new Set<GameObject>();
    const { startX, startY, endX, endY } = this.getCellIndices(bounds);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = this.getKey(x, y);
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(obj => candidates.add(obj));
        }
      }
    }
    
    return Array.from(candidates).filter(obj => obj.bounds.intersects(bounds));
  }

  queryNearby(obj: GameObject, radius: number): GameObject[] {
    const expandedBounds = obj.bounds.clone().inflate(radius, radius);
    return this.query(expandedBounds).filter(o => o.id !== obj.id);
  }

  clear(): void {
    this.grid.clear();
  }
}
