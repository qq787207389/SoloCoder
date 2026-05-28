import { Entity } from './Entity';
import { Bullet } from './Bullet';
import { Vector2, EnemyType } from '../types';
import { generateId, distance, normalize, vectorFromAngle } from '../utils';

export class Enemy extends Entity {
  public type: EnemyType;
  public speed: number;
  public damage: number;
  public fireRate: number;
  public lastFired: number;
  public score: number;
  public aiState: 'idle' | 'patrol' | 'chase' | 'attack' | 'flee';
  public targetPosition: Vector2 | null;
  public patrolPoints: Vector2[];
  public currentPatrolIndex: number;
  public detectionRange: number;
  public attackRange: number;
  public direction: Vector2;

  constructor(
    type: EnemyType,
    position: Vector2
  ) {
    const stats = Enemy.getEnemyStats(type);
    super(generateId(), position, stats.size, stats.health);
    this.type = type;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.lastFired = 0;
    this.score = stats.score;
    this.aiState = 'idle';
    this.targetPosition = null;
    this.patrolPoints = [];
    this.currentPatrolIndex = 0;
    this.detectionRange = stats.detectionRange;
    this.attackRange = stats.attackRange;
    this.direction = { x: 1, y: 0 };
    this.zIndex = type === 'helicopter' ? 8 : 3;
  }

  public static getEnemyStats(type: EnemyType) {
    const stats: Record<EnemyType, {
      size: Vector2;
      health: number;
      speed: number;
      damage: number;
      fireRate: number;
      score: number;
      detectionRange: number;
      attackRange: number;
    }> = {
      infantry: {
        size: { x: 12, y: 16 },
        health: 20,
        speed: 0.05,
        damage: 5,
        fireRate: 1500,
        score: 100,
        detectionRange: 200,
        attackRange: 150
      },
      rocketeer: {
        size: { x: 14, y: 18 },
        health: 30,
        speed: 0.04,
        damage: 20,
        fireRate: 2500,
        score: 200,
        detectionRange: 250,
        attackRange: 200
      },
      bunker: {
        size: { x: 32, y: 32 },
        health: 100,
        speed: 0,
        damage: 15,
        fireRate: 1000,
        score: 500,
        detectionRange: 300,
        attackRange: 280
      },
      tank: {
        size: { x: 36, y: 28 },
        health: 150,
        speed: 0.03,
        damage: 30,
        fireRate: 2000,
        score: 800,
        detectionRange: 280,
        attackRange: 250
      },
      helicopter: {
        size: { x: 40, y: 40 },
        health: 100,
        speed: 0.1,
        damage: 15,
        fireRate: 800,
        score: 1000,
        detectionRange: 350,
        attackRange: 300
      },
      boss: {
        size: { x: 80, y: 60 },
        health: 1000,
        speed: 0.02,
        damage: 50,
        fireRate: 500,
        score: 5000,
        detectionRange: 400,
        attackRange: 350
      }
    };
    return stats[type];
  }

  public update(deltaTime: number, playerPositions: Vector2[], _currentTime: number): void {
    if (!this.active) return;

    const nearestPlayer = this.getNearestPlayer(playerPositions);

    if (nearestPlayer) {
      const distToPlayer = distance(this.position, nearestPlayer);

      if (this.type === 'bunker') {
        this.aiState = distToPlayer <= this.attackRange ? 'attack' : 'idle';
      } else if (distToPlayer <= this.attackRange) {
        this.aiState = 'attack';
      } else if (distToPlayer <= this.detectionRange) {
        this.aiState = 'chase';
      } else {
        this.aiState = this.patrolPoints.length > 0 ? 'patrol' : 'idle';
      }

      const dirToPlayer = normalize({
        x: nearestPlayer.x - this.position.x,
        y: nearestPlayer.y - this.position.y
      });
      this.direction = dirToPlayer;
    }

    switch (this.aiState) {
      case 'patrol':
        this.updatePatrol(deltaTime);
        break;
      case 'chase':
        this.updateChase(nearestPlayer!, deltaTime);
        break;
      case 'attack':
        break;
      default:
        this.velocity = { x: 0, y: 0 };
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.rotation = Math.atan2(this.direction.y, this.direction.x);
    }
  }

  private getNearestPlayer(playerPositions: Vector2[]): Vector2 | null {
    if (playerPositions.length === 0) return null;

    let nearest = playerPositions[0];
    let minDist = distance(this.position, nearest);

    for (let i = 1; i < playerPositions.length; i++) {
      const dist = distance(this.position, playerPositions[i]);
      if (dist < minDist) {
        minDist = dist;
        nearest = playerPositions[i];
      }
    }

    return nearest;
  }

