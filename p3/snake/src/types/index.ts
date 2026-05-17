export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameMode = 'classic' | 'battle' | 'ai';
export type Theme = 'classic' | 'grass' | 'cyberpunk';
export type FoodType = 'normal' | 'golden' | 'poison' | 'speed' | 'phase';
export type AIStrategy = 'aggressive' | 'defensive' | 'random';
export type PowerUpType = 'slow' | 'speed' | 'phase' | null;

export interface Position {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
  renderX: number;
  renderY: number;
}

export interface SnakeState {
  id: number;
  segments: SnakeSegment[];
  direction: Direction;
  nextDirection: Direction;
  isAlive: boolean;
  score: number;
  color: string;
  speedMultiplier: number;
  powerUp: PowerUpType;
  powerUpEndTime: number;
  foodsEaten: number;
  isAI: boolean;
  aiStrategy?: AIStrategy;
  respawnTime?: number;
}

export interface FoodState {
  id: number;
  x: number;
  y: number;
  type: FoodType;
  spawnTime: number;
  duration: number;
}

export interface ObstacleState {
  id: number;
  x: number;
  y: number;
  type: 'rock' | 'tree';
}

export interface ParticleState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface GameConfig {
  grid: { width: number; height: number; cellSize: number };
  snake: {
    initialLength: number;
    baseSpeed: number;
    speedIncrement: number;
    speedIncrementInterval: number;
  };
  gameModes: Record<GameMode, {
    name: string;
    maxFoods: number;
    obstacleCount: number;
    aiCount?: number;
  }>;
  foodTypes: Record<FoodType, {
    name: string;
    color: string;
    growth: number;
    score: number;
    duration: number;
    spawnChance: number;
    blink?: boolean;
    effect?: PowerUpType;
  }>;
  themes: Record<Theme, {
    name: string;
    background: string;
    grid: string;
    snakeHead: string;
    snakeBody: string;
    obstacle: string;
  }>;
  aiStrategies: Record<AIStrategy, {
    name: string;
    foodPriority: number;
    playerChase: number;
    patrolChance: number;
  }>;
  particles: {
    maxParticles: number;
    gravity: number;
    friction: number;
    lifetime: number;
  };
  audio: {
    masterVolume: number;
    effects: Record<string, {
      frequency: number;
      duration: number;
      type: OscillatorType;
    }>;
  };
}

export interface GameState {
  mode: GameMode;
  theme: Theme;
  isPaused: boolean;
  isGameOver: boolean;
  isInMenu: boolean;
  snakes: SnakeState[];
  foods: FoodState[];
  obstacles: ObstacleState[];
  particles: ParticleState[];
  wrapWalls: boolean;
  startTime: number;
  elapsedTime: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export type Leaderboard = Record<GameMode, LeaderboardEntry[]>;