import { GameState, TileType, BuildingType } from '../types';
import { gridToIso, TILE_WIDTH, TILE_HEIGHT } from '../utils/isometric';
import { getBuildingConfig } from '../utils/buildings';

export class IsometricRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(state: GameState) {
    const { camera, map, mapSize, selectedPosition, selectedTool } = state;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(camera.x + this.width / 2, camera.y + this.height / 3);
    this.ctx.scale(camera.zoom, camera.zoom);

    const renderOrder: { depth: number; render: () => void }[] = [];

    for (let y = 0; y < mapSize.height; y++) {
      for (let x = 0; x < mapSize.width; x++) {
        const tile = map[y][x];
        const { isoX, isoY } = gridToIso(x, y);
        const depth = x + y;

        renderOrder.push({
          depth,
          render: () => this.drawTile(tile, isoX, isoY)
        });

        if (tile.buildingId) {
          const building = state.buildings.get(tile.buildingId);
          if (building) {
            renderOrder.push({
              depth: depth + 0.5,
              render: () => this.drawBuilding(building.type, building.level, isoX, isoY)
            });
          }
        }
      }
    }

    renderOrder.sort((a, b) => a.depth - b.depth);
    renderOrder.forEach(item => item.render());

    if (selectedPosition) {
      const { isoX, isoY } = gridToIso(selectedPosition.x, selectedPosition.y);
      this.drawHighlight(isoX, isoY);

      if (selectedTool !== 'select') {
        this.drawGhost(selectedTool, isoX, isoY);
      }
    }

    this.ctx.restore();
  }

  private drawTile(tile: any, isoX: number, isoY: number) {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.closePath();

    let baseColor = '#4a7c23';
    switch (tile.type) {
      case TileType.ROAD:
        baseColor = '#4a4a4a';
        break;
      case TileType.RESIDENTIAL:
        baseColor = tile.buildingId ? '#4a7c23' : '#7cb342';
        break;
      case TileType.COMMERCIAL:
        baseColor = tile.buildingId ? '#4a7c23' : '#64b5f6';
        break;
      case TileType.INDUSTRIAL:
        baseColor = tile.buildingId ? '#4a7c23' : '#ffb74d';
        break;
      case TileType.WATER:
        baseColor = '#2196f3';
        break;
      case TileType.ELECTRICITY:
        baseColor = '#ffeb3b';
        break;
      case TileType.PARK:
        baseColor = '#2e7d32';
        break;
      case TileType.POLICE:
      case TileType.FIRE_STATION:
      case TileType.SCHOOL:
      case TileType.HOSPITAL:
        baseColor = '#4a7c23';
        break;
    }

    ctx.fillStyle = baseColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (tile.type === TileType.ROAD) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(isoX, isoY + TILE_HEIGHT / 2);
      ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 4);
      ctx.moveTo(isoX, isoY + TILE_HEIGHT / 2);
      ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  private drawBuilding(type: BuildingType, level: number, isoX: number, isoY: number) {
    const ctx = this.ctx;
    const config = getBuildingConfig(type);
    const colors = config.colors;
    const buildingHeight = 20 + level * 15;

    const topX = isoX;
    const topY = isoY - buildingHeight;

    ctx.fillStyle = this.shadeColor(colors.base, -20);
    ctx.beginPath();
    ctx.moveTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX, topY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX - TILE_WIDTH / 2, topY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.shadeColor(colors.base, -10);
    ctx.beginPath();
    ctx.moveTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX, topY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX + TILE_WIDTH / 2, topY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.roof;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(topX + TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
    ctx.lineTo(topX, topY + TILE_HEIGHT);
    ctx.lineTo(topX - TILE_WIDTH / 2, topY + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (level > 1) {
      ctx.fillStyle = colors.accent;
      for (let i = 0; i < level; i++) {
        const windowY = topY + 10 + i * 12;
        ctx.fillRect(topX - 8, windowY, 5, 6);
        ctx.fillRect(topX + 3, windowY, 5, 6);
      }
    }
  }

  private drawHighlight(isoX: number, isoY: number) {
    const ctx = this.ctx;

    ctx.strokeStyle = '#ff9500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.stroke();
  }

  private drawGhost(tool: string, isoX: number, isoY: number) {
    const ctx = this.ctx;
    ctx.globalAlpha = 0.5;

    let color = '#ffffff';
    switch (tool) {
      case 'road':
        color = '#4a4a4a';
        break;
      case 'residential':
        color = '#7cb342';
        break;
      case 'commercial':
        color = '#64b5f6';
        break;
      case 'industrial':
        color = '#ffb74d';
        break;
      case 'police':
        color = '#1E90FF';
        break;
      case 'fire_station':
        color = '#FF4500';
        break;
      case 'school':
        color = '#FFD700';
        break;
      case 'hospital':
        color = '#FFFFFF';
        break;
      case 'park':
        color = '#228B22';
        break;
      case 'demolish':
        color = '#ff0000';
        break;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(isoX, isoY);
    ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.lineTo(isoX, isoY + TILE_HEIGHT);
    ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  private shadeColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255))
        .toString(16)
        .slice(1)
    );
  }
}
