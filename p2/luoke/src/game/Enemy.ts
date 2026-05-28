import { Entity } from '../core/Entity';
import { Renderer } from '../core/Renderer';
import { PhysicsEngine } from '../core/Physics';
import { Platform, ElementType, ELEMENT_COLORS, Particle } from '../utils/types';

export class Enemy extends Entity {
  protected element: ElementType;
  protected type: string;
  protected damage: number;
  protected points: number;
  protected aiState: string;
  protected aiTimer: number;
  protected animFrame: number = 0;
  protected animTimer: number = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    health: number,
    element: ElementType,
    type: string,
    damage: number,
    points: number
  ) {
    super(x, y, width, height, health);
    this.element = element;
    this.type = type;
    this.damage = damage;
    this.points = points;
    this.aiState = 'patrol';
    this.aiTimer = 0;
  }

  public update(_deltaTime: number, platforms: Platform[], playerX: number, playerY: number): void {
    this.updateAI(playerX, playerY);
    PhysicsEngine.applyGravity(this.state.velocity);
    
    const result = PhysicsEngine.resolveCollision(
      this.state.position,
      this.state.velocity,
      { width: this.state.width, height: this.state.height },
      platforms
    );
    
    this.state.position = result.newPosition;
    this.state.velocity = result.newVelocity;
    
    this.updateInvincibility();
    this.updateAnimation();
  }

  protected updateAI(_playerX: number, _playerY: number): void {
    this.aiTimer++;
  }

  private updateAnimation(): void {
    this.animTimer++;
    if (this.animTimer >= 10) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  public render(renderer: Renderer): void {
    if (this.state.isInvincible && Math.floor(this.state.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    const color = ELEMENT_COLORS[this.element];
    const colors = ['#888888', '#666666', color, '#ff0000'];
    
    const sprite = this.getSprite();
    renderer.drawSprite(
      this.state.position.x,
      this.state.position.y,
      this.state.width,
      this.state.height,
      sprite,
      colors
    );
  }

  protected getSprite(): number[][] {
    return [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 1, 2, 2, 1, 0],
      [0, 1, 3, 3, 1, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0]
    ];
  }

  public getDamage(): number {
    return this.damage;
  }

  public getPoints(): number {
    return this.points;
  }

  public getElement(): ElementType {
    return this.element;
  }

  public createDeathParticles(): Particle[] {
    const particles: Particle[] = [];
    const color = ELEMENT_COLORS[this.element];
    
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: this.state.position.x + this.state.width / 2,
        y: this.state.position.y + this.state.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color,
        size: Math.random() * 5 + 2,
        lifetime: 30,
        maxLifetime: 30
      });
    }
    
    return particles;
  }
}

export class PatrolBot extends Enemy {
  private direction: number = 1;

  constructor(x: number, y: number, element: ElementType = ElementType.NEUTRAL) {
    super(x, y, 28, 24, 30, element, 'patrol', 10, 50);
  }

  protected override updateAI(playerX: number, playerY: number): void {
    super.updateAI(playerX, playerY);
    
    if (this.aiTimer % 120 === 0) {
      this.direction *= -1;
    }
    
    this.state.velocity.x = this.direction * 1.5;
  }

  protected override getSprite(): number[][] {
    return [
      [-1, 0, 0, 0, 0, 0, -1],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 2, 2, 2, 1, 0],
      [0, 1, 2, 3, 2, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, -1, -1, 1, 0]
    ];
  }
}

export class Turret extends Enemy {
  private shootCooldown: number = 0;

  constructor(x: number, y: number, element: ElementType = ElementType.NEUTRAL) {
    super(x, y, 24, 24, 40, element, 'turret', 15, 75);
  }

  protected override updateAI(playerX: number, playerY: number): void {
    super.updateAI(playerX, playerY);
    
    this.shootCooldown--;
  }

  public canShoot(playerX: number, playerY: number): boolean {
    const dx = playerX - this.state.position.x;
    const dy = playerY - this.state.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return this.shootCooldown <= 0 && distance < 400;
  }

  public shoot(playerX: number, playerY: number): { x: number; y: number; vx: number; vy: number; damage: number; element: ElementType } | null {
    if (!this.canShoot(playerX, playerY)) return null;
    
    this.shootCooldown = 90;
    
    const dx = playerX - this.state.position.x;
    const dy = playerY - this.state.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return {
      x: this.state.position.x + this.state.width / 2,
      y: this.state.position.y + this.state.height / 2,
      vx: (dx / distance) * 5,
      vy: (dy / distance) * 5,
      damage: this.damage,
      element: this.element
    };
  }

  protected override getSprite(): number[][] {
    return [
      [-1, -1, 0, 0, 0, -1, -1],
      [-1, 0, 1, 1, 1, 0, -1],
      [0, 1, 2, 2, 2, 1, 0],
      [0, 1, 2, 3, 2, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ];
  }
}
