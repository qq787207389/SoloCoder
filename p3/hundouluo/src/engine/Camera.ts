export class Camera {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public minX: number;
  public maxX: number;
  public followSpeed: number;

  constructor(width: number, height: number) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.minX = 0;
    this.maxX = Infinity;
    this.followSpeed = 0.1;
  }

  public follow(targetX: number, targetY: number, deltaTime: number): void {
    // 暂时禁用跟随
  }

  public setBounds(minX: number, maxX: number): void {
    this.minX = minX;
    this.maxX = maxX;
  }
}