  private updatePatrol(_deltaTime: number): void {
    if (this.patrolPoints.length === 0) {
      this.velocity = { x: 0, y: 0 };
      return;
    }

    const target = this.patrolPoints[this.currentPatrolIndex];
    const dist = distance(this.position, target);

    if (dist < 10) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    } else {
      const dir = normalize({
        x: target.x - this.position.x,
        y: target.y - this.position.y
      });
      this.velocity = { x: dir.x * this.speed, y: dir.y * this.speed };
      this.direction = dir;
    }
  }

  private updateChase(target: Vector2, _deltaTime: number): void {
    const dir = normalize({
      x: target.x - this.position.x,
      y: target.y - this.position.y
    });
    this.velocity = { x: dir.x * this.speed, y: dir.y * this.speed };
    this.direction = dir;
  }

  public tryFire(currentTime: number): Bullet | null {
    if (!this.active || this.aiState !== 'attack') return null;
    if (currentTime - this.lastFired < this.fireRate) return null;

    this.lastFired = currentTime;

    const bulletSpeed = this.type === 'rocketeer' || this.type === 'tank' ? 0.3 : 0.4;
    const bulletSize = this.type === 'tank' ? 8 : this.type === 'rocketeer' ? 6 : 4;
    const bulletDamage = this.damage;

    const velocity = vectorFromAngle(this.rotation, bulletSpeed);

    return new Bullet(
      { ...this.position },
      velocity,
      this.type === 'rocketeer' || this.type === 'tank' ? 'grenade' : 'machinegun',
      false,
      bulletDamage,
      bulletSize,
      3000
    );
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active) return;

    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY;

    ctx.save();
    ctx.translate(screenX, screenY);

    switch (this.type) {
      case 'infantry':
        this.drawInfantry(ctx);
        break;
      case 'rocketeer':
        this.drawRocketeer(ctx);
        break;
      case 'bunker':
        this.drawBunker(ctx);
        break;
      case 'tank':
        ctx.rotate(this.rotation);
        this.drawTank(ctx);
        break;
      case 'helicopter':
        ctx.rotate(this.rotation);
        this.drawHelicopter(ctx);
        break;
      case 'boss':
        ctx.rotate(this.rotation);
        this.drawBoss(ctx);
        break;
    }

    ctx.restore();

    if (this.type === 'bunker' || this.type === 'tank' || this.type === 'boss') {
      this.drawHealthBar(ctx, screenX, screenY, this.size.x, 4, -this.size.y / 2 - 8);
    }
  }

  private drawInfantry(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#4a5d23';
    ctx.fillRect(-4, -8, 8, 16);

    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-3, -6, 6, 6);

    ctx.fillStyle = '#333';
    ctx.fillRect(3, -2, 8, 2);
  }

  private drawRocketeer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5a4d3d';
    ctx.fillRect(-5, -9, 10, 18);

    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-3, -7, 6, 6);

    ctx.fillStyle = '#444';
    ctx.fillRect(4, -4, 10, 4);
    ctx.fillStyle = '#c44';
    ctx.fillRect(10, -3, 4, 2);
  }

  private drawBunker(ctx: CanvasRenderingContext2D): void {
    const w = this.size.x;
    const h = this.size.y;

    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-6, -6, 12, 12);

    ctx.rotate(this.rotation);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, -3, 20, 6);
  }

  private drawTank(ctx: CanvasRenderingContext2D): void {
    const w = this.size.x;
    const h = this.size.y;

    ctx.fillStyle = '#333';
    ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, 6);
    ctx.fillRect(-w / 2 - 2, h / 2 - 4, w + 4, 6);

    ctx.fillStyle = '#5a5d23';
    ctx.fillRect(-w / 2, -h / 2 + 4, w, h - 8);

    ctx.fillStyle = '#4a4d13';
    ctx.fillRect(-w / 4, -h / 3, w / 2, h * 0.6);

    ctx.fillStyle = '#333';
    ctx.fillRect(0, -3, 25, 6);
  }

  private drawHelicopter(ctx: CanvasRenderingContext2D): void {
    const w = this.size.x;
    const h = this.size.y;

    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(-w / 3, -h / 4, w * 0.66, h / 2);

    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(w / 3, -h / 6, w / 3, h / 3);

    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(-w / 2 + 5, -2, w - 10, 4);

    const rotorAngle = Date.now() / 50;
    ctx.save();
    ctx.rotate(rotorAngle);
    ctx.fillStyle = '#111';
    ctx.fillRect(-w / 2 - 5, -1, w + 10, 2);
    ctx.restore();

    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(-w / 2 - 8, -h / 3, 8, h * 0.66);
  }

  private drawBoss(ctx: CanvasRenderingContext2D): void {
    const w = this.size.x;
    const h = this.size.y;

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, 8);
    ctx.fillRect(-w / 2 - 4, h / 2 - 4, w + 8, 8);

    ctx.fillStyle = '#4a3a3a';
    ctx.fillRect(-w / 2, -h / 2 + 6, w, h - 12);

    ctx.fillStyle = '#5a4a4a';
    ctx.fillRect(-w / 3, -h / 3, w * 0.66, h * 0.66);

    ctx.fillStyle = '#333';
    ctx.fillRect(0, -4, 35, 8);
    ctx.fillRect(-10, -h / 3 - 10, 20, 8);
    ctx.fillRect(-10, h / 3 + 2, 20, 8);
  }

  public addPatrolPoint(point: Vector2): void {
    this.patrolPoints.push(point);
  }
}
