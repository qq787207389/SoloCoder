export enum PlatformType {
  CLOUD = 'cloud',
  MOVING_CLOUD = 'moving_cloud',
  ISLAND = 'island',
  BUBBLE = 'bubble',
}

export class Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: PlatformType;
  startX: number;
  startY: number;
  moveRangeX: number = 0;
  moveRangeY: number = 0;
  moveSpeed: number = 0;
  moveTime: number = 0;
  bouncy: boolean = false;
  solid: boolean = true;

  constructor(x: number, y: number, w: number, h: number, type: PlatformType) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.startX = x;
    this.startY = y;

    if (type === PlatformType.BUBBLE) {
      this.bouncy = true;
    }
  }

  update(dt: number): void {
    if (this.type === PlatformType.MOVING_CLOUD || this.type === PlatformType.BUBBLE) {
      this.moveTime += dt;
      this.x = this.startX + Math.sin(this.moveTime * this.moveSpeed) * this.moveRangeX;
      this.y = this.startY + Math.cos(this.moveTime * this.moveSpeed * 0.7) * this.moveRangeY;
    }
  }

  getRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }
}
