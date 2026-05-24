import type {
  Unit, Building, ResourceNode, FogData, Camera, GameResources, BuildingType
} from '../types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private miniMapCtx: CanvasRenderingContext2D;
  private tileSize: number;
  private mapWidth: number;
  private mapHeight: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    miniMapCtx: CanvasRenderingContext2D,
    tileSize: number,
    mapWidth: number,
    mapHeight: number
  ) {
    this.ctx = ctx;
    this.miniMapCtx = miniMapCtx;
    this.tileSize = tileSize;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  clear(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  renderGround(camera: Camera): void {
    const startX = Math.floor(camera.x / this.tileSize);
    const startY = Math.floor(camera.y / this.tileSize);
    const endX = Math.ceil((camera.x + this.ctx.canvas.width / camera.zoom) / this.tileSize);
    const endY = Math.ceil((camera.y + this.ctx.canvas.height / camera.zoom) / this.tileSize);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const screenX = (x * this.tileSize - camera.x) * camera.zoom;
        const screenY = (y * this.tileSize - camera.y) * camera.zoom;
        const size = this.tileSize * camera.zoom;

        const isLight = (x + y) % 2 === 0;
        this.ctx.fillStyle = isLight ? '#2d3436' : '#353b48';
        this.ctx.fillRect(screenX, screenY, size + 1, size + 1);
      }
    }
  }

  renderResources(resources: ResourceNode[], camera: Camera, fog: FogData): void {
    for (const resource of resources) {
      if (resource.amount <= 0) continue;

      const screenX = (resource.x - camera.x) * camera.zoom;
      const screenY = (resource.y - camera.y) * camera.zoom;
      const size = this.tileSize * camera.zoom;

      if (screenX < -size || screenY < -size ||
          screenX > this.ctx.canvas.width + size ||
          screenY > this.ctx.canvas.height + size) {
        continue;
      }

      const gridX = Math.floor(resource.x / this.tileSize);
      const gridY = Math.floor(resource.y / this.tileSize);
      if (!fog.explored[gridY]?.[gridX]) continue;

      if (resource.type === 'gold') {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${size * 0.3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('金', screenX, screenY + size * 0.1);
      } else {
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(screenX - size * 0.15, screenY - size * 0.4, size * 0.3, size * 0.8);

        this.ctx.fillStyle = '#27ae60';
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY - size * 0.6);
        this.ctx.lineTo(screenX - size * 0.4, screenY);
        this.ctx.lineTo(screenX + size * 0.4, screenY);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }

  renderBuildings(buildings: Building[], camera: Camera, fog: FogData, isPlayer: boolean): void {
    for (const building of buildings) {
      const screenX = (building.x - camera.x) * camera.zoom;
      const screenY = (building.y - camera.y) * camera.zoom;
      const width = building.width * camera.zoom;
      const height = building.height * camera.zoom;

      if (screenX + width < 0 || screenY + height < 0 ||
          screenX > this.ctx.canvas.width || screenY > this.ctx.canvas.height) {
        continue;
      }

      const gridX = Math.floor((building.x + building.width / 2) / this.tileSize);
      const gridY = Math.floor((building.y + building.height / 2) / this.tileSize);
      const visible = fog.visible[gridY]?.[gridX];
      const explored = fog.explored[gridY]?.[gridX];

      if (!explored && !isPlayer) continue;

      const alpha = visible ? 1 : 0.5;
      this.ctx.globalAlpha = alpha;

      const ownerColor = building.owner === 'player' ? '#3498db' : '#e74c3c';

      this.ctx.fillStyle = building.isComplete ? '#5d6d7e' : '#7f8c8d';
      this.ctx.fillRect(screenX, screenY, width, height);

      this.ctx.strokeStyle = ownerColor;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(screenX, screenY, width, height);

      if (!building.isComplete) {
        const progressWidth = width * (building.buildProgress / 100);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(screenX, screenY - 8 * camera.zoom, progressWidth, 4 * camera.zoom);
      }

      const icon = this.getBuildingIcon(building.buildingType);
      this.ctx.fillStyle = '#ecf0f1';
      this.ctx.font = `${height * 0.5}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(icon, screenX + width / 2, screenY + height / 2);

      if (building.health < building.maxHealth) {
        const healthWidth = width * 0.8;
        const healthX = screenX + (width - healthWidth) / 2;
        const healthY = screenY + height + 4 * camera.zoom;
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(healthX, healthY, healthWidth, 4 * camera.zoom);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(healthX, healthY, healthWidth * (building.health / building.maxHealth), 4 * camera.zoom);
      }

      this.ctx.globalAlpha = 1;
    }
  }

  private getBuildingIcon(type: string): string {
    const icons: Record<string, string> = {
      base: '🏰',
      barracks: '⚔️',
      tower: '🗼',
      blacksmith: '🔨'
    };
    return icons[type] || '?';
  }

  renderUnits(units: Unit[], camera: Camera, fog: FogData, selectedIds: Set<string>): void {
    for (const unit of units) {
      if (unit.state === 'dead') continue;

      const screenX = (unit.x + unit.width / 2 - camera.x) * camera.zoom;
      const screenY = (unit.y + unit.height / 2 - camera.y) * camera.zoom;
      const size = unit.width * camera.zoom;

      if (screenX < -size || screenY < -size ||
          screenX > this.ctx.canvas.width + size ||
          screenY > this.ctx.canvas.height + size) {
        continue;
      }

      const gridX = Math.floor((unit.x + unit.width / 2) / this.tileSize);
      const gridY = Math.floor((unit.y + unit.height / 2) / this.tileSize);
      const isPlayer = unit.owner === 'player';
      const visible = fog.visible[gridY]?.[gridX];

      if (!visible && !isPlayer) continue;

      const ownerColor = isPlayer ? '#3498db' : '#e74c3c';

      if (selectedIds.has(unit.id)) {
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, size * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = ownerColor;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();

      const icon = this.getUnitIcon(unit.unitType);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = `${size * 0.7}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(icon, screenX, screenY);

      if (unit.carryingResource) {
        const resColor = unit.carryingResource.type === 'gold' ? '#f1c40f' : '#8b4513';
        this.ctx.fillStyle = resColor;
        this.ctx.beginPath();
        this.ctx.arc(screenX + size * 0.4, screenY - size * 0.4, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (unit.health < unit.maxHealth) {
        const healthWidth = size * 1.2;
        const healthX = screenX - healthWidth / 2;
        const healthY = screenY - size * 0.9;
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(healthX, healthY, healthWidth, 3 * camera.zoom);
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(healthX, healthY, healthWidth * (unit.health / unit.maxHealth), 3 * camera.zoom);
      }
    }
  }

  private getUnitIcon(type: string): string {
    const icons: Record<string, string> = {
      worker: '👷',
      infantry: '🗡️',
      archer: '🏹',
      cavalry: '🐴'
    };
    return icons[type] || '?';
  }

  renderFog(fog: FogData, camera: Camera): void {
    const startX = Math.floor(camera.x / this.tileSize);
    const startY = Math.floor(camera.y / this.tileSize);
    const endX = Math.ceil((camera.x + this.ctx.canvas.width / camera.zoom) / this.tileSize);
    const endY = Math.ceil((camera.y + this.ctx.canvas.height / camera.zoom) / this.tileSize);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y < 0 || y >= this.mapHeight || x < 0 || x >= this.mapWidth) continue;

        const screenX = (x * this.tileSize - camera.x) * camera.zoom;
        const screenY = (y * this.tileSize - camera.y) * camera.zoom;
        const size = this.tileSize * camera.zoom;

        if (!fog.explored[y][x]) {
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
          this.ctx.fillRect(screenX, screenY, size + 1, size + 1);
        } else if (!fog.visible[y][x]) {
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          this.ctx.fillRect(screenX, screenY, size + 1, size + 1);
        }
      }
    }
  }

  renderBuildingPreview(
    buildingType: BuildingType,
    x: number,
    y: number,
    canPlace: boolean,
    camera: Camera,
    config: any
  ): void {
    const screenX = (x - camera.x) * camera.zoom;
    const screenY = (y - camera.y) * camera.zoom;
    const width = config.size.width * this.tileSize * camera.zoom;
    const height = config.size.height * this.tileSize * camera.zoom;

    this.ctx.globalAlpha = 0.6;
    this.ctx.fillStyle = canPlace ? '#2ecc71' : '#e74c3c';
    this.ctx.fillRect(screenX, screenY, width, height);
    this.ctx.strokeStyle = canPlace ? '#27ae60' : '#c0392b';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(screenX, screenY, width, height);

    const icon = this.getBuildingIcon(buildingType);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${Math.min(width, height) * 0.5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon, screenX + width / 2, screenY + height / 2);
    this.ctx.globalAlpha = 1;
  }

  renderMiniMap(
    units: Unit[],
    buildings: Building[],
    resources: ResourceNode[],
    fog: FogData,
    camera: Camera
  ): void {
    const miniWidth = this.miniMapCtx.canvas.width;
    const miniHeight = this.miniMapCtx.canvas.height;
    const scaleX = miniWidth / (this.mapWidth * this.tileSize);
    const scaleY = miniHeight / (this.mapHeight * this.tileSize);

    this.miniMapCtx.fillStyle = '#0a0a15';
    this.miniMapCtx.fillRect(0, 0, miniWidth, miniHeight);

    for (const resource of resources) {
      if (resource.amount <= 0) continue;
      this.miniMapCtx.fillStyle = resource.type === 'gold' ? '#f1c40f' : '#654321';
      this.miniMapCtx.fillRect(
        resource.x * scaleX - 1,
        resource.y * scaleY - 1,
        2, 2
      );
    }

    for (const building of buildings) {
      this.miniMapCtx.fillStyle = building.owner === 'player' ? '#3498db' : '#e74c3c';
      this.miniMapCtx.fillRect(
        building.x * scaleX,
        building.y * scaleY,
        building.width * scaleX,
        building.height * scaleY
      );
    }

    for (const unit of units) {
      if (unit.state === 'dead') continue;
      this.miniMapCtx.fillStyle = unit.owner === 'player' ? '#3498db' : '#e74c3c';
      this.miniMapCtx.fillRect(
        unit.x * scaleX,
        unit.y * scaleY,
        2, 2
      );
    }

    this.miniMapCtx.strokeStyle = '#fff';
    this.miniMapCtx.lineWidth = 1;
    this.miniMapCtx.strokeRect(
      camera.x * scaleX,
      camera.y * scaleY,
      (this.ctx.canvas.width / camera.zoom) * scaleX,
      (this.ctx.canvas.height / camera.zoom) * scaleY
    );
  }

  resize(width: number, height: number): void {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }
}
