import Phaser from 'phaser';
import { EnemyType } from '../types/game';
import { ENEMY_CONFIGS, GAME_WIDTH } from '../config/gameConfig';
import { Bullet } from './Bullet';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType: EnemyType = 'zero';
  public health: number = 0;
  public maxHealth: number = 0;
  private lastFireTime: number = 0;
  private enemyBulletPool: Phaser.Physics.Arcade.Group;
  private movementPattern: 'straight' | 'sine' | 'circle' = 'straight';
  private patternTimer: number = 0;
  private baseX: number = 0;
  private baseY: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyBulletPool: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'enemy');
    this.enemyBulletPool = enemyBulletPool;

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public spawn(
    type: EnemyType,
    x: number,
    y: number,
    pattern: 'straight' | 'sine' | 'circle' = 'straight'
  ): void {
    this.enemyType = type;
    const config = ENEMY_CONFIGS[type];
    
    this.setPosition(x, y);
    this.baseX = x;
    this.baseY = y;
    this.setActive(true);
    this.setVisible(true);
    this.health = config.health;
    this.maxHealth = config.health;
    this.movementPattern = pattern;
    this.patternTimer = 0;

    const size = this.getSizeByType(type);
    this.setDisplaySize(size.width, size.height);
    this.setTint(this.getColorByType(type));
    this.setBodySize(this.width * 0.6, this.height * 0.6);
  }

  private getSizeByType(type: EnemyType): { width: number; height: number } {
    switch (type) {
      case 'zero':
        return { width: 35, height: 35 };
      case 'val':
        return { width: 45, height: 45 };
      case 'betty':
        return { width: 60, height: 60 };
      case 'boss':
        return { width: 200, height: 150 };
    }
  }

  private getColorByType(type: EnemyType): number {
    switch (type) {
      case 'zero':
        return 0x228B22;
      case 'val':
        return 0x8B4513;
      case 'betty':
        return 0x2F4F4F;
      case 'boss':
        return 0x4A4A4A;
    }
  }

  public update(time: number, delta: number): void {
    if (!this.active) return;

    const config = ENEMY_CONFIGS[this.enemyType];
    this.patternTimer += delta;

    switch (this.movementPattern) {
      case 'straight':
        this.y += config.speed * (delta / 1000);
        break;
      case 'sine':
        this.y += config.speed * (delta / 1000);
        this.x = this.baseX + Math.sin(this.patternTimer * 0.003) * 80;
        break;
      case 'circle':
        this.y += config.speed * 0.5 * (delta / 1000);
        this.x = this.baseX + Math.cos(this.patternTimer * 0.002) * 100;
        break;
    }

    if (time - this.lastFireTime > config.fireRate && this.y > 0) {
      this.fire();
      this.lastFireTime = time;
    }

    if (this.y > this.scene.scale.height + 100) {
      this.setActive(false);
      this.setVisible(false);
      this.disableBody(true, true);
    }
  }

  private fire(): void {
    const config = ENEMY_CONFIGS[this.enemyType];
    const bullet = this.enemyBulletPool.get() as Bullet;

    if (!bullet) return;

    bullet.fire(
      this.x,
      this.y + this.height / 2,
      0,
      config.bulletSpeed,
      config.health > 50 ? 15 : 10,
      false,
      'enemy'
    );
  }

  public takeDamage(damage: number): number {
    this.health -= damage;
    
    if (this.health <= 0) {
      this.die();
      return ENEMY_CONFIGS[this.enemyType].score;
    }
    
    return 0;
  }

  private die(): void {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
    this.emit('enemyDeath', this);
  }

  public dropFuelChance(): boolean {
    return Math.random() < 0.15;
  }

  public dropEnergyChance(): boolean {
    return Math.random() < 0.3;
  }
}
