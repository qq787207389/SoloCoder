import { Game } from '../engine/Game';
import { Vector2 } from '../engine/Entity';
import { Bullet } from './Bullet';
import { BulletEmitter } from './BulletEmitter';

export enum WeaponType {
  RIFLE = 'rifle',
  SHOTGUN = 'shotgun',
  MACHINEGUN = 'machinegun',
  LASER = 'laser'
}

export interface WeaponConfig {
  fireRate: number;
  damage: number;
  bulletSpeed: number;
  bulletCount: number;
  spread: number;
  color: string;
}

const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig[]> = {
  [WeaponType.RIFLE]: [
    { fireRate: 0.15, damage: 1, bulletSpeed: 700, bulletCount: 1, spread: 0, color: '#ffff00' },
    { fireRate: 0.12, damage: 2, bulletSpeed: 750, bulletCount: 1, spread: 0, color: '#ffaa00' },
    { fireRate: 0.10, damage: 3, bulletSpeed: 800, bulletCount: 2, spread: 0.1, color: '#ff6600' }
  ],
  [WeaponType.SHOTGUN]: [
    { fireRate: 0.5, damage: 1, bulletSpeed: 500, bulletCount: 5, spread: 0.3, color: '#00ffff' },
    { fireRate: 0.4, damage: 1, bulletSpeed: 550, bulletCount: 7, spread: 0.35, color: '#00ddff' },
    { fireRate: 0.3, damage: 2, bulletSpeed: 600, bulletCount: 9, spread: 0.4, color: '#00aaff' }
  ],
  [WeaponType.MACHINEGUN]: [
    { fireRate: 0.08, damage: 1, bulletSpeed: 600, bulletCount: 1, spread: 0.1, color: '#ff00ff' },
    { fireRate: 0.06, damage: 1, bulletSpeed: 650, bulletCount: 1, spread: 0.08, color: '#ff66ff' },
    { fireRate: 0.04, damage: 2, bulletSpeed: 700, bulletCount: 2, spread: 0.12, color: '#ffaaff' }
  ],
  [WeaponType.LASER]: [
    { fireRate: 0.2, damage: 3, bulletSpeed: 1000, bulletCount: 1, spread: 0, color: '#ff0000' },
    { fireRate: 0.15, damage: 4, bulletSpeed: 1100, bulletCount: 1, spread: 0, color: '#ff3333' },
    { fireRate: 0.12, damage: 5, bulletSpeed: 1200, bulletCount: 1, spread: 0, color: '#ff6666' }
  ]
};

export class Weapon {
  private game: Game;
  public type: WeaponType;
  public level: number;
  public config: WeaponConfig;
  public fireRate: number;
  public bulletEmitter: BulletEmitter;

  constructor(game: Game, type: WeaponType, level: number = 1) {
    this.game = game;
    this.type = type;
    this.level = Math.min(Math.max(level, 1), 3);
    this.config = WEAPON_CONFIGS[type][this.level - 1];
    this.fireRate = this.config.fireRate;
    this.bulletEmitter = new BulletEmitter(game);
  }

  public update(deltaTime: number): void {
    this.bulletEmitter.update(deltaTime);
  }

  public shoot(x: number, y: number, direction: Vector2, isEnemy: boolean): void {
    const pool = isEnemy ? this.game.enemyBulletPool : this.game.bulletPool;
    
    const baseAngle = Math.atan2(direction.y, direction.x);
    
    for (let i = 0; i < this.config.bulletCount; i++) {
      let angle = baseAngle;
      if (this.config.bulletCount > 1) {
        const spreadOffset = (i - (this.config.bulletCount - 1) / 2) * this.config.spread;
        angle += spreadOffset;
      }
      
      const bulletDir: Vector2 = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      
      const bullet = pool.acquire();
      bullet.init(
        x,
        y,
        bulletDir,
        isEnemy,
        this.config.damage,
        this.config.bulletSpeed,
        this.config.color,
        4
      );
    }
  }

  public upgrade(): void {
    if (this.level < 3) {
      this.level++;
      this.config = WEAPON_CONFIGS[this.type][this.level - 1];
      this.fireRate = this.config.fireRate;
    }
  }

  public setType(type: WeaponType): void {
    this.type = type;
    this.config = WEAPON_CONFIGS[type][this.level - 1];
    this.fireRate = this.config.fireRate;
  }
}