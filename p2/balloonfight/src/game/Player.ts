import Phaser from 'phaser';
import { GameConfig, PowerUpType } from '@/config/GameConfig';
import { InflationSystem } from './InflationSystem';
import {
  applyGravity,
  applyThrust,
  applyAirResistance,
  applyHorizontalMovement,
  bounceOffVerticalBounds,
  clamp,
  circleCollision,
} from '@/utils/PhysicsHelper';
import { createPulseTween, createDeathSpinTween } from '@/utils/AnimationHelper';
import { createBalloonPopEffect, createScreenShake } from '@/utils/ParticleEffects';

export interface ActivePowerUp {
  type: PowerUpType;
  timer: number;
  duration: number;
}

export class Player {
  id: number;
  scene: Phaser.Scene;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: number;
  balloonColor: number;
  isAlive: boolean;
  isDying: boolean;
  isClone: boolean;

  inflation: InflationSystem;
  activePowerUps: ActivePowerUp[];

  bodyGraphics: Phaser.GameObjects.Graphics;
  balloonGraphics: Phaser.GameObjects.Graphics;
  shieldGraphics: Phaser.GameObjects.Graphics | null;
  container: Phaser.GameObjects.Container;

  pulseTween: Phaser.Tweens.Tween | null;
  deathTween: Phaser.Tweens.Tween | null;

  moveDirection: number;
  isInflating: boolean;
  inflateDirection: number;

  deathFallVelocity: number;
  fallKiller: Player | null;

  constructor(
    scene: Phaser.Scene,
    id: number,
    x: number,
    y: number,
    color: number,
    balloonColor: number,
    isClone: boolean = false
  ) {
    this.scene = scene;
    this.id = id;
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.color = color;
    this.balloonColor = balloonColor;
    this.isAlive = true;
    this.isDying = false;
    this.isClone = isClone;

    this.inflation = new InflationSystem(100);
    this.activePowerUps = [];

    this.moveDirection = 0;
    this.isInflating = false;
    this.inflateDirection = 0;

    this.deathFallVelocity = 0;
    this.fallKiller = null;

    this.bodyGraphics = scene.add.graphics();
    this.balloonGraphics = scene.add.graphics();
    this.shieldGraphics = null;
    this.container = scene.add.container(x, y);
    this.container.add([this.balloonGraphics, this.bodyGraphics]);

    this.pulseTween = null;
    this.deathTween = null;

    this.draw();
    if (!this.isClone) {
      this.pulseTween = createPulseTween(scene, this.balloonGraphics);
    }
  }

  draw(): void {
    this.bodyGraphics.clear();
    this.balloonGraphics.clear();

    if (!this.isAlive) return;

    const bodyRadius = GameConfig.PLAYER_BODY_RADIUS;
    const balloonRadius = GameConfig.BALLOON_RADIUS * (0.7 + this.inflation.getPercentage() * 0.3);

    this.bodyGraphics.fillStyle(this.color);
    this.bodyGraphics.fillCircle(0, 10, bodyRadius);

    this.bodyGraphics.fillStyle(0xffe4c4);
    this.bodyGraphics.fillCircle(0, -8, bodyRadius * 0.7);

    this.bodyGraphics.fillStyle(0x000000);
    this.bodyGraphics.fillCircle(-4, -10, 3);
    this.bodyGraphics.fillCircle(4, -10, 3);

    this.balloonGraphics.fillStyle(this.balloonColor);
    this.balloonGraphics.beginPath();
    this.balloonGraphics.arc(0, -30, balloonRadius, 0, Math.PI * 2);
    this.balloonGraphics.fill();

    this.balloonGraphics.fillStyle(0xffffff);
    this.balloonGraphics.fillCircle(-balloonRadius * 0.3, -35, balloonRadius * 0.2);

    this.balloonGraphics.lineStyle(2, 0x000000);
    this.balloonGraphics.lineBetween(0, -30 + balloonRadius, 0, -15);

    if (this.hasPowerUp(PowerUpType.SHIELD) && this.shieldGraphics) {
      this.shieldGraphics.clear();
      this.shieldGraphics.lineStyle(3, GameConfig.COLORS.SHIELD_CYAN, 0.7);
      this.shieldGraphics.beginPath();
      this.shieldGraphics.arc(0, 0, GameConfig.BALLOON_RADIUS + 15, 0, Math.PI * 2);
      this.shieldGraphics.stroke();
    }
  }

