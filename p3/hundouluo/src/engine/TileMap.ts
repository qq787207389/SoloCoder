import { Rect } from './Entity';

export interface TileData {
  id: number;
  solid: boolean;
  color: string;
}

export class TileMap {
  public tileSize: number;
  public width: number;
  public height: number;
  public tiles: number[][];
  public tileData: Map<number, TileData>;

  constructor(tileSize: number, width: number, height: number) {
    this.tileSize = tileSize;
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.tileData = new Map();
    this.initTiles();
  }

  private initTiles(): void {
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = 0;
      }
    }
  }

  public setTileData(id: number, data: TileData): void {
    this.tileData.set(id, data);
  }

  public setTile(x: number, y: number, tileId: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = tileId;
    }
  }

  public getTile(x: number, y: number): number {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y][x];
    }
    return 0;
  }

  public isSolid(x: number, y: number): boolean {
    const tileId = this.getTile(x, y);
    const data = this.tileData.get(tileId);
    return data?.solid || false;
  }

  public checkCollision(bounds: Rect): boolean {
    const startTileX = Math.floor(bounds.x / this.tileSize);
    const endTileX = Math.floor((bounds.x + bounds.width) / this.tileSize);
    const startTileY = Math.floor(bounds.y / this.tileSize);
    const endTileY = Math.floor((bounds.y + bounds.height) / this.tileSize);

    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        if (this.isSolid(x, y)) {
          return true;
        }
      }
    }
    return false;
  }

  public getGroundY(x: number, width: number, playerY?: number): number {
    const leftTileX = Math.floor(x / this.tileSize);
    const rightTileX = Math.floor((x + width) / this.tileSize);
    
    for (let tileY = this.height - 1; tileY >= 0; tileY--) {
      for (let tileX = leftTileX; tileX <= rightTileX; tileX++) {
        if (this.isSolid(tileX, tileY)) {
          return tileY * this.tileSize;
        }
      }
    }
    return (this.height - 1) * this.tileSize;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, viewWidth: number, viewHeight: number): void {
    const startTileX = Math.floor(cameraX / this.tileSize);
    const endTileX = Math.ceil((cameraX + viewWidth) / this.tileSize);
    const startTileY = 0;
    const endTileY = this.height;

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        const tileId = this.getTile(x, y);
        const data = this.tileData.get(tileId);
        if (data) {
          ctx.fillStyle = data.color;
          ctx.fillRect(
            x * this.tileSize - cameraX,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
  }
}