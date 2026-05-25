
import * as PIXI from 'pixi.js';

export type ChestType = 'clear' | 'invincible' | 'exp';

export class Chest {
  public x: number;
  public y: number;
  public type: ChestType;
  public sprite: PIXI.Container;
  public active: boolean = false;

  private graphics: PIXI.Graphics;
  private glow: PIXI.Graphics;
  private pulseTime: number = 0;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.type = 'clear';
    
    this.sprite = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.glow = new PIXI.Graphics();
    this.sprite.addChild(this.glow);
    this.sprite.addChild(this.graphics);
  }

  init(x: number, y: number, type: ChestType): void {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.pulseTime = 0;

    const colors: Record&lt;ChestType, number&gt; = {
      clear: 0xff4444,
      invincible: 0x44ffff,
      exp: 0xffff44
    };

    this.graphics.clear();
    this.graphics.beginFill(colors[type]);
    this.graphics.drawRect(-15, -15, 30, 30);
    this.graphics.endFill();

    this.glow.clear();
    this.glow.beginFill(colors[type], 0.3);
    this.glow.drawCircle(0, 0, 25);
    this.glow.endFill();

    this.sprite.position.set(x, y);
    this.sprite.visible = true;
  }

  update(delta: number, playerX: number, playerY: number): boolean {
    if (!this.active) return false;

    this.pulseTime += delta;
    const pulse = 1 + Math.sin(this.pulseTime * 3) * 0.1;
    this.sprite.scale.set(pulse);
    this.sprite.rotation += delta * 2;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist &lt; 40;
  }

  deactivate(): void {
    this.active = false;
    this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
