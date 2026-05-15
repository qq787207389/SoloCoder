import { TileType, COLORS } from '../constants';
import { Vector2 } from '../math/Vector2';
import { Rectangle } from '../math/Rectangle';
import gameConfig from '../config/gameConfig.json';

const TILE_SIZE = gameConfig.game.tileSize;
const MAP_WIDTH = gameConfig.game.mapWidth;
const MAP_HEIGHT = gameConfig.game.mapHeight;

export class TileMap {
  public width: number;
  public height: number;
  public tileSize: number;
  public tiles: number[][];
  private basePosition: Vector2;

  constructor(width: number = MAP_WIDTH, height: number = MAP_HEIGHT) {
    this.width = width;
    this.height = height;
    this.tileSize = TILE_SIZE;
    this.tiles = this.createEmptyMap();
    this.basePosition = new Vector2(gameConfig.base.position.x, gameConfig.base.position.y);
  }

  private createEmptyMap(): number[][] {
    const map: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = TileType.EMPTY;
      }
    }
    return map;
  }

  generateDefaultMap(): void {
    this.tiles = this.createEmptyMap();
    
    for (let x = 0; x < this.width; x++) {
      this.tiles[0][x] = TileType.STEEL;
      this.tiles[this.height - 1][x] = TileType.STEEL;
    }
    for (let y = 0; y < this.height; y++) {
      this.tiles[y][0] = TileType.STEEL;
      this.tiles[y][this.width - 1] = TileType.STEEL;
    }

    for (let y = 2; y < this.height - 2; y += 2) {
      for (let x = 2; x < this.width - 2; x += 2) {
        if (Math.random() > 0.3) {
          this.tiles[y][x] = TileType.BRICK;
        }
      }
    }

    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * (this.width - 4)) + 2;
      const y = Math.floor(Math.random() * (this.height - 4)) + 2;
      this.tiles[y][x] = Math.random() > 0.5 ? TileType.WATER : TileType.FOREST;
    }

    this.setBase(this.basePosition.x, this.basePosition.y);
  }

  setBase(x: number, y: number): void {
    this.basePosition.set(x, y);
    this.tiles[y][x] = TileType.BASE;
    if (y > 0) this.tiles[y - 1][x] = TileType.BRICK;
    if (x > 0) this.tiles[y][x - 1] = TileType.BRICK;
    if (x < this.width - 1) this.tiles[y][x + 1] = TileType.BRICK;
  }

  getTile(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TileType.STEEL;
    }
    return this.tiles[y][x];
  }

  setTile(x: number, y: number, type: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }

  getTileAtWorld(worldX: number, worldY: number): number {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);
    return this.getTile(tileX, tileY);
  }

  isSolid(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.WATER || tile === TileType.BASE;
  }

  isDestructible(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.BRICK;
  }

  destroyTile(x: number, y: number): boolean {
    if (this.isDestructible(x, y)) {
      this.setTile(x, y, TileType.EMPTY);
      return true;
    }
    return false;
  }

  protectBase(): void {
    const x = this.basePosition.x;
    const y = this.basePosition.y;
    if (y > 0) this.tiles[y - 1][x] = TileType.STEEL;
    if (x > 0) this.tiles[y][x - 1] = TileType.STEEL;
    if (x < this.width - 1) this.tiles[y][x + 1] = TileType.STEEL;
    if (y > 0 && x > 0) this.tiles[y - 1][x - 1] = TileType.STEEL;
    if (y > 0 && x < this.width - 1) this.tiles[y - 1][x + 1] = TileType.STEEL;
  }

  getSpawnPoints(): Vector2[] {
    return [
      new Vector2(1 * this.tileSize, 1 * this.tileSize),
      new Vector2((this.width - 2) * this.tileSize, 1 * this.tileSize),
      new Vector2(Math.floor(this.width / 2) * this.tileSize, 1 * this.tileSize)
    ];
  }

  getPlayerSpawnPoints(): Vector2[] {
    return [
      new Vector2(3 * this.tileSize, (this.height - 2) * this.tileSize),
      new Vector2((this.width - 4) * this.tileSize, (this.height - 2) * this.tileSize)
    ];
  }

  getBaseBounds(): Rectangle {
    return new Rectangle(
      this.basePosition.x * this.tileSize,
      this.basePosition.y * this.tileSize,
      this.tileSize,
      this.tileSize
    );
  }

  getTileBounds(tileX: number, tileY: number): Rectangle {
    return new Rectangle(
      tileX * this.tileSize,
      tileY * this.tileSize,
      this.tileSize,
      this.tileSize
    );
  }

  getWorldBounds(): Rectangle {
    return new Rectangle(0, 0, this.width * this.tileSize, this.height * this.tileSize);
  }

  render(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        const px = x * this.tileSize + offsetX;
        const py = y * this.tileSize + offsetY;
        
        switch (tile) {
          case TileType.BRICK:
            this.renderBrick(ctx, px, py);
            break;
          case TileType.STEEL:
            this.renderSteel(ctx, px, py);
            break;
          case TileType.WATER:
            this.renderWater(ctx, px, py);
            break;
          case TileType.FOREST:
            this.renderForest(ctx, px, py);
            break;
          case TileType.BASE:
            this.renderBase(ctx, px, py);
            break;
        }
      }
    }
  }

  private renderBrick(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.BRICK;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1;
    const half = this.tileSize / 2;
    ctx.strokeRect(x + 1, y + 1, half - 2, half - 2);
    ctx.strokeRect(x + half, y + 1, half - 2, half - 2);
    ctx.strokeRect(x + 1, y + half, half - 2, half - 2);
    ctx.strokeRect(x + half, y + half, half - 2, half - 2);
  }

  private renderSteel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.STEEL;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 2, y + 2, this.tileSize - 8, 4);
    ctx.fillRect(x + 2, y + this.tileSize - 6, this.tileSize - 8, 4);
  }

  private renderWater(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.WATER;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    ctx.strokeStyle = '#6ab0e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + this.tileSize / 2);
    ctx.quadraticCurveTo(x + this.tileSize / 4, y + this.tileSize / 3, x + this.tileSize / 2, y + this.tileSize / 2);
    ctx.quadraticCurveTo(x + this.tileSize * 3 / 4, y + this.tileSize * 2 / 3, x + this.tileSize, y + this.tileSize / 2);
    ctx.stroke();
  }

  private renderForest(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.FOREST;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    ctx.fillStyle = '#32cd32';
    for (let i = 0; i < 5; i++) {
      const fx = x + 4 + (i % 3) * 10;
      const fy = y + 4 + Math.floor(i / 3) * 12;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 10);
      ctx.lineTo(fx + 5, fy);
      ctx.lineTo(fx + 10, fy + 10);
      ctx.fill();
    }
  }

  private renderBase(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = COLORS.BASE;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(x + this.tileSize / 2, y + 4);
    ctx.lineTo(x + this.tileSize - 4, y + this.tileSize - 4);
    ctx.lineTo(x + 4, y + this.tileSize - 4);
    ctx.closePath();
    ctx.fill();
  }

  export(): number[][] {
    return this.tiles.map(row => [...row]);
  }

  import(data: number[][]): void {
    if (data.length === this.height && data[0].length === this.width) {
      this.tiles = data.map(row => [...row]);
    }
  }

  clear(): void {
    this.tiles = this.createEmptyMap();
  }
}
