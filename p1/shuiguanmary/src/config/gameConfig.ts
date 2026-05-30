export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const GRAVITY = 700;

export const PLAYER_ACCEL = 650;
export const PLAYER_DECEL = 380;
export const PLAYER_MAX_SPEED = 210;
export const PLAYER_AIR_CONTROL = 0.75;
export const PLAYER_JUMP_VELOCITY = -490;
export const PLAYER_SIZE = { w: 22, h: 30 };

export const PLATFORM_H = 16;

export const TURTLE_SPEED = 40;
export const TURTLE_FLIP_TIME = 5000;
export const CRAB_SPEED = 80;
export const CRAB_FLIP_TIME = 3000;
export const FLYBUG_SPEED = 60;
export const FLYBUG_FLIP_TIME = 2000;

export const KICK_SPEED = 350;
export const FIREBALL_SPEED_MIN = 80;
export const FIREBALL_SPEED_MAX = 160;

export const PLATFORM_Y = {
  ground: 568,
  layer2: 458,
  layer3: 348,
  layer4: 238,
  top: 56,
};

export const PIPE_POSITIONS = [
  { x: 120, y: 48 },
  { x: 680, y: 48 },
];

export const LAYER_PLATFORMS: { y: number; segments: { x: number; w: number }[] }[] = [
  {
    y: PLATFORM_Y.ground,
    segments: [{ x: 0, w: GAME_WIDTH }],
  },
  {
    y: PLATFORM_Y.layer2,
    segments: [
      { x: 0, w: 200 },
      { x: 280, w: 240 },
      { x: 600, w: 200 },
    ],
  },
  {
    y: PLATFORM_Y.layer3,
    segments: [
      { x: 0, w: 320 },
      { x: 480, w: 320 },
    ],
  },
  {
    y: PLATFORM_Y.layer4,
    segments: [
      { x: 0, w: 140 },
      { x: 220, w: 160 },
      { x: 420, w: 160 },
      { x: 660, w: 140 },
    ],
  },
];

export const ENEMY_SCORE = {
  turtle: 100,
  crab: 200,
  flybug: 300,
};
