export type WeaponType = 'machinegun' | 'torpedo' | 'rocket';
export type FormationType = 'focus' | 'spread';
export type EnemyType = 'zero' | 'val' | 'betty' | 'boss';
export type PickupType = 'fuel' | 'energy_red' | 'energy_blue' | 'energy_green';

export interface Position {
  x: number;
  y: number;
}

export interface WeaponConfig {
  damage: number;
  fireRate: number;
  speed: number;
  bulletCount: number;
  spread: number;
}

export interface EnemyConfig {
  health: number;
  speed: number;
  score: number;
  fireRate: number;
  bulletSpeed: number;
}

export interface WaveConfig {
  time: number;
  type: EnemyType;
  count: number;
  pattern: 'line' | 'v' | 'circle' | 'random';
  position: Position;
}

export interface LevelConfig {
  name: string;
  background: string;
  timeOfDay: 'morning' | 'night' | 'storm';
  waves: WaveConfig[];
  bossHealth: number;
}

export interface GameState {
  score: number;
  lives: number;
  fuel: number;
  maxFuel: number;
  weaponLevel: number;
  currentWeapon: WeaponType;
  formation: FormationType;
  isPaused: boolean;
  isGameOver: boolean;
  waveIndex: number;
  levelIndex: number;
}
