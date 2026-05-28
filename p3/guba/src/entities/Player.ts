import { Entity } from './Entity';
import { Bullet } from './Bullet';
import { WeaponSystem } from '../weapons/WeaponSystem';
import { Vector2, PlayerInput } from '../types';
import { generateId, normalize } from '../utils';

export class Player extends Entity {
  public playerIndex: number;
  public speed: number;
  public weaponSystem: WeaponSystem;
  public hostages: string[];
  public maxHostages: number;
  public lives: number;
  public score: number;
  public invincible: boolean;
  public invincibleTimer: number;
  public shootDirection: Vector2;
  public moveDirection: Vector2;
  public color: string;
  public secondaryColor: string;

  constructor(playerIndex: number, position: Vector2) {
    super(generateId(), position, { x: 32, y: 24 }, 100);
    this.playerIndex = playerIndex;
    this.speed = 0.2;
    this.weaponSystem = new WeaponSystem();
    this.hostages = [];
    this.maxHostages = 8;
    this.lives = 3;
    this.score = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shootDirection = { x: 1, y: 0 };
    this.moveDirection = { x: 1, y: 0 };
    this.zIndex = 5;
    this.color = playerIndex === 0 ? '#4CAF50' : '#2196F3';
    this.secondaryColor = playerIndex === 0 ? '#388E3C' : '#1976D2';
  }

  public handleInput(input: PlayerInput, currentTime: number): Bullet | null {
    let moveX = 0;
    let moveY = 0;

    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const normalized = normalize({ x: moveX, y: moveY });
      this.moveDirection = normalized;
      this.velocity = { x: normalized.x * this.speed, y: normalized.y * this.speed };
      this.shootDirection = { ...normalized };
    } else {
      this.velocity = { x: 0, y: 0 };
    }

    if (input.switchWeapon) {
      this.weaponSystem.switchWeapon();
    }

    if (input.shoot) {
      return this.weaponSystem.fire(
        this.getCenter(),
        this.shootDirection,
        true,
        currentTime
      );
    }

    if (input.secondary) {
      return this.weaponSystem.fireSecondary(
        this.getCenter(),
        this.shootDirection,
        true,
        currentTime
      );
    }

    return null;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.weaponSystem.update(deltaTime);

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.rotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active) return;

    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY;

    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    this.drawJeep(ctx);

    ctx.restore();
    ctx.globalAlpha = 1;

    if (this.hostages.length > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`×${this.hostages.length}`, screenX, screenY - 25);
    }
  }

  private drawJeep(ctx: CanvasRenderingContext2D): void {
    const w = this.size.x;
    const h = this.size.y;

    ctx.fillStyle = '#333';
    ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, 6);
    ctx.fillRect(-w / 2 - 2, h / 2 - 4, w + 4, 6);

    ctx.fillStyle = '#222';
    ctx.fillRect(-w / 2, -h / 2, 8, 4);
    ctx.fillRect(w / 2 - 8, -h / 2, 8, 4);
    ctx.fillRect(-w / 2, h / 2 - 4, 8, 4);
    ctx.fillRect(w / 2 - 8, h / 2 - 4, 8, 4);

    ctx.fillStyle = this.color;
    ctx.fillRect(-w / 2, -h / 2 + 4, w, h - 8);

    ctx.fillStyle = this.secondaryColor;
    ctx.fillRect(-w / 4, -h / 3, w / 2, h * 0.6);

    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-w / 4 + 2, -h / 3 + 2, w / 2 - 4, h * 0.4);

    ctx.fillStyle = '#555';
    ctx.fillRect(0, -3, 18, 6);

    ctx.fillStyle = '#333';
    ctx.fillRect(15, -4, 8, 8);
  }

  public takeDamage(amount: number): void {
    if (this.invincible) return;

    super.takeDamage(amount);
    this.invincible = true;
    this.invincibleTimer = 1000;
  }

  public onDeath(): void {
    this.lives--;
    this.hostages = [];
    if (this.lives > 0) {
      this.health = this.maxHealth;
      this.active = true;
      this.invincible = true;
      this.invincibleTimer = 3000;
    } else {
      this.active = false;
    }
  }

  public addHostage(hostageId: string): boolean {
    if (this.hostages.length >= this.maxHostages) return false;
    if (this.hostages.includes(hostageId)) return false;
    this.hostages.push(hostageId);
    return true;
  }

  public removeHostage(hostageId: string): void {
    this.hostages = this.hostages.filter((id) => id !== hostageId);
  }

  public getHostageCount(): number {
    return this.hostages.length;
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public getMuzzlePosition(): Vector2 {
    return {
      x: this.position.x + Math.cos(this.rotation) * 20,
      y: this.position.y + Math.sin(this.rotation) * 20
    };
  }
}
