export const CANVAS_W = 640;
export const CANVAS_H = 360;
export const SCALE = 2;

export const TRACK_SEGMENT_LEN = 16;
export const TRACK_WIDTH = 80;
export const TRACK_TOTAL_SEGMENTS = 600;

export const MOTO_W = 6;
export const MOTO_H = 12;

export const MAX_SPEED = 3.2;
export const ACCEL = 0.04;
export const BRAKE_FORCE = 0.06;
export const FRICTION = 0.012;
export const TURN_RATE = 0.045;
export const DRIFT_FACTOR = 0.92;

export const GRAVITY = 0.15;
export const JUMP_FORCE = 4.5;
export const MAX_HEIGHT = 40;

export const AI_COUNT = 5;

export const CRASH_RECOVERY_TIME = 90;

export enum TerrainType {
  DIRT = 'dirt',
  GRASS = 'grass',
  DESERT = 'desert',
  SNOW = 'snow',
  BRIDGE = 'bridge',
}

export enum ObstacleType {
  MUD = 'mud',
  PUDDLE = 'puddle',
  BUMP = 'bump',
  RAMP = 'ramp',
  WASHBOARD = 'washboard',
  TREE = 'tree',
  ROCK = 'rock',
}

export enum TrackTheme {
  GRASSLAND = 'grassland',
  DESERT = 'desert',
  SNOW = 'snow',
}

export enum GameState {
  TITLE = 'title',
  COUNTDOWN = 'countdown',
  RACING = 'racing',
  FINISH = 'finish',
}

export enum PickupType {
  WRENCH = 'wrench',
  FUEL = 'fuel',
}

export interface TrackPoint {
  x: number;
  y: number;
  angle: number;
  width: number;
  terrain: TerrainType;
  obstacles: Obstacle[];
  pickups: Pickup[];
  isFinish: boolean;
  isStart: boolean;
}

export interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  relX: number;
}

export interface Pickup {
  type: PickupType;
  x: number;
  y: number;
  collected: boolean;
}

export interface TireTrack {
  x: number;
  y: number;
  age: number;
  angle: number;
}

export const TERRAIN_PROPS: Record<TerrainType, {
  friction: number;
  maxSpeed: number;
  color1: string;
  color2: string;
  edgeColor: string;
  slideFactor: number;
  jumpLandMult: number;
}> = {
  [TerrainType.DIRT]: {
    friction: 0.012,
    maxSpeed: 3.2,
    color1: '#8B6914',
    color2: '#7A5C10',
    edgeColor: '#5C4409',
    slideFactor: 0.0,
    jumpLandMult: 1.0,
  },
  [TerrainType.GRASS]: {
    friction: 0.008,
    maxSpeed: 3.0,
    color1: '#4A7A2E',
    color2: '#3D6826',
    edgeColor: '#2D4E1B',
    slideFactor: 0.02,
    jumpLandMult: 1.0,
  },
  [TerrainType.DESERT]: {
    friction: 0.02,
    maxSpeed: 2.8,
    color1: '#C4A35A',
    color2: '#B89545',
    edgeColor: '#9A7B30',
    slideFactor: 0.01,
    jumpLandMult: 0.7,
  },
  [TerrainType.SNOW]: {
    friction: 0.006,
    maxSpeed: 3.4,
    color1: '#D4E5F7',
    color2: '#C0D8F0',
    edgeColor: '#A8C4E0',
    slideFactor: 0.08,
    jumpLandMult: 1.2,
  },
  [TerrainType.BRIDGE]: {
    friction: 0.005,
    maxSpeed: 3.2,
    color1: '#8B6914',
    color2: '#7A5C10',
    edgeColor: '#5C4409',
    slideFactor: 0.04,
    jumpLandMult: 1.0,
  },
};

export const THEME_TERRAIN: Record<TrackTheme, TerrainType> = {
  [TrackTheme.GRASSLAND]: TerrainType.GRASS,
  [TrackTheme.DESERT]: TerrainType.DESERT,
  [TrackTheme.SNOW]: TerrainType.SNOW,
};

export const THEME_NAME: Record<TrackTheme, string> = {
  [TrackTheme.GRASSLAND]: '草地赛道',
  [TrackTheme.DESERT]: '沙漠赛道',
  [TrackTheme.SNOW]: '雪地赛道',
};
