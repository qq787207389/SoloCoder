import { Entity } from '../core/Entity';
import { Renderer } from '../core/Renderer';
import { PhysicsEngine } from '../core/Physics';
import { Platform, ELEMENT_COLORS, ElementType, Particle } from '../utils/types';

export class Projectile extends Entity {
  private element: ElementType;
  private damage: number;
  private lifetime: number;
  private fromPlayer: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    vx: number,
    vy: number,
    element: ElementType,
    damage: number,
    fromPlayer: boolean,
    lifetime: number = 120
  ) {
    super(x, y, width, height, 1);
    this.element = element;
    this.damage = damage;
    this.fromPlayer = fromPlayer;
    this.lifetime = lifetime;
    this.state.velocity = { x: vx, y: vy };
  }

  public update(_deltaTime: number, platforms: Platform[]): void {
    this.state.position.x += this.state.velocity.x;
    this.state.position.y += this.state.velocity.y;
    
    this.lifetime--;
    
    if (this.lifetime <= 0) {
      this.state.isActive = false;
    }

    const rect = {
      x: this.state.position.x,
      y: this.state.position.y,
      width: this.state.width,
      height: this.state.height
    };
    
    for (const platform of platforms) {
      if (platform.type === 'solid' && PhysicsEngine.checkCollision(rect, platform)) {
        this.state.isActive = false;
        break;
      }
    }
  }

  public render(renderer: Renderer): void {
    const color = ELEMENT_COLORS[this.element];
    
    renderer.drawRect(
      this.state.position.x,
      this.state.position.y,
      this.state.width,
      this.state.height,
      color
    );

    renderer.drawRect(
      this.state.position.x + 2,
      this.state.position.y + 2,
      this.state.width - 4,
      this.state.height - 4,
      '#ffffff'
    );
  }

  public getElement(): ElementType {
    return this.element;
  }

  public getDamage(): number {
    return this.damage;
  }

  public isFromPlayer(): boolean {
    return this.fromPlayer;
  }

  public createHitParticles(): Particle[] {
    const particles: Particle[] = [];
    const color = ELEMENT_COLORS[this.element];
    
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: this.state.position.x + this.state.width / 2,
        y: this.state.position.y + this.state.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        size: Math.random() * 4 + 2,
        lifetime: 20,
        maxLifetime: 20
      });
    }
    
    return particles;
  }
}
