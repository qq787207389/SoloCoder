import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

export class Camera {
  x = 0;
  y = 0;
  targetX = 0;
  targetY = 0;
  minX = 0;
  maxX = 10000;
  smoothFactor = 0.1;

  follow(targetX: number, targetY: number, _dt: number): void {
    this.targetX = targetX - GAME_WIDTH / 2;
    this.targetY = targetY - GAME_HEIGHT / 2;
    this.x += (this.targetX - this.x) * this.smoothFactor;
    this.y += (this.targetY - this.y) * this.smoothFactor;
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
    this.y = Math.max(-80, Math.min(0, this.y));
  }

  setBounds(minX: number, maxX: number): void {
    this.minX = minX;
    this.maxX = Math.max(minX, maxX - GAME_WIDTH);
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  reset(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
