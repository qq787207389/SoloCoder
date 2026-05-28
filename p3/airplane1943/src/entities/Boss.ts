import Phaser from 'phaser';
import { ENEMY_CONFIGS, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Bullet } from './Bullet';

export type BossPhase = 1 | 2 | 3;

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public health: number = 0;
  public maxHealth: number = 0;
  public phase: BossPhase = 1;
  private lastFireTime: number = 0;
  private enemyBulletPool: Phaser.Physics.Arcade.Group;
  private targetY: number = 150;
  private moveDirection: number = 1;
  private phaseTransition: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyBulletPool: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'boss');
    this.enemyBulletPool = enemyBulletPool;

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public spawn(maxHealth: number): void {
    this.setPosition(GAME_WIDTH / 2, -200);
    this.setActive(true);
    this.setVisible(true);
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.phase = 1;
    this.phaseTransition = false;
    this.targetY = 150;

    this.setDisplaySize(200, 150);
    this.setTint(0x4A4A4A);
    this.setBodySize(180, 130);
  }

  public update(time: number, delta: number): void {
    if (!this.active) return;

    if (this.y < this.targetY) {
      this.y += 30 * (delta / 1000);
      return;
    }

    this.x += this.moveDirection * 50 * (delta / 1000);
    
    if (this.x > GAME_WIDTH - 120) {
      this.moveDirection = -1;
    } else if (this.x < 120) {
      this.moveDirection = 1;
    }

    this.handleFiring(time);
    this.checkPhaseTransition();
  }

  private handleFiring(time: number): void {
    const fireRate = this.getFireRateByPhase();
    
    if (time - this.lastFireTime > fireRate) {
      this.firePattern();
      this.lastFireTime = time;
    }
  }

  private getFireRateByPhase(): number {
    switch (this.phase) {
      case 1: return 800;
      case 2: return 500;
      case 3: return 300;
    }
  }

  private firePattern(): void {
    const config = ENEMY_CONFIGS.boss;
    const bulletCount = this.getBulletCountByPhase();

    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.enemyBulletPool.get() as Bullet;
      if (!bullet) continue;

      const angle = this.getBulletAngle(i, bulletCount);
      const radians = Phaser.Math.DegToRad(angle);
      const vx = Math.cos(radians) * config.bulletSpeed;
      const vy = Math.sin(radians) * config.bulletSpeed;

      bullet.fire(
        this.x + this.getBulletOffsetX(i),
        this.y + 50,
        vx,
        vy,
        15,
        false,
        'enemy'
      );
    }
  }

  private getBulletCountByPhase(): number {
    switch (this.phase) {
      case 1: return 5;
      case 2: return 8;
      case 3: return 12;
    }
  }

  private getBulletAngle(index: number, total: number): number {
    const baseAngle = 90;
    const spreadAngle = this.phase === 3 ? 120 : 60;
    return baseAngle - spreadAngle / 2 + (spreadAngle / (total - 1)) * index;
  }

  private getBulletOffsetX(index: number): number {
    const positions = [-60, -30, 0, 30, 60, -45, 45, -75, 75, -15, 15, 0];
    return positions[index] || 0;
  }

  private checkPhaseTransition(): void {
    if (this.phaseTransition) return;

    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent <= 0.33 && this.phase < 3) {
      this.startPhaseTransition(3);
    } else if (healthPercent <= 0.66 && this.phase < 2) {
      this.startPhaseTransition(2);
    }
  }

  private startPhaseTransition(newPhase: BossPhase): void {
    this.phaseTransition = true;
    this.phase = newPhase;
    
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.phaseTransition = false;
        this.alpha = 1;
      }
    });

    this.scene.cameras.main.shake(500, 0.02);
  }

  public takeDamage(damage: number): number {
    this.health -= damage;
    
    if (this.health <= 0) {
      this.die();
      return ENEMY_CONFIGS.boss.score;
    }
    
    return 0;
  }

  private die(): void {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
    this.emit('bossDeath');
  }

  public getHealthPercent(): number {
    return Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
  }
}
