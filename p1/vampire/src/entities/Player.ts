
import * as PIXI from 'pixi.js';
import { InputManager } from '../core/Input';
import { normalize, clamp } from '../utils/math';

export class Player {
  public x: number;
  public y: number;
  public width: number = 32;
  public height: number = 32;
  public sprite: PIXI.Container;
  public health: number = 100;
  public maxHealth: number = 100;
  public speed: number = 180;
  public damage: number = 10;
  public fireRate: number = 0.3;
  public bulletSpeed: number = 400;
  public bulletSize: number = 8;
  public bulletCount: number = 1;
  public spread: number = 0.2;
  public magnetRange: number = 100;
  public exp: number = 0;
  public expToLevel: number = 20;
  public level: number = 1;
  public kills: number = 0;
  public invincible: boolean = false;
  public invincibleTimer: number = 0;

  private circle: PIXI.Graphics;
  private glow: PIXI.Graphics;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = new PIXI.Container();
    
    this.circle = new PIXI.Graphics();
    this.circle.beginFill(0x4cc9f0);
    this.circle.drawCircle(0, 0, 16);
    this.circle.endFill();
    this.sprite.addChild(this.circle);

    this.glow = new PIXI.Graphics();
    this.glow.beginFill(0x4cc9f0, 0.3);
    this.glow.drawCircle(0, 0, 24);
    this.glow.endFill();
    this.sprite.addChildAt(this.glow, 0);

    this.sprite.position.set(x, y);
  }

  update(delta: number, input: InputManager, mapSize: number): void {
    const movement = input.getMovement();
    const dir = normalize(movement);
    
    this.x += dir.x * this.speed * delta;
    this.y += dir.y * this.speed * delta;

    const halfSize = mapSize / 2 - 20;
    this.x = clamp(this.x, -halfSize, halfSize);
    this.y = clamp(this.y, -halfSize, halfSize);

    if (this.invincible) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer &lt;= 0) {
        this.invincible = false;
        this.circle.alpha = 1;
      } else {
        this.circle.alpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
      }
    }

    this.sprite.position.set(this.x, this.y);
  }

  takeDamage(amount: number): void {
    if (this.invincible) return;
    this.health -= amount;
    this.invincible = true;
    this.invincibleTimer = 1;
  }

  addExp(amount: number): boolean {
    this.exp += amount;
    if (this.exp &gt;= this.expToLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  levelUp(): void {
    this.exp -= this.expToLevel;
    this.level++;
    this.expToLevel = Math.floor(this.expToLevel * 1.3);
  }

  setInvincible(duration: number): void {
    this.invincible = true;
    this.invincibleTimer = duration;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
