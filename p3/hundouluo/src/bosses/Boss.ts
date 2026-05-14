import { Entity } from '../engine/Entity';
import { Game } from '../engine/Game';
import { BulletEmitter, EmitterType } from '../weapons/BulletEmitter';

export enum BossPhase {
  PHASE_1 = 1,
  PHASE_2 = 2,
  PHASE_3 = 3
}

export enum BossState {
  IDLE = 'idle',
  MOVE = 'move',
  ATTACK = 'attack',
  TRANSITION = 'transition',
  DEAD = 'dead'
}

export interface BossPhaseConfig {
  healthThreshold: number;
  attackPatterns: string[];
  speed: number;
  damage: number;
}

export abstract class Boss extends Entity {
  protected phase: BossPhase;
  protected state: BossState;
  protected stateTimer: number;
  protected transitionTimer: number;
  protected phaseConfigs: BossPhaseConfig[];
  protected bulletEmitters: BulletEmitter[];
  protected targetX: number;
  protected targetY: number;
  protected moveSpeed: number;
  protected attackPatternIndex: number;
  protected scoreValue: number;

  constructor(game: Game, x: number, y: number, width: number, height: number, maxHealth: number, scoreValue: number) {
    super(game, x, y, width, height);
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.scoreValue = scoreValue;
    this.phase = BossPhase.PHASE_1;
    this.state = BossState.IDLE;
    this.stateTimer = 0;
    this.transitionTimer = 0;
    this.phaseConfigs = [];
    this.bulletEmitters = [];
    this.targetX = x;
    this.targetY = y;
    this.moveSpeed = 80;
    this.attackPatternIndex = 0;
    this.setupPhaseConfigs();
  }

  protected abstract setupPhaseConfigs(): void;
  protected abstract executeAttackPattern(pattern: string): void;
  protected abstract updatePhaseTransition(deltaTime: number): void;
  protected abstract renderBoss(ctx: CanvasRenderingContext2D, screenX: number): void;

  public update(deltaTime: number): void {
    if (this.state === BossState.DEAD) return;

    this.checkPhaseTransition();

    if (this.state === BossState.TRANSITION) {
      this.updatePhaseTransition(deltaTime);
      return;
    }

    this.stateTimer -= deltaTime;

    switch (this.state) {
      case BossState.IDLE:
        this.updateIdle(deltaTime);
        break;
      case BossState.MOVE:
        this.updateMove(deltaTime);
        break;
      case BossState.ATTACK:
        this.updateAttack(deltaTime);
        break;
    }

    this.bulletEmitters.forEach(emitter => {
      emitter.setPosition(this.x + this.width / 2, this.y + this.height / 2);
      emitter.update(deltaTime);
    });
  }

  protected checkPhaseTransition(): void {
    const healthPercent = this.health / this.maxHealth;
    const currentConfig = this.phaseConfigs[this.phase - 1];
    
    if (this.phase < this.phaseConfigs.length && healthPercent <= currentConfig.healthThreshold) {
      this.startPhaseTransition();
    }
  }

  protected startPhaseTransition(): void {
    this.state = BossState.TRANSITION;
    this.transitionTimer = 2;
    this.bulletEmitters.forEach(emitter => emitter.stop());
    
    this.phase++;
    const newConfig = this.phaseConfigs[this.phase - 1];
    this.moveSpeed = newConfig.speed;
    
    this.onPhaseChange(this.phase);
  }

  protected onPhaseChange(newPhase: BossPhase): void {}

  protected updateIdle(deltaTime: number): void {
    if (this.stateTimer <= 0) {
      this.state = BossState.MOVE;
      this.stateTimer = 2 + Math.random() * 2;
      this.setNewTarget();
    }
  }

  protected setNewTarget(): void {
    const camera = this.game.camera;
    this.targetX = camera.x + 200 + Math.random() * 400;
    this.targetY = 100 + Math.random() * 250;
  }

  protected updateMove(deltaTime: number): void {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      this.x += (dx / dist) * this.moveSpeed * deltaTime;
      this.y += (dy / dist) * this.moveSpeed * deltaTime;
    }

    if (this.stateTimer <= 0 || dist < 10) {
      this.state = BossState.ATTACK;
      this.stateTimer = 3 + Math.random() * 2;
      this.startAttack();
    }
  }

  protected startAttack(): void {
    const config = this.phaseConfigs[this.phase - 1];
    const pattern = config.attackPatterns[this.attackPatternIndex % config.attackPatterns.length];
    this.executeAttackPattern(pattern);
    this.attackPatternIndex++;
  }

  protected updateAttack(deltaTime: number): void {
    if (this.stateTimer <= 0) {
      this.state = BossState.IDLE;
      this.stateTimer = 1 + Math.random();
      this.bulletEmitters.forEach(emitter => emitter.stop());
    }
  }

  public die(): void {
    this.state = BossState.DEAD;
    this.active = false;
    this.bulletEmitters.forEach(emitter => emitter.stop());
    this.game.score += this.scoreValue;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    this.renderBoss(ctx, screenX);
  }

  public getPhase(): BossPhase {
    return this.phase;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }
}

