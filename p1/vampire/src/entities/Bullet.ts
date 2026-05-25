
import * as PIXI from 'pixi.js';

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public damage: number;
  public sprite: PIXI.Container;
  public active: boolean = false;
  public isEnemy: boolean = false;
  public lifetime: number = 0;

  private circle: PIXI.Graphics;
  private maxLifetime: number = 3;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 0;
    this.damage = 0;
    
    this.sprite = new PIXI.Container();
    this.circle = new PIXI.Graphics();
    this.sprite.addChild(this.circle);
  }

  init(x: number, y: number, vx: number, vy: number, radius: number, damage: number, isEnemy: boolean = false): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.damage = damage;
    this.isEnemy = isEnemy;
    this.active = true;
    this.lifetime = 0;

    this.circle.clear();
    this.circle.beginFill(isEnemy ? 0xff4444 : 0xffff44);
    this.circle.drawCircle(0, 0, radius);
    this.circle.endFill();

    this.sprite.position.set(x, y);
    this.sprite.visible = true;
  }

  update(delta: number): boolean {
    if (!this.active) return false;

    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.lifetime += delta;

    this.sprite.position.set(this.x, this.y);

    return this.lifetime &gt;= this.maxLifetime;
  }

  deactivate(): void {
    this.active = false;
    this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
