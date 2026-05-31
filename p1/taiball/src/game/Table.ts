import type { Table as TableType, TableShape, Pocket, WallSegment, Obstacle } from '../types/game';
import { PHYSICS, COLORS, TABLE_OFFSET_X, TABLE_OFFSET_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/constants';
import { createNoiseTexture } from '../utils/render';

export class Table implements TableType {
  x: number;
  y: number;
  width: number;
  height: number;
  cushionWidth: number;
  playArea: { left: number; right: number; top: number; bottom: number };
  pockets: Pocket[];
  shape: TableShape;
  walls: WallSegment[];
  obstacles: Obstacle[];
  
  private noiseTexture: HTMLCanvasElement | null = null;

  constructor(shape: TableShape = 'rectangle') {
    this.x = TABLE_OFFSET_X;
    this.y = TABLE_OFFSET_Y;
    this.width = PHYSICS.TABLE_WIDTH;
    this.height = PHYSICS.TABLE_HEIGHT;
    this.cushionWidth = PHYSICS.CUSHION_WIDTH;
    this.shape = shape;
    this.walls = [];
    this.obstacles = [];

    this.playArea = {
      left: this.x + this.cushionWidth,
      right: this.x + this.width - this.cushionWidth,
      top: this.y + this.cushionWidth,
      bottom: this.y + this.height - this.cushionWidth,
    };

    this.pockets = this.createPockets();
    this.setupShape();
    this.noiseTexture = createNoiseTexture(CANVAS_WIDTH, CANVAS_HEIGHT, 0.06);
  }

  private createPockets(): Pocket[] {
    const pr = PHYSICS.POCKET_RADIUS;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    if (this.shape === 'annular') {
      return [
        { x: this.x + this.cushionWidth, y: cy, radius: pr },
        { x: this.x + this.width - this.cushionWidth, y: cy, radius: pr },
        { x: cx, y: this.y + this.cushionWidth, radius: pr },
        { x: cx, y: this.y + this.height - this.cushionWidth, radius: pr },
      ];
    }

    return [
      { x: this.x + this.cushionWidth, y: this.y + this.cushionWidth, radius: pr },
      { x: cx, y: this.y + this.cushionWidth - 2, radius: pr },
      { x: this.x + this.width - this.cushionWidth, y: this.y + this.cushionWidth, radius: pr },
      { x: this.x + this.cushionWidth, y: this.y + this.height - this.cushionWidth, radius: pr },
      { x: cx, y: this.y + this.height - this.cushionWidth + 2, radius: pr },
      { x: this.x + this.width - this.cushionWidth, y: this.y + this.height - this.cushionWidth, radius: pr },
    ];
  }

  private setupShape(): void {
    const { left, right, top, bottom } = this.playArea;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    switch (this.shape) {
      case 'l-shape':
        this.walls = [
          { x1: left, y1: top, x2: right, y2: top },
          { x1: right, y1: top, x2: right, y2: bottom },
          { x1: right, y1: bottom, x2: left, y2: bottom },
          { x1: left, y1: bottom, x2: left, y2: cy + 40 },
          { x1: left, y1: cy + 40, x2: cx + 40, y2: cy + 40 },
          { x1: cx + 40, y1: cy + 40, x2: cx + 40, y2: top },
          { x1: cx + 40, y1: top, x2: left, y2: top },
        ];
        this.pockets = [
          { x: left, y: top, radius: PHYSICS.POCKET_RADIUS },
          { x: right, y: top, radius: PHYSICS.POCKET_RADIUS },
          { x: right, y: bottom, radius: PHYSICS.POCKET_RADIUS },
          { x: left, y: bottom, radius: PHYSICS.POCKET_RADIUS },
          { x: cx + 40, y: cy + 40, radius: PHYSICS.POCKET_RADIUS },
          { x: left, y: cy + 40, radius: PHYSICS.POCKET_RADIUS },
        ];
        break;

      case 'annular':
        const outerR = Math.min(this.width, this.height) / 2 - this.cushionWidth;
        const innerR = outerR * 0.4;
        const segments = 32;
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;
          this.walls.push({
            x1: cx + Math.cos(a1) * outerR,
            y1: cy + Math.sin(a1) * outerR,
            x2: cx + Math.cos(a2) * outerR,
            y2: cy + Math.sin(a2) * outerR,
          });
          this.walls.push({
            x1: cx + Math.cos(a2) * innerR,
            y1: cy + Math.sin(a2) * innerR,
            x2: cx + Math.cos(a1) * innerR,
            y2: cy + Math.sin(a1) * innerR,
          });
        }
        break;

      case 'obstacle':
        this.obstacles = [
          { x: cx, y: cy, radius: 25 },
          { x: cx - 120, y: cy - 60, radius: 18 },
          { x: cx + 120, y: cy - 60, radius: 18 },
          { x: cx - 120, y: cy + 60, radius: 18 },
          { x: cx + 120, y: cy + 60, radius: 18 },
        ];
        break;

      default:
        this.walls = [];
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderOuterFrame(ctx);
    this.renderCushions(ctx);
    this.renderPlayArea(ctx);
    
    if (this.shape !== 'annular') {
      this.renderPockets(ctx);
    } else {
      this.renderAnnularPockets(ctx);
    }

    if (this.obstacles.length > 0) {
      this.renderObstacles(ctx);
    }

    if (this.noiseTexture) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.15;
      ctx.drawImage(this.noiseTexture, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  private renderOuterFrame(ctx: CanvasRenderingContext2D): void {
    const frameWidth = 30;
    
    const gradient = ctx.createLinearGradient(
      this.x - frameWidth,
      this.y - frameWidth,
      this.x + this.width + frameWidth,
      this.y + this.height + frameWidth
    );
    gradient.addColorStop(0, '#6B4423');
    gradient.addColorStop(0.3, '#8B5A2B');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(0.7, '#8B5A2B');
    gradient.addColorStop(1, '#6B4423');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.x - frameWidth,
      this.y - frameWidth,
      this.width + frameWidth * 2,
      this.height + frameWidth * 2
    );

    ctx.strokeStyle = '#4A2F17';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      this.x - frameWidth + 2,
      this.y - frameWidth + 2,
      this.width + frameWidth * 2 - 4,
      this.height + frameWidth * 2 - 4
    );

    for (let i = 0; i < 20; i++) {
      const woodX = this.x - frameWidth + Math.random() * (this.width + frameWidth * 2);
      const woodY = this.y - frameWidth + Math.random() * (this.height + frameWidth * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.08})`;
      ctx.fillRect(woodX, woodY, Math.random() * 30 + 10, 1);
    }
  }

  private renderCushions(ctx: CanvasRenderingContext2D): void {
    const { left, right, top } = this.playArea;

    if (this.walls.length === 0) {
      const cushionGrad = ctx.createLinearGradient(left, top, right, top);
      cushionGrad.addColorStop(0, COLORS.CUSHION_DARK);
      cushionGrad.addColorStop(0.5, COLORS.CUSHION);
      cushionGrad.addColorStop(1, COLORS.CUSHION_DARK);

      ctx.fillStyle = cushionGrad;
      ctx.fillRect(this.x, this.y, this.width, this.cushionWidth);
      ctx.fillRect(this.x, this.y + this.height - this.cushionWidth, this.width, this.cushionWidth);
      ctx.fillRect(this.x, this.y, this.cushionWidth, this.height);
      ctx.fillRect(this.x + this.width - this.cushionWidth, this.y, this.cushionWidth, this.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 3);
      ctx.fillRect(this.x + 2, this.y + this.height - 5, this.width - 4, 3);
      ctx.fillRect(this.x + 2, this.y + 2, 3, this.height - 4);
      ctx.fillRect(this.x + this.width - 5, this.y + 2, 3, this.height - 4);
    } else {
      ctx.strokeStyle = COLORS.CUSHION;
      ctx.lineWidth = this.cushionWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const wall of this.walls) {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      for (const wall of this.walls) {
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * 2;
        const ny = dx / len * 2;
        
        ctx.beginPath();
        ctx.moveTo(wall.x1 + nx, wall.y1 + ny);
        ctx.lineTo(wall.x2 + nx, wall.y2 + ny);
        ctx.stroke();
      }
    }
  }

  private renderPlayArea(ctx: CanvasRenderingContext2D): void {
    const { left, right, top, bottom } = this.playArea;

    if (this.shape === 'annular') {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const outerR = Math.min(this.width, this.height) / 2 - this.cushionWidth;
      const innerR = outerR * 0.4;

      const feltGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
      feltGrad.addColorStop(0, COLORS.TABLE_FELT);
      feltGrad.addColorStop(1, COLORS.TABLE_FELT_DARK);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
      ctx.fillStyle = feltGrad;
      ctx.fill();
      ctx.restore();
    } else if (this.walls.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.walls[0].x1, this.walls[0].y1);
      for (const wall of this.walls) {
        ctx.lineTo(wall.x2, wall.y2);
      }
      ctx.closePath();
      
      const feltGrad = ctx.createLinearGradient(left, top, right, bottom);
      feltGrad.addColorStop(0, COLORS.TABLE_FELT);
      feltGrad.addColorStop(1, COLORS.TABLE_FELT_DARK);
      ctx.fillStyle = feltGrad;
      ctx.fill();
      ctx.restore();
    } else {
      const feltGrad = ctx.createLinearGradient(left, top, right, bottom);
      feltGrad.addColorStop(0, COLORS.TABLE_FELT);
      feltGrad.addColorStop(0.5, '#0E6B24');
      feltGrad.addColorStop(1, COLORS.TABLE_FELT_DARK);

      ctx.fillStyle = feltGrad;
      ctx.fillRect(left, top, right - left, bottom - top);

      const headStringX = left + (right - left) * 0.25;
      ctx.beginPath();
      ctx.moveTo(headStringX, top);
      ctx.lineTo(headStringX, bottom);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  private renderPockets(ctx: CanvasRenderingContext2D): void {
    for (const pocket of this.pockets) {
      const gradient = ctx.createRadialGradient(
        pocket.x, pocket.y, 0,
        pocket.x, pocket.y, pocket.radius
      );
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.7, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a1a');

      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#3a2514';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  private renderAnnularPockets(ctx: CanvasRenderingContext2D): void {
    for (const pocket of this.pockets) {
      const gradient = ctx.createRadialGradient(
        pocket.x, pocket.y, 0,
        pocket.x, pocket.y, pocket.radius
      );
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(0.7, '#0a0a0a');
      gradient.addColorStop(1, '#1a1a1a');

      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D): void {
    for (const obs of this.obstacles) {
      const gradient = ctx.createRadialGradient(
        obs.x - obs.radius * 0.3,
        obs.y - obs.radius * 0.3,
        0,
        obs.x,
        obs.y,
        obs.radius
      );
      gradient.addColorStop(0, '#5a3a1a');
      gradient.addColorStop(0.5, '#3a2514');
      gradient.addColorStop(1, '#2a1a0a');

      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#1a0f05';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  setShape(shape: TableShape): void {
    this.shape = shape;
    this.setupShape();
    this.pockets = this.createPockets();
  }
}
