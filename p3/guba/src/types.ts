export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameState = 'menu' | 'controls' | 'playing' | 'paused' | 'gameover' | 'victory' | 'levelComplete';

export type WeaponType = 'machinegun' | 'grenade' | 'flame' | 'missile';
export type EnemyType = 'infantry' | 'rocketeer' | 'bunker' | 'tank' | 'helicopter' | 'boss';
export type ItemType = 'health' | 'ammo' | 'weapon' | 'hostageCage';
export type LevelType = 'horizontal' | 'vertical';
export type ThemeType = 'jungle' | 'desert' | 'snow' | 'base';

export interface Weapon {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number;
  lastFired: number;
  ammo: number;
  maxAmmo: number;
  spread: number;
  projectileSpeed: number;
  color: string;
}

export interface BulletData {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  type: WeaponType;
  isPlayer: boolean;
  size: number;
  lifetime: number;
  explosionRadius?: number;
  targetId?: string;
}

export interface EnemyData {
  id: string;
  type: EnemyType;
  position: Vector2;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  fireRate: number;
  lastFired: number;
  score: number;
  active: boolean;
}

export interface HostageData {
  id: string;
  position: Vector2;
  state: 'caged' | 'free' | 'following' | 'onboard' | 'rescued';
  health: number;
  playerFollowing?: string;
  active: boolean;
}

export interface ItemData {
  id: string;
  type: ItemType;
  position: Vector2;
  value: number;
  weaponType?: WeaponType;
  active: boolean;
}

export interface ParticleData {
  id: string;
  position: Vector2;
  velocity: Vector2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
  type: 'explosion' | 'smoke' | 'spark' | 'trail';
}

export interface TileData {
  type: number;
  solid: boolean;
  destructible: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  type: LevelType;
  width: number;
  height: number;
  scrollSpeed: number;
  theme: ThemeType;
  tiles: number[][];
  enemies: EnemySpawn[];
  hostages: HostageSpawn[];
  items: ItemSpawn[];
  totalHostages: number;
  totalBuildings: number;
}

export interface EnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
  triggerX?: number;
  triggerY?: number;
}

export interface HostageSpawn {
  x: number;
  y: number;
}

export interface ItemSpawn {
  type: ItemType;
  x: number;
  y: number;
  value: number;
  weaponType?: WeaponType;
}

export interface GameStats {
  score: number;
  hostagesRescued: number;
  hostagesTotal: number;
  buildingsDestroyed: number;
  buildingsTotal: number;
  enemiesKilled: number;
  level: number;
  lives: number;
}

export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  secondary: boolean;
  switchWeapon: boolean;
}
