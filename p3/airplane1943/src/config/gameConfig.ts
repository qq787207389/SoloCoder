import { WeaponConfig, EnemyConfig, LevelConfig } from '../types/game';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  machinegun: {
    damage: 10,
    fireRate: 100,
    speed: 800,
    bulletCount: 2,
    spread: 30
  },
  torpedo: {
    damage: 100,
    fireRate: 2000,
    speed: 300,
    bulletCount: 1,
    spread: 0
  },
  rocket: {
    damage: 50,
    fireRate: 500,
    speed: 600,
    bulletCount: 6,
    spread: 15
  }
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  zero: {
    health: 30,
    speed: 150,
    score: 100,
    fireRate: 2000,
    bulletSpeed: 200
  },
  val: {
    health: 50,
    speed: 100,
    score: 200,
    fireRate: 1500,
    bulletSpeed: 250
  },
  betty: {
    health: 100,
    speed: 80,
    score: 500,
    fireRate: 1000,
    bulletSpeed: 180
  },
  boss: {
    health: 5000,
    speed: 30,
    score: 10000,
    fireRate: 200,
    bulletSpeed: 300
  }
};

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    name: '中途岛近海',
    background: 'midway',
    timeOfDay: 'morning',
    waves: [
      { time: 2000, type: 'zero', count: 3, pattern: 'line', position: { x: 240, y: -50 } },
      { time: 5000, type: 'zero', count: 5, pattern: 'v', position: { x: 240, y: -50 } },
      { time: 10000, type: 'val', count: 3, pattern: 'line', position: { x: 240, y: -50 } },
      { time: 15000, type: 'zero', count: 6, pattern: 'circle', position: { x: 240, y: -50 } },
      { time: 20000, type: 'betty', count: 2, pattern: 'line', position: { x: 240, y: -50 } }
    ],
    bossHealth: 3000
  },
  {
    name: '所罗门群岛',
    background: 'solomon',
    timeOfDay: 'night',
    waves: [
      { time: 2000, type: 'zero', count: 5, pattern: 'random', position: { x: 240, y: -50 } },
      { time: 6000, type: 'val', count: 4, pattern: 'v', position: { x: 240, y: -50 } },
      { time: 12000, type: 'zero', count: 8, pattern: 'circle', position: { x: 240, y: -50 } },
      { time: 18000, type: 'betty', count: 3, pattern: 'line', position: { x: 240, y: -50 } }
    ],
    bossHealth: 4000
  },
  {
    name: '冲绳近海',
    background: 'okinawa',
    timeOfDay: 'storm',
    waves: [
      { time: 2000, type: 'zero', count: 6, pattern: 'v', position: { x: 240, y: -50 } },
      { time: 5000, type: 'val', count: 5, pattern: 'line', position: { x: 240, y: -50 } },
      { time: 10000, type: 'betty', count: 4, pattern: 'circle', position: { x: 240, y: -50 } },
      { time: 15000, type: 'zero', count: 10, pattern: 'random', position: { x: 240, y: -50 } }
    ],
    bossHealth: 5000
  }
];

export const PLAYER_CONFIG = {
  speed: 400,
  maxHealth: 100,
  maxFuel: 100,
  fuelDecayRate: 0.1,
  hitFuelLoss: 15,
  invincibleTime: 1500
};

export const COLORS = {
  sky: 0x87CEEB,
  ocean: 0x1E90FF,
  bullet_orange: 0xFFA500,
  bullet_white: 0xFFFFFF,
  explosion: 0xFF4500,
  ui_background: 0x000000,
  ui_text: 0xFFFFFF,
  fuel_green: 0x00FF00,
  fuel_yellow: 0xFFFF00,
  fuel_red: 0xFF0000,
  energy_red: 0xFF0000,
  energy_blue: 0x0000FF,
  energy_green: 0x00FF00
};
