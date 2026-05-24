import type { Unit, Building, FogData } from '../types';

export class FogSystem {
  private width: number;
  private height: number;
  private tileSize: number;

  constructor(width: number, height: number, tileSize: number) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
  }

  createFogData(): FogData {
    const explored: boolean[][] = [];
    const visible: boolean[][] = [];

    for (let y = 0; y < this.height; y++) {
      explored[y] = [];
      visible[y] = [];
      for (let x = 0; x < this.width; x++) {
        explored[y][x] = false;
        visible[y][x] = false;
      }
    }

    return { explored, visible };
  }

  updateFog(
    fog: FogData,
    playerUnits: Unit[],
    playerBuildings: Building[]
  ): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        fog.visible[y][x] = false;
      }
    }

    for (const unit of playerUnits) {
      if (unit.state === 'dead') continue;
      this.revealArea(
        fog,
        Math.floor((unit.x + unit.width / 2) / this.tileSize),
        Math.floor((unit.y + unit.height / 2) / this.tileSize),
        unit.visionRange
      );
    }

    for (const building of playerBuildings) {
      this.revealArea(
        fog,
        Math.floor((building.x + building.width / 2) / this.tileSize),
        Math.floor((building.y + building.height / 2) / this.tileSize),
        6
      );
    }
  }

  private revealArea(fog: FogData, centerX: number, centerY: number, radius: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          fog.visible[y][x] = true;
          fog.explored[y][x] = true;
        }
      }
    }
  }

  isVisible(fog: FogData, x: number, y: number): boolean {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) return false;
    return fog.visible[gridY][gridX];
  }

  isExplored(fog: FogData, x: number, y: number): boolean {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) return false;
    return fog.explored[gridY][gridX];
  }

  isAreaVisible(fog: FogData, x: number, y: number, width: number, height: number): boolean {
    const startX = Math.floor(x / this.tileSize);
    const startY = Math.floor(y / this.tileSize);
    const endX = Math.floor((x + width) / this.tileSize);
    const endY = Math.floor((y + height) / this.tileSize);

    for (let gy = startY; gy <= endY; gy++) {
      for (let gx = startX; gx <= endX; gx++) {
        if (gx >= 0 && gx < this.width && gy >= 0 && gy < this.height) {
          if (fog.visible[gy][gx]) return true;
        }
      }
    }
    return false;
  }
}
