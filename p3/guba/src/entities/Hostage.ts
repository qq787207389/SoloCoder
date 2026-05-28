import { Entity } from './Entity';
import { Player } from './Player';
import { Vector2 } from '../types';
import { generateId, distance, normalize, randomRange } from '../utils';

export type HostageState = 'caged' | 'free' | 'following' | 'onboard' | 'rescued' | 'dead';

export class Hostage extends Entity {
  public state: HostageState;
  public playerFollowing: string | null;
  public speed: number;
  public scoreValue: number;
  public wanderTimer: number;
  public wanderDirection: Vector2;

  constructor(position: Vector2) {
    super(generateId(), position, { x: 10, y: 14 }, 30);
    this.state = 'caged';
    this.playerFollowing = null;
    this.speed = 0.08;
    this.scoreValue = 500;
    this.wanderTimer = 0;
    this.wanderDirection = { x: 0, y: 0 };
    this.zIndex = 2;
  }

  public update(deltaTime: number, players: Player[]): void {
    if (!this.active) return;

    switch (this.state) {
      case 'caged':
        this.updateCaged(deltaTime);
        break;
      case 'free':
        this.updateFree(deltaTime, players);
        break;
      case 'following':
        this.updateFollowing(deltaTime, players);
        break;
      case 'onboard':
      case 'rescued':
      case 'dead':
        break;
    }
  }

  private updateCaged(_deltaTime: number): void {
  }

  private updateFree(deltaTime: number, players: Player[]): void {
    this.wanderTimer -= deltaTime;

    if (this.wanderTimer <= 0) {
      this.wanderTimer = randomRange(1000, 3000);
      const angle = randomRange(0, Math.PI * 2);
      this.wanderDirection = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
    }

    this.position.x += this.wanderDirection.x * this.speed * 0.5 * deltaTime;
    this.position.y += this.wanderDirection.y * this.speed * 0.5 * deltaTime;

    for (const player of players) {
      if (!player.active) continue;
      const dist = distance(this.position, player.position);
      if (dist < 80 && player.getHostageCount() < player.maxHostages) {
        this.state = 'following';
        this.playerFollowing = player.id;
        return;
      }
    }
  }

  private updateFollowing(deltaTime: number, players: Player[]): void {
    const player = players.find((p) => p.id === this.playerFollowing);

    if (!player || !player.active) {
      this.state = 'free';
      this.playerFollowing = null;
      return;
    }

    if (player.getHostageCount() >= player.maxHostages) {
      this.state = 'free';
      this.playerFollowing = null;
      return;
    }

    const dist = distance(this.position, player.position);

    if (dist < 30) {
      if (player.addHostage(this.id)) {
        this.state = 'onboard';
        this.active = false;
      }
      return;
    }

    const dir = normalize({
      x: player.position.x - this.position.x,
      y: player.position.y - this.position.y
    });

    this.velocity = {
      x: dir.x * this.speed,
      y: dir.y * this.speed
    };

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.rotation = Math.atan2(dir.y, dir.x);
  }

  public free(): void {
    if (this.state === 'caged') {
      this.state = 'free';
    }
  }

  public rescue(): void {
    this.state = 'rescued';
    this.active = false;
  }

  public takeDamage(amount: number): void {
    super.takeDamage(amount);
    if (this.health <= 0) {
      this.state = 'dead';
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active || this.state === 'onboard' || this.state === 'rescued') return;

    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY;

    ctx.save();
    ctx.translate(screenX, screenY);

    if (this.state === 'caged') {
      this.drawCage(ctx);
    }

    this.drawHostage(ctx);

    ctx.restore();
  }

  private drawCage(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;

    ctx.strokeRect(-12, -14, 24, 28);

    for (let i = -10; i <= 10; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, -14);
      ctx.lineTo(i, 14);
      ctx.stroke();
    }
  }

  private drawHostage(ctx: CanvasRenderingContext2D): void {
    const flash = this.state === 'free' && Math.floor(Date.now() / 300) % 2 === 0;

    ctx.fillStyle = flash ? '#ffcc00' : '#e8d4b8';
    ctx.fillRect(-4, -6, 8, 12);

    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-3, -8, 6, 6);

    ctx.fillStyle = '#000';
    ctx.fillRect(-2, -6, 1.5, 1.5);
    ctx.fillRect(0.5, -6, 1.5, 1.5);

    if (this.state === 'free' || this.state === 'following') {
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -12);
    }
  }


}
