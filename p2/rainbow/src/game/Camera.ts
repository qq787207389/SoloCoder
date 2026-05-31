import { CAMERA_SMOOTH } from '../utils/Constants';
import { clamp, lerp } from '../utils/MathUtils';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public width: number;
  public height: number;
  public targetX: number = 0;
  public targetY: number = 0;
  public bounds: { minX: number; maxX: number; minY: number; maxY: number } = {
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity,
  };

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  follow(targetX: number, targetY: number): void {
    this.targetX = targetX - this.width / 2;
    this.targetY = targetY - this.height / 2;
  }

  update(dt: number): void {
    const t = 1 - Math.pow(1 - CAMERA_SMOOTH, dt * 60);
    this.x = lerp(this.x, this.targetX, t);
    this.y = lerp(this.y, this.targetY, t);
    this.x = clamp(this.x, this.bounds.minX, this.bounds.maxX - this.width);
    this.y = clamp(this.y, this.bounds.minY, this.bounds.maxY - this.height);
  }

  screenX(worldX: number): number {
    return worldX - this.x;
  }

  screenY(worldY: number): number {
    return worldY - this.y;
  }

  isVisible(x: number, y: number, w: number, h: number): boolean {
    const margin = 32;
    return (
      x + w + margin > this.x &&
      x - margin < this.x + this.width &&
      y + h + margin > this.y &&
      y - margin < this.y + this.height
    );
  }

  setBounds(minX: number, maxX: number, minY: number, maxY: number): void {
    this.bounds = { minX, maxX, minY, maxY };
  }
}
