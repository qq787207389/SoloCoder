import { Platform, TILE_SIZE, TILE_DECORATION } from '../utils/Constants';

const THEME_COLORS: Record<string, Record<number, string>> = {
  bamboo: {
    1: '#3d5c3a',
    2: '#5d8a3c',
    3: '#2d4a7a',
    4: '#8b4513',
    5: '#2d5a2e',
  },
  castle: {
    1: '#5d5d5d',
    2: '#7f7f7f',
    3: '#3d3d5d',
    4: '#4a4a4a',
    5: '#4a4a5a',
  },
  volcano: {
    1: '#5d3a1a',
    2: '#7f4a2a',
    3: '#c0392b',
    4: '#3d2a1a',
    5: '#6a3a1a',
  },
};

export class TileMap {
  tiles: number[][] = [];
  upperPlatforms: Platform[] = [];
  width = 0;
  height = 0;
  tileSize = TILE_SIZE;
  private lavaAnimTimer = 0;

  load(levelData: { tiles: number[][]; upperPlatforms: Platform[] }): void {
    this.tiles = levelData.tiles;
    this.upperPlatforms = levelData.upperPlatforms;
    this.height = this.tiles.length;
    this.width = this.height > 0 ? this.tiles[0].length : 0;
    this.lavaAnimTimer = 0;
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, theme: string): void {
    const colors = THEME_COLORS[theme] || THEME_COLORS.bamboo;
    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(this.width, Math.ceil((camera.x + 480) / this.tileSize) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(this.height, Math.ceil((camera.y + 320) / this.tileSize) + 1);

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tile = this.tiles[row]?.[col];
        if (!tile) continue;

        const screenX = col * this.tileSize - camera.x;
        const screenY = row * this.tileSize - camera.y;

        if (tile === 1) {
          ctx.fillStyle = colors[1];
          ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          if (row === 0 || this.tiles[row - 1]?.[col] !== 1) {
            ctx.fillStyle = theme === 'bamboo' ? '#5d8a3c' : theme === 'castle' ? '#9f9f9f' : '#8f5a2a';
            ctx.fillRect(screenX, screenY, this.tileSize, 3);
            ctx.fillRect(screenX + 2, screenY, 2, 1);
            ctx.fillRect(screenX + 7, screenY, 1, 2);
            ctx.fillRect(screenX + 12, screenY, 2, 1);
          }
          ctx.fillStyle = theme === 'bamboo' ? '#2d4c2a' : theme === 'castle' ? '#4d4d4d' : '#4d2a0a';
          ctx.fillRect(screenX + 4, screenY + 6, 1, 1);
          ctx.fillRect(screenX + 10, screenY + 10, 2, 1);
        } else if (tile === 2) {
          ctx.fillStyle = colors[2];
          ctx.fillRect(screenX, screenY, this.tileSize, 4);
          ctx.fillRect(screenX + 1, screenY + 4, 2, this.tileSize - 4);
          ctx.fillRect(screenX + this.tileSize - 3, screenY + 4, 2, this.tileSize - 4);
        } else if (tile === 3) {
          if (theme === 'volcano') {
            const pulse = Math.sin(this.lavaAnimTimer * 3) * 0.15;
            const r = Math.floor(192 + pulse * 60);
            const g = Math.floor(57 + pulse * 30);
            ctx.fillStyle = `rgb(${r},${g},43)`;
          } else {
            ctx.fillStyle = colors[3];
          }
          ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          const waveOffset = Math.sin(this.lavaAnimTimer * 2 + col * 0.5) * 2;
          ctx.fillStyle = theme === 'volcano' ? '#e74c3c' : '#4a6a9a';
          ctx.fillRect(screenX + 2 + waveOffset, screenY + 3, 4, 1);
          ctx.fillRect(screenX + 9 - waveOffset, screenY + 8, 3, 1);
        } else if (tile === 4) {
          ctx.fillStyle = colors[4];
          ctx.fillRect(screenX + 2, screenY + 4, 4, this.tileSize - 4);
          ctx.fillRect(screenX + 10, screenY + 2, 4, this.tileSize - 2);
          ctx.fillStyle = theme === 'bamboo' ? '#a0522d' : theme === 'castle' ? '#6a6a6a' : '#5a3a1a';
          ctx.beginPath();
          ctx.moveTo(screenX + 2, screenY + 4);
          ctx.lineTo(screenX + 4, screenY);
          ctx.lineTo(screenX + 6, screenY + 4);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(screenX + 10, screenY + 2);
          ctx.lineTo(screenX + 12, screenY - 2);
          ctx.lineTo(screenX + 14, screenY + 2);
          ctx.fill();
        } else if (tile === 5) {
          ctx.fillStyle = colors[5];
          ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
          if (theme === 'bamboo') {
            ctx.fillStyle = '#1a4a1a';
            ctx.fillRect(screenX + 2, screenY, 2, this.tileSize);
            ctx.fillRect(screenX + 12, screenY, 2, this.tileSize);
            ctx.fillStyle = '#1a5a1a';
            for (let i = 0; i < this.tileSize; i += 4) {
              ctx.fillRect(screenX + 1, screenY + i, this.tileSize - 2, 1);
            }
          } else if (theme === 'castle') {
            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(screenX + 1, screenY, 2, this.tileSize);
            ctx.fillRect(screenX + 13, screenY, 2, this.tileSize);
            ctx.fillStyle = '#5a5a6a';
            for (let i = 0; i < this.tileSize; i += 4) {
              ctx.fillRect(screenX + 1, screenY + i, this.tileSize - 2, 1);
            }
          } else if (theme === 'volcano') {
            ctx.fillStyle = '#4a2a0a';
            ctx.fillRect(screenX + 1, screenY, 2, this.tileSize);
            ctx.fillRect(screenX + 13, screenY, 2, this.tileSize);
            ctx.fillStyle = '#7a4a1a';
            for (let i = 0; i < this.tileSize; i += 3) {
              ctx.fillRect(screenX + 2, screenY + i, this.tileSize - 4, 1);
            }
          }
        }
      }
    }

