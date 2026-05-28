import { LevelData, ThemeType, EnemyType, ItemType, WeaponType } from '../types';
import { COLORS } from '../utils';

export class Level {
  private data: LevelData;
  private tileSize: number = 32;

  constructor(levelData: LevelData) {
    this.data = levelData;
  }

  public getData(): LevelData {
    return this.data;
  }

  public getWidth(): number {
    return this.data.width * this.tileSize;
  }

  public getHeight(): number {
    return this.data.height * this.tileSize;
  }

  public getTileSize(): number {
    return this.tileSize;
  }

  public getTheme(): ThemeType {
    return this.data.theme;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const colors = COLORS[this.data.theme];
    const startTileX = Math.floor(cameraX / this.tileSize);
    const startTileY = Math.floor(cameraY / this.tileSize);
    const endTileX = Math.ceil((cameraX + canvasWidth) / this.tileSize);
    const endTileY = Math.ceil((cameraY + canvasHeight) / this.tileSize);

    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        if (y < 0 || y >= this.data.height || x < 0 || x >= this.data.width) {
          continue;
        }

        const tileType = this.data.tiles[y]?.[x] ?? 0;
        const screenX = x * this.tileSize - cameraX;
        const screenY = y * this.tileSize - cameraY;

        this.renderTile(ctx, screenX, screenY, tileType, colors);
      }
    }

    this.renderDecorations(ctx, cameraX, cameraY, canvasWidth, canvasHeight);
  }

  private renderTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: number,
    colors: typeof COLORS.jungle
  ): void {
    const size = this.tileSize;

    switch (type) {
      case 0:
        ctx.fillStyle = colors.ground;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors.groundDark;
        if ((x + y) % 64 === 0) {
          ctx.fillRect(x + 4, y + 4, 4, 4);
        }
        break;

      case 1:
        ctx.fillStyle = colors.road;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors.groundDark;
        ctx.fillRect(x, y, size, 2);
        ctx.fillRect(x, y + size - 2, size, 2);
        break;

      case 2:
        ctx.fillStyle = colors.water;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors.water + 'aa';
        ctx.fillRect(x + 4, y + 8, size - 8, 2);
        ctx.fillRect(x + 8, y + 20, size - 12, 2);
        break;

      case 3:
        ctx.fillStyle = colors.ground;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors.building;
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 8, y + 8, size - 16, size - 16);
        break;

      case 4:
        ctx.fillStyle = colors.ground;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = colors.tree;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.tree + '88';
        ctx.beginPath();
        ctx.arc(x + size / 2 - 4, y + size / 2 - 4, size / 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 5:
        ctx.fillStyle = colors.ground;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.fillStyle = '#6B5344';
        ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
        break;

      default:
        ctx.fillStyle = colors.ground;
        ctx.fillRect(x, y, size, size);
    }
  }

  private renderDecorations(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let i = 0; i < 50; i++) {
      const x = ((i * 137) % canvasWidth) - (cameraX % 50);
      const y = ((i * 89) % canvasHeight) - (cameraY % 50);
      ctx.fillRect(x, y, 2, 2);
    }
  }

  public isSolidTile(worldX: number, worldY: number): boolean {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    if (tileY < 0 || tileY >= this.data.height || tileX < 0 || tileX >= this.data.width) {
      return true;
    }

    const tileType = this.data.tiles[tileY]?.[tileX] ?? 0;
    return tileType === 2 || tileType === 3 || tileType === 4;
  }

  public getTileAt(worldX: number, worldY: number): number {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    if (tileY < 0 || tileY >= this.data.height || tileX < 0 || tileX >= this.data.width) {
      return 0;
    }

    return this.data.tiles[tileY]?.[tileX] ?? 0;
  }
}

export function createDemoLevel(): LevelData {
  const width = 100;
  const height = 40;
  const tiles: number[][] = [];

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = 0;
    }
  }

  for (let x = 0; x < width; x++) {
    tiles[Math.floor(height / 2)][x] = 1;
    tiles[Math.floor(height / 2) - 1][x] = 1;
  }

  for (let x = 20; x < 25; x++) {
    tiles[0][x] = 2;
    tiles[1][x] = 2;
  }

  for (let x = 50; x < 55; x++) {
    tiles[height - 1][x] = 2;
    tiles[height - 2][x] = 2;
  }

  const buildingPositions = [
    [15, 5], [30, 8], [45, 3], [60, 10], [75, 5], [85, 8]
  ];
  for (const [bx, by] of buildingPositions) {
    tiles[by][bx] = 3;
    tiles[by + 1][bx] = 3;
  }

  for (let i = 0; i < 50; i++) {
    const tx = Math.floor(Math.random() * width);
    const ty = Math.floor(Math.random() * height);
    if (tiles[ty][tx] === 0) {
      tiles[ty][tx] = 4;
    }
  }

  return {
    id: 1,
    name: '丛林突袭',
    type: 'horizontal',
    width,
    height,
    scrollSpeed: 0.05,
    theme: 'jungle',
    tiles,
    enemies: [
      { type: 'infantry' as EnemyType, x: 500, y: 600 },
      { type: 'infantry' as EnemyType, x: 700, y: 550 },
      { type: 'infantry' as EnemyType, x: 900, y: 650 },
      { type: 'rocketeer' as EnemyType, x: 1200, y: 600 },
      { type: 'bunker' as EnemyType, x: 1500, y: 580 },
      { type: 'infantry' as EnemyType, x: 1800, y: 550 },
      { type: 'infantry' as EnemyType, x: 1850, y: 620 },
      { type: 'tank' as EnemyType, x: 2200, y: 600 },
      { type: 'rocketeer' as EnemyType, x: 2500, y: 580 },
      { type: 'helicopter' as EnemyType, x: 2800, y: 400 },
      { type: 'bunker' as EnemyType, x: 3000, y: 620 },
      { type: 'infantry' as EnemyType, x: 3200, y: 550 },
      { type: 'infantry' as EnemyType, x: 3250, y: 650 },
    ],
    hostages: [
      { x: 600, y: 580 },
      { x: 650, y: 580 },
      { x: 1400, y: 560 },
      { x: 1450, y: 560 },
      { x: 2600, y: 600 },
      { x: 2650, y: 600 },
    ],
    items: [
      { type: 'health' as ItemType, x: 800, y: 600, value: 30 },
      { type: 'ammo' as ItemType, x: 1100, y: 580, value: 20, weaponType: 'grenade' as WeaponType },
      { type: 'health' as ItemType, x: 2000, y: 620, value: 30 },
      { type: 'weapon' as ItemType, x: 2400, y: 560, value: 1, weaponType: 'missile' as WeaponType },
      { type: 'ammo' as ItemType, x: 2900, y: 600, value: 30, weaponType: 'flame' as WeaponType },
    ],
    totalHostages: 6,
    totalBuildings: 6
  };
}
