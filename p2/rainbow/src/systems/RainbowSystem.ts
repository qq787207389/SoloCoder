import {
  RAINBOW_LIFETIME,
  RAINBOW_FADE_TIME,
  RAINBOW_COLORS,
} from '../utils/Constants';

export interface RainbowArc {
  cx: number;
  cy: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  facing: number;
  lifetime: number;
  maxLifetime: number;
}

export class RainbowSystem {
  public arcs: RainbowArc[] = [];
  public isDrawing: boolean = false;
  public needsNewArc: boolean = false;
  public maxArcs: number = 8;
  private baseRadius: number = 55;

  constructor() {}

  startDrawing(): void {
    this.isDrawing = true;
    this.needsNewArc = true;
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  update(dt: number, playerX: number, playerY: number, playerFacing: number): void {
    if (this.isDrawing && this.needsNewArc) {
      this.needsNewArc = false;

      const playerCenterX = playerX;
      const playerCenterY = playerY;
      const radius = this.baseRadius;

      const cx = playerCenterX - playerFacing * radius * 0.25;
      const cy = playerCenterY + radius * 0.1;

      const arc: RainbowArc = {
        cx,
        cy,
        radius,
        startAngle: Math.PI,
        endAngle: 0,
        facing: playerFacing,
        lifetime: RAINBOW_LIFETIME,
        maxLifetime: RAINBOW_LIFETIME,
      };

      this.arcs.push(arc);
    }

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      this.arcs[i].lifetime -= dt;
      if (this.arcs[i].lifetime <= 0) {
        this.arcs.splice(i, 1);
      }
    }

    if (this.arcs.length > this.maxArcs) {
      this.arcs = this.arcs.slice(-this.maxArcs);
    }
  }

  getAlpha(arc: RainbowArc): number {
    if (arc.lifetime > RAINBOW_FADE_TIME) {
      return 1;
    }
    return Math.max(0, arc.lifetime / RAINBOW_FADE_TIME);
  }

  collapseAll(): number {
    const count = this.arcs.length;
    this.arcs = [];
    return count;
  }

  getPlatformArcs(): RainbowArc[] {
    return this.arcs.filter((a) => a.lifetime > RAINBOW_FADE_TIME * 0.3);
  }

  getActiveArcs(): RainbowArc[] {
    return this.arcs.filter((a) => a.lifetime > 0);
  }

  getArcPoints(arc: RainbowArc, numPoints: number = 16): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const step = (arc.endAngle - arc.startAngle) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const angle = arc.startAngle + step * i;
      const x = arc.cx + Math.cos(angle) * arc.radius;
      const y = arc.cy + Math.sin(angle) * arc.radius;
      points.push({ x, y });
    }
    return points;
  }

  clear(): void {
    this.arcs = [];
  }
}
