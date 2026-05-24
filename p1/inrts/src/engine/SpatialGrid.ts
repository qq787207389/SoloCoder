import type { Unit, Building, Position } from '../types';

export class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, (Unit | Building)[]>;
  private width: number;
  private height: number;

  constructor(cellSize: number, width: number, height: number) {
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
    this.grid = new Map();
  }

  private getKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`;
  }

  private getGridX(x: number): number {
    return Math.floor(x / this.cellSize);
  }

  private getGridY(y: number): number {
    return Math.floor(y / this.cellSize);
  }

  clear(): void {
    this.grid.clear();
  }

  insert(entity: Unit | Building): void {
    const minX = this.getGridX(entity.x);
    const minY = this.getGridY(entity.y);
    const maxX = this.getGridX(entity.x + entity.width);
    const maxY = this.getGridY(entity.y + entity.height);

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const key = this.getKey(gx, gy);
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(entity);
      }
    }
  }

  queryCircle(x: number, y: number, radius: number): (Unit | Building)[] {
    const results: Set<Unit | Building> = new Set();
    const minGX = Math.max(0, this.getGridX(x - radius));
    const minGY = Math.max(0, this.getGridY(y - radius));
    const maxGX = Math.min(this.width - 1, this.getGridX(x + radius));
    const maxGY = Math.min(this.height - 1, this.getGridY(y + radius));

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const key = this.getKey(gx, gy);
        const cell = this.grid.get(key);
        if (cell) {
          for (const entity of cell) {
            const ex = entity.x + entity.width / 2;
            const ey = entity.y + entity.height / 2;
            const dist = Math.sqrt((ex - x) ** 2 + (ey - y) ** 2);
            if (dist <= radius + Math.max(entity.width, entity.height) / 2) {
              results.add(entity);
            }
          }
        }
      }
    }

    return Array.from(results);
  }

  queryRect(
    x: number,
    y: number,
    width: number,
    height: number
  ): (Unit | Building)[] {
    const results: Set<Unit | Building> = new Set();
    const minGX = Math.max(0, this.getGridX(x));
    const minGY = Math.max(0, this.getGridY(y));
    const maxGX = Math.min(this.width - 1, this.getGridX(x + width));
    const maxGY = Math.min(this.height - 1, this.getGridY(y + height));

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        const key = this.getKey(gx, gy);
        const cell = this.grid.get(key);
        if (cell) {
          for (const entity of cell) {
            if (this.rectIntersectsRect(
              entity.x, entity.y, entity.width, entity.height,
              x, y, width, height
            )) {
              results.add(entity);
            }
          }
        }
      }
    }

    return Array.from(results);
  }

  private rectIntersectsRect(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  getNearbyUnits(unit: Unit, radius: number): Unit[] {
    return this.queryCircle(unit.x + unit.width / 2, unit.y + unit.height / 2, radius)
      .filter((e): e is Unit => e.type === 'unit' && e.id !== unit.id);
  }

  getNearbyEnemies(
    x: number,
    y: number,
    radius: number,
    owner: 'player' | 'ai'
  ): (Unit | Building)[] {
    return this.queryCircle(x, y, radius)
      .filter(e => e.owner !== owner && 'health' in e && e.health > 0);
  }
}
