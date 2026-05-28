export enum ElementType {
  NEUTRAL = 'neutral',
  FIRE = 'fire',
  ICE = 'ice',
  THUNDER = 'thunder',
  GRAVITY = 'gravity',
  TIME = 'time',
  SHADOW = 'shadow',
  SONIC = 'sonic',
  TOXIC = 'toxic'
}

export enum GameScreen {
  MAIN_MENU = 'main_menu',
  LEVEL_SELECT = 'level_select',
  LAB = 'lab',
  PLAYING = 'playing',
  PAUSED = 'paused',
  BOSS_FIGHT = 'boss_fight',
  VICTORY = 'victory',
  GAME_OVER = 'game_over'
}

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

export interface EntityState {
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  isActive: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
}

export interface PlayerState extends EntityState {
  energy: number;
  maxEnergy: number;
  gears: number;
  overload: number;
  currentWeapon: ElementType;
  unlockedWeapons: ElementType[];
  isJumping: boolean;
  isShooting: boolean;
  isGrounded: boolean;
  facingRight: boolean;
  chargeTime: number;
  healthUpgrades: number;
  energyUpgrades: number;
  chargeUpgrades: number;
}

export interface WeaponConfig {
  type: ElementType;
  name: string;
  damage: number;
  energyCost: number;
  cooldown: number;
  color: string;
  projectileSpeed: number;
  projectileSize: Vector2;
}

export interface ProjectileState extends EntityState {
  element: ElementType;
  damage: number;
  lifetime: number;
  fromPlayer: boolean;
}

export interface EnemyState extends EntityState {
  element: ElementType;
  type: string;
  damage: number;
  points: number;
  aiState: string;
  aiTimer: number;
}

export interface BossState extends EnemyState {
  phase: number;
  maxPhase: number;
  weakness: ElementType;
  currentAttack: string;
  attackCooldown: number;
  isActive: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'spike' | 'conveyor' | 'breakable';
  direction?: number;
  breakTimer?: number;
}

export interface LevelData {
  id: string;
  name: string;
  element: ElementType;
  backgroundColor: string;
  platforms: Platform[];
  enemySpawns: { type: string; x: number; y: number }[];
  bossPosition: Vector2;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export const ELEMENT_WEAKNESS: Record<ElementType, ElementType> = {
  [ElementType.FIRE]: ElementType.ICE,
  [ElementType.ICE]: ElementType.THUNDER,
  [ElementType.THUNDER]: ElementType.GRAVITY,
  [ElementType.GRAVITY]: ElementType.TIME,
  [ElementType.TIME]: ElementType.SHADOW,
  [ElementType.SHADOW]: ElementType.SONIC,
  [ElementType.SONIC]: ElementType.TOXIC,
  [ElementType.TOXIC]: ElementType.FIRE,
  [ElementType.NEUTRAL]: ElementType.NEUTRAL
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  [ElementType.NEUTRAL]: '#FFFF00',
  [ElementType.FIRE]: '#FF4400',
  [ElementType.ICE]: '#00DDFF',
  [ElementType.THUNDER]: '#FFFF00',
  [ElementType.GRAVITY]: '#AA00FF',
  [ElementType.TIME]: '#00AA66',
  [ElementType.SHADOW]: '#666666',
  [ElementType.SONIC]: '#FF88FF',
  [ElementType.TOXIC]: '#88FF00'
};

export const ELEMENT_NAMES: Record<ElementType, string> = {
  [ElementType.NEUTRAL]: '普通弹',
  [ElementType.FIRE]: '火焰炮',
  [ElementType.ICE]: '冰冻射线',
  [ElementType.THUNDER]: '电磁脉冲',
  [ElementType.GRAVITY]: '重力炸弹',
  [ElementType.TIME]: '时间迟缓',
  [ElementType.SHADOW]: '暗影突袭',
  [ElementType.SONIC]: '声波',
  [ElementType.TOXIC]: '毒素云'
};
