import { Game } from '../engine/Game';
import { Vector2 } from '../engine/Entity';

export enum EmitterType {
  LINEAR = 'linear',
  CIRCULAR = 'circular',
  SPIRAL = 'spiral',
  TRACKING = 'tracking'
}

export interface EmitterConfig {
  type: EmitterType;
  bulletCount: number;
  fireRate: number;
  bulletSpeed: number;
  damage: number;
  color: string;
  angle?: number;
  spread?: number;
  rotationSpeed?: number;
}

export class BulletEmitter {
  private game: Game;
  private configs: EmitterConfig[];
  private timers: number[];
  private active: boolean;
  private spiralAngle: number;
  public x: number;
  public y: number;

  constructor(game: Game) {
    this.game = game;
    this.configs = [];
    this.timers = [];
    this.active = false;
    this.spiralAngle = 0;
    this.x = 0;
    this.y = 0;
  }

  public addConfig(config: EmitterConfig): void {
    this.configs.push(config);
    this.timers.push(0);
  }

  public clearConfigs(): void {
    this.configs = [];
    this.timers = [];
  }

  public start(): void {
    this.active = true;
    this.timers = this.configs.map(() => 0);
  }

  public stop(): void {
    this.active = false;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.spiralAngle += deltaTime * 2;

    this.configs.forEach((config, index) => {
      this.timers[index] -= deltaTime;
      
      if (this.timers[index] <= 0) {
        this.timers[index] = config.fireRate;
        this.fire(config);
      }
    });
  }

  private fire(config: EmitterConfig): void {
    const pool = this.game.enemyBulletPool;
    const player = this.game.player;

    switch (config.type) {
      case EmitterType.LINEAR:
        this.fireLinear(config, pool);
        break;
      case EmitterType.CIRCULAR:
        this.fireCircular(config, pool);
        break;
      case EmitterType.SPIRAL:
        this.fireSpiral(config, pool);
        break;
      case EmitterType.TRACKING:
        this.fireTracking(config, pool, player);
        break;
    }
  }

  private fireLinear(config: EmitterConfig, pool: any): void {
    const angle = config.angle || Math.PI;
    for (let i = 0; i < config.bulletCount; i++) {
      const spread = config.spread || 0.3;
      const bulletAngle = angle + (i - (config.bulletCount - 1) / 2) * spread;
      const direction: Vector2 = {
        x: Math.cos(bulletAngle),
        y: Math.sin(bulletAngle)
      };
      
      const bullet = pool.acquire();
      bullet.init(this.x, this.y, direction, true, config.damage, config.bulletSpeed, config.color, 5);
    }
  }

  private fireCircular(config: EmitterConfig, pool: any): void {
    for (let i = 0; i < config.bulletCount; i++) {
      const angle = (i / config.bulletCount) * Math.PI * 2;
      const direction: Vector2 = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      
      const bullet = pool.acquire();
      bullet.init(this.x, this.y, direction, true, config.damage, config.bulletSpeed, config.color, 5);
    }
  }

  private fireSpiral(config: EmitterConfig, pool: any): void {
    for (let i = 0; i < config.bulletCount; i++) {
      const angle = this.spiralAngle + (i / config.bulletCount) * Math.PI * 2;
      const direction: Vector2 = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      
      const bullet = pool.acquire();
      bullet.init(this.x, this.y, direction, true, config.damage, config.bulletSpeed, config.color, 5);
    }
  }

  private fireTracking(config: EmitterConfig, pool: any, player: any): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const baseAngle = Math.atan2(dy, dx);

    for (let i = 0; i < config.bulletCount; i++) {
      const spread = config.spread || 0.2;
      const angle = baseAngle + (i - (config.bulletCount - 1) / 2) * spread;
      const direction: Vector2 = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      };
      
      const bullet = pool.acquire();
      bullet.init(this.x, this.y, direction, true, config.damage, config.bulletSpeed, config.color, 5);
    }
  }
}