  update(delta: number): void {
    if (!this.isAlive) {
      if (this.isDying) {
        this.deathFallVelocity = applyGravity(this.deathFallVelocity, delta);
        this.y += this.deathFallVelocity * (delta / 1000);
        this.container.setPosition(this.x, this.y);

        if (this.y > GameConfig.HEIGHT + 100) {
          this.isDying = false;
          this.destroy();
        }
      }
      return;
    }

    this.inflation.recover(delta);
    this.updatePowerUps(delta);

    this.velocityY = applyGravity(this.velocityY, delta);

    if (this.isInflating && this.inflation.canInflate()) {
      const drainAmount = this.inflation.drainRate * (delta / 1000);
      if (this.inflation.drain(drainAmount)) {
        let thrust = GameConfig.INFLATE_THRUST;
        if (this.hasPowerUp(PowerUpType.LIGHTNING_BOOTS)) {
          thrust *= GameConfig.LIGHTNING_BOOTS_MULTIPLIER;
        }
        this.velocityY = applyThrust(this.velocityY, thrust, delta);
        this.inflateDirection = 1;
      } else {
        this.inflateDirection = 0;
      }
    } else {
      this.inflateDirection = 0;
    }

    this.velocityY = clamp(this.velocityY, -600, GameConfig.MAX_FALL_SPEED);
    this.velocityX = applyHorizontalMovement(this.velocityX, this.moveDirection, delta);
    this.velocityX = applyAirResistance(this.velocityX);

    this.x += this.velocityX * (delta / 1000);
    this.y += this.velocityY * (delta / 1000);

    const bounceResult = bounceOffVerticalBounds(
      this.x,
      this.velocityX,
      GameConfig.BALLOON_RADIUS,
      GameConfig.WIDTH
    );
    this.x = bounceResult.x;
    this.velocityX = bounceResult.velocityX;

    this.y = clamp(this.y, GameConfig.BALLOON_RADIUS, GameConfig.HEIGHT - GameConfig.BALLOON_RADIUS);

    this.container.setPosition(this.x, this.y);
    this.draw();
  }

  updatePowerUps(delta: number): void {
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      this.activePowerUps[i].timer -= delta;
      if (this.activePowerUps[i].timer <= 0) {
        this.removePowerUp(this.activePowerUps[i].type);
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  moveLeft(): void {
    this.moveDirection = -1;
  }

  moveRight(): void {
    this.moveDirection = 1;
  }

  stopMoving(): void {
    this.moveDirection = 0;
  }

  startInflating(): void {
    this.isInflating = true;
  }

  stopInflating(): void {
    this.isInflating = false;
  }

  takeDamage(attacker: Player): boolean {
    if (!this.isAlive || this.isDying) return false;

    if (this.hasPowerUp(PowerUpType.SHIELD)) {
      this.removePowerUp(PowerUpType.SHIELD);
      return false;
    }

    this.isAlive = false;
    this.isDying = true;
    this.deathFallVelocity = 100;
    this.fallKiller = attacker;

    if (this.pulseTween) {
      this.pulseTween.stop();
    }

    this.deathTween = createDeathSpinTween(this.scene, this.container);
    createBalloonPopEffect(this.scene, this.x, this.y - 30, this.balloonColor);
    createScreenShake(this.scene, 15, 400);

    this.balloonGraphics.clear();

    return true;
  }

  applyPowerUp(type: PowerUpType): void {
    const existing = this.activePowerUps.find(p => p.type === type);
    if (existing) {
      existing.timer = GameConfig.POWERUP_DURATION;
      return;
    }

    this.activePowerUps.push({
      type,
      timer: GameConfig.POWERUP_DURATION,
      duration: GameConfig.POWERUP_DURATION,
    });

    if (type === PowerUpType.SHIELD) {
      this.shieldGraphics = this.scene.add.graphics();
      this.container.add(this.shieldGraphics);
    } else if (type === PowerUpType.LIGHTNING_BOOTS) {
      this.inflation.setRecoverRateMultiplier(2);
    }
  }

  removePowerUp(type: PowerUpType): void {
    if (type === PowerUpType.SHIELD && this.shieldGraphics) {
      this.shieldGraphics.destroy();
      this.shieldGraphics = null;
    } else if (type === PowerUpType.LIGHTNING_BOOTS) {
      this.inflation.resetRecoverRate();
    }
  }

  hasPowerUp(type: PowerUpType): boolean {
    return this.activePowerUps.some(p => p.type === type);
  }

  getBalloonCollisionRadius(): number {
    return GameConfig.BALLOON_RADIUS * 0.8;
  }

  getBodyCollisionRadius(): number {
    return GameConfig.PLAYER_BODY_RADIUS * 0.9;
  }

  checkBalloonCollision(other: Player): boolean {
    if (!this.isAlive || !other.isAlive) return false;
    return circleCollision(
      this.x, this.y - 30, this.getBalloonCollisionRadius(),
      other.x, other.y - 30, other.getBalloonCollisionRadius()
    );
  }

  checkBodyCollision(other: Player): boolean {
    if (!this.isAlive || !other.isAlive) return false;
    return circleCollision(
      this.x, this.y, this.getBodyCollisionRadius(),
      other.x, other.y, other.getBodyCollisionRadius()
    );
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isAlive = true;
    this.isDying = false;
    this.deathFallVelocity = 0;
    this.fallKiller = null;
    this.moveDirection = 0;
    this.isInflating = false;
    this.inflateDirection = 0;

    this.inflation.reset();
    this.activePowerUps.forEach(p => this.removePowerUp(p.type));
    this.activePowerUps = [];

    this.container.setPosition(x, y);
    this.container.setAngle(0);
    this.container.setAlpha(1);

    if (this.deathTween) {
      this.deathTween.stop();
      this.deathTween = null;
    }

    if (!this.pulseTween && !this.isClone) {
      this.pulseTween = createPulseTween(this.scene, this.balloonGraphics);
    }

    this.draw();
  }

  destroy(): void {
    if (this.pulseTween) this.pulseTween.stop();
    if (this.deathTween) this.deathTween.stop();
    this.activePowerUps.forEach(p => this.removePowerUp(p.type));
    this.container.destroy();
  }
}
