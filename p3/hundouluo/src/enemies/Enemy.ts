import { Entity, Vector2 } from '../engine/Entity';
import { Game } from '../engine/Game';
import { Weapon, WeaponType } from '../weapons/Weapon';
import { BulletEmitter, EmitterType } from '../weapons/BulletEmitter';

export enum EnemyState {
  PATROL = 'patrol',
  CHASE = 'chase',
  ATTACK = 'attack',
  DEAD = 'dead'
}

export abstract class Enemy extends Entity {
  protected state: EnemyState;
  protected stateTimer: number;
  protected speed: number;
  protected attackRange: number;
  protected detectionRange: number;
  protected scoreValue: number;
  protected weapon?: Weapon;
  protected bulletEmitter?: BulletEmitter;
  protected attackCooldown: number;
  protected attackTimer: number;
  protected patrolDirection: number;

  constructor(game: Game, x: number, y: number, width: number, height: number, health: number, scoreValue: number) {
    super(game, x, y, width, height);
    this.health = health;
    this.maxHealth = health;
    this.scoreValue = scoreValue;
    this.state = EnemyState.PATROL;
    this.stateTimer = 0;
    this.speed = 80;
    this.attackRange = 400;
    this.detectionRange = 500;
    this.attackCooldown = 1;
    this.attackTimer = 0;
    this.patrolDirection = -1;
  }

  public update(deltaTime: number): void {
    if (this.state === EnemyState.DEAD) return;

    this.stateTimer -= deltaTime;
    this.attackTimer -= deltaTime;

    const player = this.game.player;
    const distance = Math.sqrt(
      Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2)
    );

    this.updateState(distance, player);

    switch (this.state) {
      case EnemyState.PATROL:
        this.patrol(deltaTime);
        break;
      case EnemyState.CHASE:
        this.chase(deltaTime, player);
        break;
      case EnemyState.ATTACK:
        this.attack(deltaTime, player);
        break;
    }

    if (this.bulletEmitter) {
      this.bulletEmitter.setPosition(this.x + this.width / 2, this.y + this.height / 2);
      this.bulletEmitter.update(deltaTime);
    }

    this.checkBounds();
  }

  protected abstract updateState(distance: number, player: any): void;
  protected abstract patrol(deltaTime: number): void;
  protected abstract chase(deltaTime: number, player: any): void;
  protected abstract attack(deltaTime: number, player: any): void;

  protected checkBounds(): void {
    if (this.x < this.game.camera.x - 100) {
      this.active = false;
    }
  }

  public die(): void {
    this.state = EnemyState.DEAD;
    this.active = false;
    if (this.bulletEmitter) {
      this.bulletEmitter.stop();
    }
  }

  public getScoreValue(): number {
    return this.scoreValue;
  }
}

export class PatrolEnemy extends Enemy {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 28, 32, 3, 100);
    this.speed = 60;
    this.attackRange = 350;
    this.detectionRange = 450;
    
    this.bulletEmitter = new BulletEmitter(game);
    this.bulletEmitter.addConfig({
      type: EmitterType.TRACKING,
      bulletCount: 3,
      fireRate: 1.5,
      bulletSpeed: 300,
      damage: 1,
      color: '#ff4444',
      spread: 0.2
    });
  }

  protected updateState(distance: number, player: any): void {
    if (distance < this.attackRange) {
      this.state = EnemyState.ATTACK;
      this.bulletEmitter?.start();
    } else if (distance < this.detectionRange) {
      this.state = EnemyState.CHASE;
      this.bulletEmitter?.stop();
    } else {
      this.state = EnemyState.PATROL;
      this.bulletEmitter?.stop();
    }
  }

  protected patrol(deltaTime: number): void {
    this.x += this.patrolDirection * this.speed * deltaTime;
    
    if (this.stateTimer <= 0) {
      this.stateTimer = 3;
      this.patrolDirection *= -1;
    }
  }

  protected chase(deltaTime: number, player: any): void {
    const dirX = player.x > this.x ? 1 : -1;
    this.x += dirX * this.speed * 1.5 * deltaTime;
  }

  protected attack(deltaTime: number, player: any): void {
    const dirX = player.x > this.x ? 1 : -1;
    this.x += dirX * this.speed * 0.5 * deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(screenX, this.y, this.width, this.height);
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(screenX + 6, this.y + 8, 6, 6);
    ctx.fillRect(screenX + 16, this.y + 8, 6, 6);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 8, this.y + 10, 3, 3);
    ctx.fillRect(screenX + 18, this.y + 10, 3, 3);
  }
}

