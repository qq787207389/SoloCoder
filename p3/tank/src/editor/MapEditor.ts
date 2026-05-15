import { TileMap } from '../map/TileMap';
import { TileType } from '../constants';
import gameConfig from '../config/gameConfig.json';

const TILE_SIZE = gameConfig.game.tileSize;

export class MapEditor {
  private map: TileMap;
  private currentTile: TileType;
  private isActive: boolean;
  private history: number[][][];
  private historyIndex: number;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.map = new TileMap();
    this.currentTile = TileType.BRICK;
    this.isActive = false;
    this.history = [];
    this.historyIndex = -1;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this.isActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    if (e.button === 0) {
      this.placeTile(x, y);
    } else if (e.button === 2) {
      this.removeTile(x, y);
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isActive) return;
    
    if (e.buttons === 1) {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
      const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
      this.placeTile(x, y);
    } else if (e.buttons === 2) {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
      const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
      this.removeTile(x, y);
    }
  }

  private saveState(): void {
    const state = this.map.export();
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex++;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.map.import(this.history[this.historyIndex]);
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.map.import(this.history[this.historyIndex]);
    }
  }

  placeTile(x: number, y: number): void {
    if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
      this.saveState();
      this.map.setTile(x, y, this.currentTile);
    }
  }

  removeTile(x: number, y: number): void {
    if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
      this.saveState();
      this.map.setTile(x, y, TileType.EMPTY);
    }
  }

  setCurrentTile(tile: TileType): void {
    this.currentTile = tile;
  }

  getCurrentTile(): TileType {
    return this.currentTile;
  }

  clear(): void {
    this.saveState();
    this.map.clear();
  }

  exportMap(): number[][] {
    return this.map.export();
  }

  importMap(data: number[][]): void {
    this.saveState();
    this.map.import(data);
  }

  getMap(): TileMap {
    return this.map;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  getActive(): boolean {
    return this.isActive;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.map.render(ctx, 0, 0);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.map.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, this.map.height * TILE_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= this.map.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(this.map.width * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }
  }
}
