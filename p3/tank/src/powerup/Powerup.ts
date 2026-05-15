import { GameObject } from '../core/GameObject';
import { PowerupType, COLORS } from '../constants';

export class Powerup extends GameObject {
  public type: PowerupType;
  private timer: number;
  private lifetime: number = 10000;

  constructor(x: number, y: number, type: PowerupType) {
    super(x, y, 24, 24);
    this.type = type;
    this.timer = this.lifetime;
  }

  update(deltaTime: number): void {
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      this.destroy();
    }
  }

  isAboutToExpire(): boolean {
    return this.timer < 2000;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const x = this.position.x;
    const y = this.position.y;
    const size = this.bounds.width;

    if (this.isAboutToExpire() && Math.floor(Date.now() / 200) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, size, size);

    let color: string;
    switch (this.type) {
      case PowerupType.STAR:
        color = COLORS.UI;
        this.renderStar(ctx, x + size / 2, y + size / 2, color);
        break;
      case PowerupType.CLOCK:
        color = '#00ffff';
        this.renderClock(ctx, x + size / 2, y + size / 2, color);
        break;
      case PowerupType.BOMB:
        color = '#ff4444';
        this.renderBomb(ctx, x + size / 2, y + size / 2, color);
        break;
      case PowerupType.SHOVEL:
        color = '#8B4513';
        this.renderShovel(ctx, x + size / 2, y + size / 2, color);
        break;
      case PowerupType.HELMET:
        color = '#c0c0c0';
        this.renderHelmet(ctx, x + size / 2, y + size / 2, color);
        break;
    }

    ctx.globalAlpha = 1;
  }

  private renderStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + Math.cos(angle) * 8;
      const y = cy + Math.sin(angle) * 8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private renderClock(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 4, cy - 4);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 6);
    ctx.stroke();
  }

  private renderBomb(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 6);
    ctx.quadraticCurveTo(cx + 8, cy - 10, cx + 6, cy - 12);
    ctx.stroke();
  }

  private renderShovel(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(cx - 2, cy - 8, 4, 12);
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 4);
    ctx.lineTo(cx + 6, cy + 4);
    ctx.lineTo(cx + 4, cy + 10);
    ctx.lineTo(cx - 4, cy + 10);
    ctx.closePath();
    ctx.fill();
  }

  private renderHelmet(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 8, cy, 16, 4);
    ctx.fillStyle = '#808080';
    ctx.fillRect(cx - 6, cy - 2, 12, 2);
  }
}