export class FirstBoss extends Boss {
  private wingAngle: number;
  private corePulse: number;

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 80, 80, 100, 5000);
    this.wingAngle = 0;
    this.corePulse = 0;
  }

  protected setupPhaseConfigs(): void {
    this.phaseConfigs = [
      {
        healthThreshold: 0.66,
        attackPatterns: ['spiral', 'tracking'],
        speed: 100,
        damage: 1
      },
      {
        healthThreshold: 0.33,
        attackPatterns: ['spiral', 'tracking', 'circular'],
        speed: 130,
        damage: 1
      },
      {
        healthThreshold: 0,
        attackPatterns: ['spiral', 'tracking', 'circular', 'barrage'],
        speed: 160,
        damage: 2
      }
    ];
  }

  protected onPhaseChange(newPhase: BossPhase): void {
    this.setupEmittersForPhase(newPhase);
  }

  private setupEmittersForPhase(phase: BossPhase): void {
    this.bulletEmitters.forEach(e => e.stop());
    this.bulletEmitters = [];
    
    const config = this.phaseConfigs[phase - 1];
    
    const emitter1 = new BulletEmitter(this.game);
    emitter1.setPosition(this.x + this.width / 2, this.y + this.height / 2);
    this.bulletEmitters.push(emitter1);
    
    if (phase >= BossPhase.PHASE_2) {
      const emitter2 = new BulletEmitter(this.game);
      emitter2.setPosition(this.x + this.width / 4, this.y + this.height / 2);
      this.bulletEmitters.push(emitter2);
      
      const emitter3 = new BulletEmitter(this.game);
      emitter3.setPosition(this.x + this.width * 3 / 4, this.y + this.height / 2);
      this.bulletEmitters.push(emitter3);
    }
  }

  protected executeAttackPattern(pattern: string): void {
    const config = this.phaseConfigs[this.phase - 1];
    
    switch (pattern) {
      case 'spiral':
        this.bulletEmitters[0].clearConfigs();
        this.bulletEmitters[0].addConfig({
          type: EmitterType.SPIRAL,
          bulletCount: 4,
          fireRate: 0.1,
          bulletSpeed: 200,
          damage: config.damage,
          color: '#ff6b6b'
        });
        this.bulletEmitters[0].start();
        break;
        
      case 'tracking':
        this.bulletEmitters[0].clearConfigs();
        this.bulletEmitters[0].addConfig({
          type: EmitterType.TRACKING,
          bulletCount: 5,
          fireRate: 0.5,
          bulletSpeed: 280,
          damage: config.damage,
          color: '#4ecdc4',
          spread: 0.3
        });
        this.bulletEmitters[0].start();
        break;
        
      case 'circular':
        if (this.bulletEmitters.length >= 3) {
          this.bulletEmitters[1].clearConfigs();
          this.bulletEmitters[1].addConfig({
            type: EmitterType.CIRCULAR,
            bulletCount: 12,
            fireRate: 0.8,
            bulletSpeed: 220,
            damage: config.damage,
            color: '#ffe66d'
          });
          this.bulletEmitters[1].start();
          
          this.bulletEmitters[2].clearConfigs();
          this.bulletEmitters[2].addConfig({
            type: EmitterType.CIRCULAR,
            bulletCount: 12,
            fireRate: 0.8,
            bulletSpeed: 220,
            damage: config.damage,
            color: '#ffe66d'
          });
          this.bulletEmitters[2].start();
        }
        break;
        
      case 'barrage':
        this.bulletEmitters.forEach((emitter, index) => {
          emitter.clearConfigs();
          emitter.addConfig({
            type: EmitterType.LINEAR,
            bulletCount: 8,
            fireRate: 0.15,
            bulletSpeed: 300,
            damage: config.damage,
            color: '#ff006e',
            angle: Math.PI + (index * 0.3 - 0.3),
            spread: 0.2
          });
          emitter.start();
        });
        break;
    }
  }

  protected updatePhaseTransition(deltaTime: number): void {
    this.transitionTimer -= deltaTime;
    this.wingAngle += deltaTime * 10;
    
    if (this.transitionTimer <= 0) {
      this.state = BossState.IDLE;
      this.stateTimer = 1;
    }
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    this.wingAngle += deltaTime * 3;
    this.corePulse += deltaTime * 5;
  }

  protected renderBoss(ctx: CanvasRenderingContext2D, screenX: number): void {
    const phaseColors = ['#ef4444', '#f97316', '#dc2626'];
    const color = phaseColors[this.phase - 1];
    
    ctx.save();
    ctx.translate(screenX + this.width / 2, this.y + this.height / 2);
    
    const wingOffset = Math.sin(this.wingAngle) * 10;
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-40, -30 + wingOffset);
    ctx.lineTo(-35, 10);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, -30 - wingOffset);
    ctx.lineTo(35, 10);
    ctx.fill();
    
    const pulseSize = 1 + Math.sin(this.corePulse) * 0.1;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 20 * pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 10 * pulseSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.restore();
    
    if (this.state === BossState.TRANSITION) {
      ctx.fillStyle = `rgba(255, 255, 0, ${0.3 + Math.sin(this.transitionTimer * 10) * 0.2})`;
      ctx.fillRect(screenX - 10, this.y - 10, this.width + 20, this.height + 20);
    }
  }
}