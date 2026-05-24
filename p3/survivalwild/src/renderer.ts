import { GameState, TerrainType, WeatherType, ITEM_INFO, BuildingType, BUILDING_INFO, AnimalType, AnimalState } from './types';
import { MAP_SIZE, TILE_SIZE } from './mapGenerator';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private minimap: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, minimap: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.minimap = minimap;
    this.minimapCtx = minimap.getContext('2d')!;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.minimap.width = 150;
    this.minimap.height = 150;

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    });
  }

  render(state: GameState): void {
    const { player, map, resources, buildings, animals, timeOfDay, weather } = state;

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const cameraX = player.x - this.width / 2;
    const cameraY = player.y - this.height / 2;

    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE) - 1);
    const endTileX = Math.min(MAP_SIZE, Math.ceil((cameraX + this.width) / TILE_SIZE) + 1);
    const endTileY = Math.min(MAP_SIZE, Math.ceil((cameraY + this.height) / TILE_SIZE) + 1);

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = map[y][x];
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;
        this.ctx.fillStyle = this.getTerrainColor(tile.terrain);
        this.ctx.fillRect(screenX, screenY, TILE_SIZE + 1, TILE_SIZE + 1);
      }
    }

    buildings.forEach(building => {
      const screenX = building.x - cameraX;
      const screenY = building.y - cameraY;
      
      if (screenX > -TILE_SIZE && screenX < this.width + TILE_SIZE &&
          screenY > -TILE_SIZE && screenY < this.height + TILE_SIZE) {
        const info = BUILDING_INFO[building.type];
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(info.icon, screenX, screenY + 8);
        
        if (building.type === BuildingType.CAMPFIRE && building.lit) {
          const gradient = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 80);
          gradient.addColorStop(0, 'rgba(255, 150, 50, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(screenX - 80, screenY - 80, 160, 160);
        }
      }
    });

    resources.forEach(res => {
      if (res.amount <= 0) return;
      
      const screenX = res.x - cameraX;
      const screenY = res.y - cameraY;
      
      if (screenX > -TILE_SIZE && screenX < this.width + TILE_SIZE &&
          screenY > -TILE_SIZE && screenY < this.height + TILE_SIZE) {
        const info = ITEM_INFO[res.type];
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(info.icon, screenX, screenY + 6);
      }
    });

    animals.forEach(animal => {
      if (animal.state === AnimalState.DEAD) return;
      
      const screenX = animal.x - cameraX;
      const screenY = animal.y - cameraY;
      
      if (screenX > -50 && screenX < this.width + 50 &&
          screenY > -50 && screenY < this.height + 50) {
        let emoji = '🐗';
        if (animal.type === AnimalType.SNAKE) emoji = '🐍';
        if (animal.type === AnimalType.WOLF) emoji = '🐺';
        
        this.ctx.font = '28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(emoji, screenX, screenY + 10);

        const barWidth = 30;
        const healthPercent = animal.health / animal.maxHealth;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(screenX - barWidth / 2, screenY - 25, barWidth, 4);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        this.ctx.fillRect(screenX - barWidth / 2, screenY - 25, barWidth * healthPercent, 4);
      }
    });

    const playerScreenX = player.x - cameraX;
    const playerScreenY = player.y - cameraY;
    
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🧑', playerScreenX, playerScreenY + 12);

    this.renderTimeEffects(timeOfDay, weather);
    this.renderMinimap(state);
  }

  private getTerrainColor(terrain: TerrainType): string {
    switch (terrain) {
      case TerrainType.WATER: return '#3498db';
      case TerrainType.SAND: return '#f4d03f';
      case TerrainType.GRASS: return '#27ae60';
      case TerrainType.FOREST: return '#1e8449';
      case TerrainType.MOUNTAIN: return '#7f8c8d';
      case TerrainType.CAVE: return '#34495e';
      default: return '#000';
    }
  }

  private renderTimeEffects(timeOfDay: number, weather: WeatherType): void {
    let darkness = 0;
    
    if (timeOfDay < 0.25 || timeOfDay > 0.85) {
      darkness = 0.6;
    } else if (timeOfDay < 0.3 || timeOfDay > 0.8) {
      darkness = 0.3;
    }

    if (weather === WeatherType.STORM) darkness += 0.3;
    else if (weather === WeatherType.RAIN) darkness += 0.15;
    else if (weather === WeatherType.CLOUDY) darkness += 0.1;

    darkness = Math.min(0.8, darkness);

    if (darkness > 0) {
      this.ctx.fillStyle = `rgba(10, 10, 30, ${darkness})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    if (weather === WeatherType.RAIN || weather === WeatherType.STORM) {
      this.ctx.strokeStyle = 'rgba(150, 180, 255, 0.4)';
      this.ctx.lineWidth = 1;
      const rainCount = weather === WeatherType.STORM ? 200 : 100;
      
      for (let i = 0; i < rainCount; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 2, y + 15);
        this.ctx.stroke();
      }
    }
  }

  private renderMinimap(state: GameState): void {
    const { player, map, buildings } = state;
    const scale = this.minimap.width / (MAP_SIZE * TILE_SIZE);

    this.minimapCtx.fillStyle = '#1a1a2e';
    this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);

    for (let y = 0; y < MAP_SIZE; y += 2) {
      for (let x = 0; x < MAP_SIZE; x += 2) {
        const tile = map[y][x];
        this.minimapCtx.fillStyle = this.getTerrainColor(tile.terrain);
        this.minimapCtx.fillRect(
          x * TILE_SIZE * scale,
          y * TILE_SIZE * scale,
          TILE_SIZE * 2 * scale + 1,
          TILE_SIZE * 2 * scale + 1
        );
      }
    }

    buildings.forEach(b => {
      this.minimapCtx.fillStyle = '#f39c12';
      this.minimapCtx.fillRect(b.x * scale - 2, b.y * scale - 2, 4, 4);
    });

    this.minimapCtx.fillStyle = '#e74c3c';
    this.minimapCtx.beginPath();
    this.minimapCtx.arc(player.x * scale, player.y * scale, 3, 0, Math.PI * 2);
    this.minimapCtx.fill();
  }
}
