import { Entity } from '../core/Entity';
import { Renderer } from '../core/Renderer';
import { PhysicsEngine } from '../core/Physics';
import { 
  Platform, 
  ElementType, 
  ELEMENT_COLORS, 
  ELEMENT_WEAKNESS,
  Particle,
  BossState 
} from '../utils/types';

export class Boss extends Entity {
  protected element: ElementType;
  protected weakness: ElementType;
  protected phase: number = 1;
  protected maxPhase: number = 3;
  protected attackCooldown: number = 0;
  protected currentAttack: string = '';
  protected bossActive: boolean = false;
  protected animFrame: number = 0;
  protected animTimer: number = 0;
  protected moveDirection: number = 1;
  protected attackPatterns: string[] = ['basic', 'special', 'summon'];
  protected hitFlash: number = 0;

  constructor(
    x: number,
    y: number,
    element: ElementType,
    health: number = 300
  ) {
    super(x, y, 48, 64, health);
    this.element = element;
    this.weakness = ELEMENT_WEAKNESS[element];
  }

  public getBossState(): BossState {
    return {
      ...this.state,
      element: this.element,
      type: 'boss',
      damage: 20,
      points: 1000,
      aiState: this.currentAttack,
      aiTimer: this.attackCooldown,
      phase: this.phase,
      maxPhase: this.maxPhase,
      weakness: this.weakness,
      currentAttack: this.currentAttack,
      attackCooldown: this.attackCooldown,
      isActive: this.bossActive
    } as BossState;
  }

  public activate(): void {
    this.bossActive = true;
  }

  public deactivate(): void {
    this.bossActive = false;
  }

  public isBossActive(): boolean {
    return this.bossActive;
  }

  public update(_deltaTime: number, platforms: Platform[], playerX: number, playerY: number): void {
    if (!this.bossActive) return;

    this.updatePhase();
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
    
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.attackCooldown > 0) this.attackCooldown--;
  }

  protected updateAI(playerX: number, _playerY: number): void {
    const dx = playerX - this.state.position.x;
    
    if (Math.abs(dx) > 100) {
      this.state.velocity.x = Math.sign(dx) * 2;
    } else {
      this.state.velocity.x = 0;
    }
  }

  private updatePhase(): void {
    const healthPercent = this.state.health / this.state.maxHealth;
    
    if (healthPercent < 0.33 && this.phase < 3) {
      this.phase = 3;
    } else if (healthPercent < 0.66 && this.phase < 2) {
      this.phase = 2;
    }
  }

  private updateAnimation(): void {
    this.animTimer++;
    if (this.animTimer >= 8) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  public canAttack(): boolean {
    return this.attackCooldown <= 0 && this.bossActive;
  }

  public attack(playerX: number, playerY: number): any[] {
    if (!this.canAttack()) return [];
    
    const attacks: any[] = [];
    const patternIndex = Math.floor(Math.random() * Math.min(this.phase + 1, this.attackPatterns.length));
    this.currentAttack = this.attackPatterns[patternIndex];
    
    switch (this.currentAttack) {
      case 'basic':
        attacks.push(...this.basicAttack(playerX, playerY));
        this.attackCooldown = 60;
        break;
      case 'special':
        attacks.push(...this.specialAttack(playerX, playerY));
        this.attackCooldown = 90;
        break;
      case 'summon':
        attacks.push(...this.summonAttack());
        this.attackCooldown = 120;
        break;
    }
    
    return attacks;
  }

  protected basicAttack(playerX: number, playerY: number): any[] {
    const attacks: any[] = [];
    const dx = playerX - this.state.position.x - this.state.width / 2;
    const dy = playerY - this.state.position.y - this.state.height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.2;
      attacks.push({
        type: 'projectile',
        x: this.state.position.x + this.state.width / 2,
        y: this.state.position.y + this.state.height / 2,
        vx: (dx / dist) * 6 + spread * 2,
        vy: (dy / dist) * 6,
        damage: 15,
        element: this.element,
        size: 12
      });
    }
    
    return attacks;
  }

  protected specialAttack(_playerX: number, _playerY: number): any[] {
    const attacks: any[] = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      attacks.push({
        type: 'projectile',
        x: this.state.position.x + this.state.width / 2,
        y: this.state.position.y + this.state.height / 2,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        damage: 10,
        element: this.element,
        size: 10
      });
    }
    
    return attacks;
  }

  protected summonAttack(): any[] {
    return [{ type: 'summon' }];
  }

  public takeDamage(damage: number, weaponElement: ElementType): number {
    if (this.state.isInvincible) return 0;
    
    let finalDamage = damage;
    
    if (weaponElement === this.weakness) {
      finalDamage *= 2;
      this.hitFlash = 10;
    }
    
    this.state.health -= finalDamage;
    this.state.isInvincible = true;
    this.state.invincibleTimer = 20;
    
    if (this.state.health <= 0) {
      this.state.health = 0;
      this.bossActive = false;
    }
    
    return finalDamage;
  }

  public render(renderer: Renderer): void {
    if (!this.isActive) return;
    
    if (this.state.isInvincible && Math.floor(this.state.invincibleTimer / 3) % 2 === 0) {
      return;
    }

    const baseColor = ELEMENT_COLORS[this.element];
    const colors = this.hitFlash > 0 
      ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
      : [baseColor, this.darkenColor(baseColor, 0.5), this.darkenColor(baseColor, 0.3), '#ffff00'];
    
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
      [-1, -1, 0, 0, 0, 0, 0, 0, -1, -1],
      [-1, 0, 0, 1, 1, 1, 1, 0, 0, -1],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 2, 3, 3, 2, 1, 1, 0],
      [0, 1, 2, 2, 2, 2, 2, 2, 1, 0],
      [0, 1, 1, 2, 1, 1, 2, 1, 1, 0],
      [-1, 0, 1, 1, 2, 2, 1, 1, 0, -1],
      [-1, -1, 0, 1, 1, 1, 1, 0, -1, -1]
    ];
  }

  private darkenColor(color: string, factor: number): string {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    return `#${Math.floor(r * factor).toString(16).padStart(2, '0')}${Math.floor(g * factor).toString(16).padStart(2, '0')}${Math.floor(b * factor).toString(16).padStart(2, '0')}`;
  }

  public getElement(): ElementType {
    return this.element;
  }

  public getWeakness(): ElementType {
    return this.weakness;
  }

  public getPhase(): number {
    return this.phase;
  }

  public createDeathParticles(): Particle[] {
    const particles: Particle[] = [];
    const color = ELEMENT_COLORS[this.element];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: this.state.position.x + this.state.width / 2,
        y: this.state.position.y + this.state.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        color: i % 3 === 0 ? '#ffffff' : color,
        size: Math.random() * 8 + 4,
        lifetime: 60,
        maxLifetime: 60
      });
    }
    
    return particles;
  }
}
