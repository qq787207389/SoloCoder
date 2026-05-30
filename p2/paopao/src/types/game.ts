export interface GameState {
  score: number;
  lives: number;
  level: number;
  powerUp: PowerUpType | null;
  powerUpTimer: number;
}

export type PowerUpType = 'rapid' | 'shockwave';

export type EnemyType = 'basic' | 'flying' | 'fire' | 'boss';

export type LevelTheme = 'cave' | 'ice' | 'volcano';

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnemyConfig {
  type: EnemyType;
  x: number;
  y: number;
}

export interface LevelConfig {
  theme: LevelTheme;
  platforms: PlatformConfig[];
  enemies: EnemyConfig[];
  isBoss?: boolean;
}

export interface BubbleState {
  vx: number;
  vy: number;
  bounces: number;
  trappedEnemy: Phaser.Physics.Arcade.Sprite | null;
  trappingPlayer: boolean;
  lifeTime: number;
  maxLifeTime: number;
}

export interface EnemyState {
  type: EnemyType;
  trapped: boolean;
  trapTimer: number;
  health: number;
  maxHealth: number;
  direction: number;
  fireCooldown: number;
}