export class TurretEnemy extends Enemy {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 32, 40, 5, 150);
    this.speed = 0;
    this.attackRange = 500;
    
    this.bulletEmitter = new BulletEmitter(game);
    this.bulletEmitter.addConfig({
      type: EmitterType.LINEAR,
      bulletCount: 5,
      fireRate: 0.8,
      bulletSpeed: 350,
      damage: 1,
      color: '#ffa500',
      angle: Math.PI,
      spread: 0.15
    });
  }

  protected updateState(distance: number, player: any): void {
    if (distance < this.attackRange) {
      this.state = EnemyState.ATTACK;
      this.bulletEmitter?.start();
    } else {
      this.state = EnemyState.PATROL;
      this.bulletEmitter?.stop();
    }
  }

  protected patrol(deltaTime: number): void {}
  protected chase(deltaTime: number, player: any): void {}
  protected attack(deltaTime: number, player: any): void {}

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    
    ctx.fillStyle = '#78716c';
    ctx.fillRect(screenX + 4, this.y + 20, 24, 20);
    
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.arc(screenX + 16, this.y + 20, 14, 0, Math.PI, true);
    ctx.fill();
    
    ctx.fillStyle = '#44403c';
    ctx.save();
    ctx.translate(screenX + 16, this.y + 20);
    ctx.rotate(Math.PI * 0.7);
    ctx.fillRect(-4, -2, 30, 6);
    ctx.restore();
  }
}

export class FlyingEnemy extends Enemy {
  private floatOffset: number;
  private floatSpeed: number;

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 36, 24, 4, 200);
    this.speed = 100;
    this.attackRange = 400;
    this.detectionRange = 500;
    this.floatOffset = 0;
    this.floatSpeed = 3;
    
    this.bulletEmitter = new BulletEmitter(game);
    this.bulletEmitter.addConfig({
      type: EmitterType.CIRCULAR,
      bulletCount: 8,
      fireRate: 2,
      bulletSpeed: 250,
      damage: 1,
      color: '#a855f7'
    });
  }

  protected updateState(distance: number, player: any): void {
    if (distance < this.attackRange) {
      this.state = EnemyState.ATTACK;
      this.bulletEmitter?.start();
    } else if (distance < this.detectionRange) {
      this.state = EnemyState.CHASE;
      this.bulletEmitter?.stop();
    } else {
      this.state = EnemyState.PATROL;
      this.bulletEmitter?.stop();
    }
  }

  protected patrol(deltaTime: number): void {
    this.floatOffset += deltaTime * this.floatSpeed;
    this.y += Math.sin(this.floatOffset) * 30 * deltaTime;
    this.x += this.patrolDirection * this.speed * 0.5 * deltaTime;
    
    if (this.stateTimer <= 0) {
      this.stateTimer = 4;
      this.patrolDirection *= -1;
    }
  }

  protected chase(deltaTime: number, player: any): void {
    this.floatOffset += deltaTime * this.floatSpeed;
    
    const dirX = player.x > this.x ? 1 : -1;
    const dirY = player.y > this.y ? 1 : -1;
    
    this.x += dirX * this.speed * deltaTime;
    this.y += dirY * this.speed * 0.5 * deltaTime + Math.sin(this.floatOffset) * 20 * deltaTime;
  }

  protected attack(deltaTime: number, player: any): void {
    this.floatOffset += deltaTime * this.floatSpeed;
    this.y += Math.sin(this.floatOffset) * 40 * deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    const wingOffset = Math.sin(this.floatOffset * 2) * 4;
    
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(screenX + 18, this.y + 12);
    ctx.lineTo(screenX, this.y + wingOffset);
    ctx.lineTo(screenX + 6, this.y + 12);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(screenX + 18, this.y + 12);
    ctx.lineTo(screenX + 36, this.y - wingOffset);
    ctx.lineTo(screenX + 30, this.y + 12);
    ctx.fill();
    
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.ellipse(screenX + 18, this.y + 12, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(screenX + 14, this.y + 10, 3, 0, Math.PI * 2);
    ctx.arc(screenX + 22, this.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}