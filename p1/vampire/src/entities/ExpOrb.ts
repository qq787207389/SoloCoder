
import * as PIXI from 'pixi.js';

export class ExpOrb {
  public x: number;
  public y: number;
  public value: number;
  public sprite: PIXI.Container;
  public active: boolean = false;

  private circle: PIXI.Graphics;
  private pulseTime: number = 0;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.value = 0;
    
    this.sprite = new PIXI.Container();
    this.circle = new PIXI.Graphics();
    this.sprite.addChild(this.circle);
  }

  init(x: number, y: number, value: number): void {
    this.x = x;
    this.y = y;
    this.value = value;
    this.active = true;
    this.pulseTime = 0;

    const size = Math.min(12, 6 + value / 5);
    this.circle.clear();
    this.circle.beginFill(0x9d4edd);
    this.circle.drawCircle(0, 0, size);
    this.circle.endFill();

    this.sprite.position.set(x, y);
    this.sprite.visible = true;
  }

  update(delta: number, playerX: number, playerY: number, magnetRange: number): boolean {
    if (!this.active) return false;

    this.pulseTime += delta;
    const pulse = 1 + Math.sin(this.pulseTime * 5) * 0.1;
    this.sprite.scale.set(pulse);

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist &lt; magnetRange) {
      const attractSpeed = Math.max(200, (magnetRange - dist) * 3);
      const t = delta * attractSpeed / Math.max(dist, 1);
      this.x += dx * t;
      this.y += dy * t;
    }

    this.sprite.position.set(this.x, this.y);

    return dist &lt; 30;
  }

  deactivate(): void {
    this.active = false;
    this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
