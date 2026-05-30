import { TILE_SIZE, TILE, MAP_COLS, MAP_ROWS, HOLE_DURATION, type TileType } from './constants';
import type { Level, Hole, Gold, Position, TilePosition } from './types';

export class GameMap {
  private tiles: TileType[][];
  private holes: Hole[] = [];
  private golds: Gold[] = [];
  private exitPosition: Position | null = null;
  private level: Level;
  private originalTiles: TileType[][];

  constructor(level: Level) {
    this.level = level;
    this.tiles = [];
    this.originalTiles = [];
    this.loadLevel(level);
  }

  private loadLevel(level: Level): void {
    this.holes = [];
    this.golds = [];
    this.exitPosition = null;
    this.tiles = [];
    this.originalTiles = [];

    for (let row = 0; row < MAP_ROWS; row++) {
      this.tiles[row] = [];
      this.originalTiles[row] = [];
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = level.map[row][col] as TileType;
        if (tile === TILE.GOLD) {
          this.golds.push({ col, row, collected: false, animFrame: 0 });
          this.tiles[row][col] = TILE.EMPTY;
          this.originalTiles[row][col] = TILE.EMPTY;
        } else if (tile === TILE.EXIT) {
          this.exitPosition = { x: col, y: row };
          this.tiles[row][col] = TILE.LADDER;
          this.originalTiles[row][col] = TILE.LADDER;
        } else if (tile === TILE.PLAYER_SPAWN || tile === TILE.ENEMY_SPAWN) {
          this.tiles[row][col] = TILE.EMPTY;
          this.originalTiles[row][col] = TILE.EMPTY;
        } else {
          this.tiles[row][col] = tile;
          this.originalTiles[row][col] = tile;
        }
      }
    }
  }

  reset(): void {
    this.loadLevel(this.level);
  }

  getTile(col: number, row: number): TileType {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
      return TILE.BRICK;
    }
    return this.tiles[row][col];
  }

  isSolid(col: number, row: number): boolean {
    const tile = this.getTile(col, row);
    return tile === TILE.BRICK || tile === TILE.STEEL;
  }

  isLadder(col: number, row: number): boolean {
    const tile = this.getTile(col, row);
    return tile === TILE.LADDER || tile === TILE.EXIT;
  }

  isHole(col: number, row: number): boolean {
    return this.holes.some(h => h.col === col && h.row === row);
  }

  isDiggable(col: number, row: number): boolean {
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
    const tile = this.getTile(col, row);
    return tile === TILE.BRICK && !this.isHole(col, row);
  }

  digHole(col: number, row: number): boolean {
    if (!this.isDiggable(col, row)) return false;
    if (this.isHole(col, row)) return false;
    this.holes.push({
      col,
      row,
      timer: HOLE_DURATION,
      originalTile: this.tiles[row][col],
    });
    this.tiles[row][col] = TILE.HOLE;
    return true;
  }

  update(dt: number): void {
    for (let i = this.holes.length - 1; i >= 0; i--) {
      const hole = this.holes[i];
      hole.timer -= dt * 1000;
      if (hole.timer <= 0) {
        this.tiles[hole.row][hole.col] = hole.originalTile;
        this.holes.splice(i, 1);
      }
    }
  }

  getHoles(): Hole[] {
    return [...this.holes];
  }

  getGolds(): Gold[] {
    return this.golds;
  }

  collectGold(col: number, row: number): boolean {
    const gold = this.golds.find(g => g.col === col && g.row === row && !g.collected);
    if (gold) {
      gold.collected = true;
      return true;
    }
    return false;
  }

  getRemainingGold(): number {
    return this.golds.filter(g => !g.collected).length;
  }

  getTotalGold(): number {
    return this.golds.length;
  }

  activateExit(): void {
    if (this.exitPosition) {
      this.tiles[this.exitPosition.y][this.exitPosition.x] = TILE.EXIT;
    }
  }

  deactivateExit(): void {
    if (this.exitPosition) {
      this.tiles[this.exitPosition.y][this.exitPosition.x] = TILE.LADDER;
    }
  }

  isExitActive(): boolean {
    if (!this.exitPosition) return false;
    return this.tiles[this.exitPosition.y][this.exitPosition.x] === TILE.EXIT;
  }

  getExitPosition(): Position | null {
    return this.exitPosition;
  }

  worldToTile(x: number, y: number): TilePosition {
    return {
      col: Math.floor(x / TILE_SIZE),
      row: Math.floor(y / TILE_SIZE),
    };
  }

  tileToWorld(col: number, row: number): Position {
    return {
      x: col * TILE_SIZE,
      y: row * TILE_SIZE,
    };
  }

  getCols(): number {
    return MAP_COLS;
  }

  getRows(): number {
    return MAP_ROWS;
  }
}
