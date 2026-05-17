import { GameObject } from '../core/GameObject';
import { FoodType } from '../types';
import gameConfig from '../config/gameConfig.json';

export class Food extends GameObject {
  private type: FoodType;
  private spawnTime: number;
  private duration: number;
  private blinkTimer: number = 0;
  private visible: boolean = true;

  constructor(x: number, y: number, type: FoodType = 'normal') {
    super(x, y);
    this.type = type;
    this.spawnTime = Date.now();
    this.duration = gameConfig.foodTypes[type].duration;
  }

  public update(deltaTime: number): void {
    const config = gameConfig.foodTypes[this.type];

    if (config.blink) {
      this.blinkTimer += deltaTime;
      this.visible = Math.floor(this.blinkTimer / 200) % 2 === 0;
    }

    if (this.duration > 0 && Date.now() - this.spawnTime > this.duration) {
      this.destroy();
    }
  }

  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    if (!this.visible) return;

    const config = gameConfig.foodTypes[this.type];
    const centerX = this.x * cellSize + cellSize / 2;
    const centerY = this.y * cellSize + cellSize / 2;
    const radius = cellSize * 0.35;

    ctx.fillStyle = config.color;
    ctx.beginPath();

    if (this.type === 'normal') {
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    } else if (this.type === 'golden') {
      this.drawStar(ctx, centerX, centerY, 5, radius, radius * 0.5);
    } else if (this.type === 'poison') {
      this.drawMushroom(ctx, centerX, centerY, radius);
      return;
    } else if (this.type === 'speed') {
      this.drawLightning(ctx, centerX, centerY, radius);
      return;
    } else if (this.type === 'phase') {
      this.drawGhost(ctx, centerX, centerY, radius);
      return;
    }

    ctx.fill();

    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  private drawMushroom(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.2, radius * 0.9, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.4, radius * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.2, cy - radius * 0.5, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(cx - radius * 0.3, cy - radius * 0.1, radius * 0.6, radius * 0.5);
  }

  private drawLightning(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx - radius * 0.3, cy - radius * 0.2);
    ctx.lineTo(cx + radius * 0.1, cy - radius * 0.1);
    ctx.lineTo(cx - radius * 0.2, cy + radius);
    ctx.lineTo(cx + radius * 0.3, cy + radius * 0.1);
    ctx.lineTo(cx - radius * 0.1, cy);
    ctx.closePath();
    ctx.fill();
  }

  private drawGhost(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.fillStyle = '#06b6d4';
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.3, radius * 0.8, Math.PI, 0);
    ctx.lineTo(cx + radius * 0.8, cy + radius * 0.3);
    ctx.quadraticCurveTo(cx + radius * 0.6, cy + radius * 0.5, cx + radius * 0.4, cy + radius * 0.3);
    ctx.quadraticCurveTo(cx + radius * 0.2, cy + radius * 0.5, cx, cy + radius * 0.3);
    ctx.quadraticCurveTo(cx - radius * 0.2, cy + radius * 0.5, cx - radius * 0.4, cy + radius * 0.3);
    ctx.quadraticCurveTo(cx - radius * 0.6, cy + radius * 0.5, cx - radius * 0.8, cy + radius * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.25, cy - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.25, cy - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.25, cy - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.25, cy - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  public getType(): FoodType {
    return this.type;
  }

  public getConfig() {
    return gameConfig.foodTypes[this.type];
  }
}