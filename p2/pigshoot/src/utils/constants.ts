export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PIXEL_SIZE = 2;

export const COLORS = {
  SKY_BLUE: '#87CEEB',
  SKY_LIGHT: '#B0E0E6',
  GREEN_CLIFF: '#228B22',
  GREEN_CLIFF_DARK: '#1a6b1a',
  GREEN_CLIFF_LIGHT: '#32CD32',
  BROWN_CLIFF: '#8B4513',
  BROWN_CLIFF_DARK: '#654321',
  BROWN_CLIFF_LIGHT: '#A0522D',
  PIG_PINK: '#FFB6C1',
  PIG_PINK_DARK: '#FF69B4',
  WOLF_GRAY: '#808080',
  WOLF_GRAY_DARK: '#696969',
  WOLF_PINK: '#FF69B4',
  WOLF_PINK_LIGHT: '#FFB6C1',
  BALLOON_RED: '#FF4444',
  BALLOON_BLUE: '#4444FF',
  BALLOON_YELLOW: '#FFFF44',
  BALLOON_GREEN: '#44FF44',
  BALLOON_PURPLE: '#AA44FF',
  WOOD_BROWN: '#A0522D',
  WOOD_DARK: '#654321',
  ROPE_GRAY: '#696969',
  ARROW_BROWN: '#8B4513',
  MEAT_PINK: '#FF6B6B',
  MEAT_BONE: '#F5F5DC',
  ROCK_GRAY: '#808080',
  ROCK_DARK: '#505050',
  LADDER_BROWN: '#8B4513',
  TEXT_WHITE: '#FFFFFF',
  TEXT_YELLOW: '#FFFF00',
  UI_BG: 'rgba(0, 0, 0, 0.7)',
  RAINBOW: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
};

export const BALLOON_COLORS = [
  COLORS.BALLOON_RED,
  COLORS.BALLOON_BLUE,
  COLORS.BALLOON_YELLOW,
  COLORS.BALLOON_GREEN,
  COLORS.BALLOON_PURPLE
];

export const DIFFICULTY = {
  CYCLE_MULTIPLIER: 1.5,
  SPAWN_RATE_BASE: 2500,
  WOLF_SPEED_BASE: 40,
  MAX_WOLVES_BASE: 5
};

export const PLAYER = {
  WIDTH: 48,
  HEIGHT: 64,
  SPEED: 180,
  MAX_ARROWS: 2,
  BASE_SHOOT_DELAY: 350,
  MIN_Y: 80,
  MAX_Y: GAME_HEIGHT - 100
};

export const WOLF = {
  WIDTH: 32,
  HEIGHT: 40,
  BALLOON_RADIUS: 18,
  FALL_SPEED: 200,
  CLIMB_SPEED: 60,
  ROCK_THROW_INTERVAL: 3000
};

export const ARROW = {
  WIDTH: 28,
  HEIGHT: 6,
  SPEED: 550
};

export const MEAT = {
  WIDTH: 28,
  HEIGHT: 18,
  GRAVITY: 450,
  DETECT_RADIUS: 120
};

export const BONUS_VALUES = {
  STRAWBERRY: 100,
  CHERRY: 200,
  ORANGE: 400,
  APPLE: 800,
  MELON: 1600,
  FAMICOM: 3200,
  FACE: 8000
};

export const HIDDEN_TRIGGERS = {
  RAPID_MOVES: 8,
  EMPTY_SHOTS: 12,
  REBOUND_HITS: 3,
  CONSECUTIVE_HITS: 30,
  LEFT_BALLOON_HITS: 20
};

export const LEVEL_TIME = 60000;

export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_TRANSITION: 'level_transition',
  GAME_OVER: 'game_over'
} as const;

export type GameStateType = typeof GameState[keyof typeof GameState];

export const WolfState = {
  BALLOONING: 'ballooning',
  FALLING: 'falling',
  CLIMBING: 'climbing',
  ATTACKING: 'attacking',
  ASCENDING: 'ascending',
  REACHED_TOP: 'reached_top',
  DEAD: 'dead'
} as const;

export type WolfStateType = typeof WolfState[keyof typeof WolfState];

export const HiddenItemType = {
  LEAF: 'leaf',
  MUSHROOM: 'mushroom',
  BUTTERFLY: 'butterfly',
  BIRD: 'bird',
  CATERPILLAR: 'caterpillar',
  BEETLE: 'beetle'
} as const;

export type HiddenItemTypeType = typeof HiddenItemType[keyof typeof HiddenItemType];
