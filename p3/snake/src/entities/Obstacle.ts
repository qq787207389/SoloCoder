import { GameObject } from '../core/GameObject';

export class Obstacle extends GameObject {
  private type: 'rock' | 'tree';

  constructor(x: number, y: number, type: 'rock' | 'tree' = 'rock') {
    super(x, y);
    this.type = type;
  }

  public update(deltaTime: number): void {}

  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    const centerX = this.x * cellSize + cellSize / 2;
    const centerY = this.y * cellSize + cellSize / 2;

    if (this.type === 'rock') {
      this.drawRock(ctx, centerX, centerY, cellSize);
    } else {
      this.drawTree(ctx, centerX, centerY, cellSize);
    }
  }

  private drawRock(ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number): void {
    const radius = cellSize * 0.4;

    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx - radius * 0.7, cy - radius * 0.8);
    ctx.lineTo(cx + radius * 0.3, cy - radius * 0.9);
    ctx.lineTo(cx + radius * 0.8, cy - radius * 0.3);
    ctx.lineTo(cx + radius * 0.6, cy + radius * 0.5);
    ctx.lineTo(cx - radius * 0.4, cy + radius * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.2, cy - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number): void {
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx - cellSize * 0.1, cy, cellSize * 0.2, cellSize * 0.4);

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(cx, cy - cellSize * 0.5);
    ctx.lineTo(cx - cellSize * 0.35, cy);
    ctx.lineTo(cx + cellSize * 0.35, cy);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy - cellSize * 0.3);
    ctx.lineTo(cx - cellSize * 0.3, cy + cellSize * 0.1);
    ctx.lineTo(cx + cellSize * 0.3, cy + cellSize * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  public getType(): 'rock' | 'tree' {
    return this.type;
  }
}