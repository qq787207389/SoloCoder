
import * as PIXI from 'pixi.js';
import { EnemyType } from '../types';
import { distance, normalize } from '../utils/math';

export class Enemy {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public sprite: PIXI.Container;
  public active: boolean = false;
  public health: number;
  public maxHealth: number;
  public type: EnemyType;
  public shootTimer: number = 0;

  private circle: PIXI.Graphics;
  private healthBar: PIXI.Graphics | null = null;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.health = 0;
    this.maxHealth = 0;
    this.type = {} as EnemyType;
    
    this.sprite = new PIXI.Container();
    this.circle = new PIXI.Graphics();
    this.sprite.addChild(this.circle);
  }

  init(x: number, y: number, type: EnemyType): void {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = type.size;
    this.height = type.size;
    this.health = type.health;
    this.maxHealth = type.health;
    this.active = true;
    this.shootTimer = Math.random() * 2;

    this.circle.clear();
    this.circle.beginFill(type.color);
    this.circle.drawCircle(0, 0, type.size / 2);
    this.circle.endFill();

    if (type.health &gt; 50) {
      this.createHealthBar();
    }

    this.sprite.position.set(x, y);
    this.sprite.visible = true;
  }

  private createHealthBar(): void {
    this.healthBar = new PIXI.Graphics();
    this.sprite.addChild(this.healthBar);
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    if (!this.healthBar) return;
    const barWidth = this.type.size * 1.5;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    this.healthBar.clear();
    this.healthBar.beginFill(0x333333);
    this.healthBar.drawRect(-barWidth / 2, -this.type.size / 2 - 10, barWidth, barHeight);
    this.healthBar.endFill();
    this.healthBar.beginFill(0xff4444);
    this.healthBar.drawRect(-barWidth / 2, -this.type.size / 2 - 10, barWidth * healthPercent, barHeight);
    this.healthBar.endFill();
  }

  update(delta: number, playerX: number, playerY: number): { shouldShoot: boolean } {
    if (!this.active) return { shouldShoot: false };

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist &gt; 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;
      
      if (this.type.behavior === 'shoot' &amp;&amp; dist &lt; 300) {
        this.x -= dirX * this.type.speed * 0.3 * delta;
        this.y -= dirY * this.type.speed * 0.3 * delta;
      } else {
        this.x += dirX * this.type.speed * delta;
        this.y += dirY * this.type.speed * delta;
      }
    }

    this.sprite.position.set(this.x, this.y);

    let shouldShoot = false;
    if (this.type.behavior === 'shoot') {
      this.shootTimer -= delta;
      if (this.shootTimer &lt;= 0) {
        this.shootTimer = 1.5 + Math.random();
        shouldShoot = true;
      }
    }

    return { shouldShoot };
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    if (this.healthBar) {
      this.updateHealthBar();
    }
    return this.health &lt;= 0;
  }

  deactivate(): void {
    this.active = false;
    this.sprite.visible = false;
    if (this.healthBar) {
      this.healthBar.clear();
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