    for (const plat of this.upperPlatforms) {
      const platScreenX = plat.x - camera.x;
      const platScreenY = plat.y - camera.y;
      if (platScreenX + plat.width < 0 || platScreenX > 480) continue;
      if (platScreenY + 8 < 0 || platScreenY > 320) continue;
      ctx.fillStyle = colors[2];
      ctx.fillRect(platScreenX, platScreenY, plat.width, 4);
      ctx.fillRect(platScreenX + 2, platScreenY + 4, 2, 4);
      ctx.fillRect(platScreenX + plat.width - 4, platScreenY + 4, 2, 4);
    }

    this.lavaAnimTimer += 1 / 60;
  }

  isSolid(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.height || tileX < 0 || tileX >= this.width) {
      return tileY >= this.height;
    }
    return this.tiles[tileY][tileX] === 1;
  }

  isPlatform(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.height || tileX < 0 || tileX >= this.width) {
      return false;
    }
    return this.tiles[tileY][tileX] === 2;
  }

  isDamage(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.height || tileX < 0 || tileX >= this.width) {
      return false;
    }
    const tile = this.tiles[tileY][tileX];
    return tile === 3 || tile === 4;
  }

  resolveCollision(entity: {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    layer: string;
  }): { grounded: boolean; hitDamage: boolean } {
    let grounded = false;
    let hitDamage = false;

    const left = Math.floor(entity.x / this.tileSize);
    const right = Math.floor((entity.x + entity.width - 1) / this.tileSize);
    const top = Math.floor(entity.y / this.tileSize);
    const bottom = Math.floor((entity.y + entity.height - 1) / this.tileSize);

    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (this.isDamage(col, row)) {
          hitDamage = true;
        }
      }
    }

    if (entity.vy >= 0) {
      const feetRow = Math.floor((entity.y + entity.height) / this.tileSize);
      const entityLeft = Math.floor((entity.x + 2) / this.tileSize);
      const entityRight = Math.floor((entity.x + entity.width - 3) / this.tileSize);

      for (let col = entityLeft; col <= entityRight; col++) {
        if (this.isSolid(col, feetRow)) {
          entity.y = feetRow * this.tileSize - entity.height;
          entity.vy = 0;
          grounded = true;
        }
        if (this.isPlatform(col, feetRow)) {
          const prevFeetRow = Math.floor((entity.y + entity.height - entity.vy - 1) / this.tileSize);
          if (prevFeetRow < feetRow) {
            entity.y = feetRow * this.tileSize - entity.height;
            entity.vy = 0;
            grounded = true;
          }
        }
      }

      if (!grounded) {
        const plat = this.checkUpperPlatform(entity);
        if (plat) {
          entity.y = plat.y - entity.height;
          entity.vy = 0;
          grounded = true;
        }
      }
    }

    if (entity.vx > 0) {
      const rightCol = Math.floor((entity.x + entity.width) / this.tileSize);
      const topCheck = Math.floor((entity.y + 2) / this.tileSize);
      const bottomCheck = Math.floor((entity.y + entity.height - 2) / this.tileSize);
      for (let row = topCheck; row <= bottomCheck; row++) {
        if (this.isSolid(rightCol, row)) {
          entity.x = rightCol * this.tileSize - entity.width;
          entity.vx = 0;
          break;
        }
      }
    } else if (entity.vx < 0) {
      const leftCol = Math.floor(entity.x / this.tileSize);
      const topCheck = Math.floor((entity.y + 2) / this.tileSize);
      const bottomCheck = Math.floor((entity.y + entity.height - 2) / this.tileSize);
      for (let row = topCheck; row <= bottomCheck; row++) {
        if (this.isSolid(leftCol, row)) {
          entity.x = (leftCol + 1) * this.tileSize;
          entity.vx = 0;
          break;
        }
      }
    }

    if (entity.vy < 0) {
      const headRow = Math.floor(entity.y / this.tileSize);
      const headLeft = Math.floor((entity.x + 2) / this.tileSize);
      const headRight = Math.floor((entity.x + entity.width - 3) / this.tileSize);
      for (let col = headLeft; col <= headRight; col++) {
        if (this.isSolid(col, headRow)) {
          entity.y = (headRow + 1) * this.tileSize;
          entity.vy = 0;
          break;
        }
      }
    }

    return { grounded, hitDamage };
  }

  checkUpperPlatform(entity: {
    x: number;
    y: number;
    width: number;
    height: number;
    vy: number;
    layer: string;
  }): Platform | null {
    if (entity.vy < 0) return null;
    if (entity.layer !== 'ground') return null;

    const entityBottom = entity.y + entity.height;
    const prevBottom = entityBottom - entity.vy;

    for (const plat of this.upperPlatforms) {
      if (plat.layer !== 'upper') continue;
      if (entity.x + entity.width <= plat.x || entity.x >= plat.x + plat.width) continue;
      if (prevBottom <= plat.y && entityBottom >= plat.y) {
        return plat;
      }
    }

    return null;
  }

  getTileAt(worldX: number, worldY: number): number {
    const col = Math.floor(worldX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return 0;
    }
    return this.tiles[row][col];
  }
}
