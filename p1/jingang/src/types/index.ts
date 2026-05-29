export type PlayerState = 'IDLE' | 'WALKING' | 'JUMP_PREP' | 'JUMPING' | 'LANDING' | 'CLIMBING' | 'HAMMER' | 'DEAD';

export type DKState = 'IDLE' | 'THROWING' | 'FAKE_THROW' | 'RAGE' | 'BOSS' | 'CHEST_BEAT';

export type LevelType = 'construction' | 'warehouse' | 'clocktower';

export type BeamDirection = 'left' | 'right';

export interface BeamConfig {
  x: number;
  y: number;
  width: number;
  direction: BeamDirection;
  hasGap?: boolean;
  gapX?: number;
  gapWidth?: number;
}

export interface LadderConfig {
  x: number;
  y: number;
  height: number;
  isBarrelPath: boolean;
}

export interface HammerConfig {
  x: number;
  y: number;
}

export interface MinecartConfig {
  beamIndex: number;
  startX: number;
  endX: number;
  speed: number;
}

export interface ElevatorConfig {
  x: number;
  topY: number;
  bottomY: number;
  speed: number;
}

export interface FireTriggerConfig {
  beamIndex: number;
  x: number;
  delay: number;
  speed: number;
}

export interface LeverConfig {
  x: number;
  y: number;
}

export interface DKConfig {
  throwInterval: number;
  fakeThrowChance: number;
  rageThreshold: number;
  barrelSpeed: number;
}

export interface LevelConfig {
  id: string;
  type: LevelType;
  width: number;
  height: number;
  beams: BeamConfig[];
  ladders: LadderConfig[];
  hammers: HammerConfig[];
  minecarts: MinecartConfig[];
  elevators: ElevatorConfig[];
  fireTriggers: FireTriggerConfig[];
  lever?: LeverConfig;
  dkPosition: { x: number; y: number };
  dkConfig: DKConfig;
  nextLevel: string | null;
}

export interface GameState {
  score: number;
  lives: number;
  currentLevel: string;
  hammerTimer: number;
  isHammerActive: boolean;
  isPaused: boolean;
}

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;
export const TILE_SIZE = 16;
export const PLAYER_SPEED = 120;
export const PLAYER_JUMP_SPEED = -280;
export const PLAYER_CLIMB_SPEED = 80;
export const BARREL_BASE_SPEED = 60;
export const HAMMER_DURATION = 5000;
export const LANDING_DURATION = 150;
export const JUMP_PREP_DURATION = 80;
export const GRAVITY = 600;
