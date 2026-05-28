export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const TILE_SIZE = 32;
export const GRAVITY = 0.6;
export const MAX_FALL_SPEED = 12;
export const PLAYER_SPEED = 4;
export const JUMP_FORCE = -12;
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 32;
export const INVINCIBLE_TIME = 60;
export const SHOOT_COOLDOWN = 10;
export const BASE_MAX_HEALTH = 100;
export const BASE_MAX_ENERGY = 100;
export const ENERGY_REGEN = 0.1;
export const OVERLOAD_MAX = 100;
export const OVERLOAD_PER_KILL = 10;

export const WEAPON_CONFIGS = {
  neutral: {
    type: 'neutral',
    name: '普通弹',
    damage: 10,
    energyCost: 0,
    cooldown: 10,
    color: '#FFFF00',
    projectileSpeed: 10,
    projectileSize: { x: 12, y: 8 }
  },
  fire: {
    type: 'fire',
    name: '火焰炮',
    damage: 20,
    energyCost: 5,
    cooldown: 15,
    color: '#FF4400',
    projectileSpeed: 8,
    projectileSize: { x: 20, y: 16 }
  },
  ice: {
    type: 'ice',
    name: '冰冻射线',
    damage: 15,
    energyCost: 4,
    cooldown: 12,
    color: '#00DDFF',
    projectileSpeed: 12,
    projectileSize: { x: 16, y: 8 }
  },
  thunder: {
    type: 'thunder',
    name: '电磁脉冲',
    damage: 25,
    energyCost: 8,
    cooldown: 20,
    color: '#FFFF00',
    projectileSpeed: 15,
    projectileSize: { x: 24, y: 12 }
  },
  gravity: {
    type: 'gravity',
    name: '重力炸弹',
    damage: 30,
    energyCost: 10,
    cooldown: 30,
    color: '#AA00FF',
    projectileSpeed: 6,
    projectileSize: { x: 16, y: 16 }
  },
  time: {
    type: 'time',
    name: '时间迟缓',
    damage: 12,
    energyCost: 6,
    cooldown: 25,
    color: '#00AA66',
    projectileSpeed: 5,
    projectileSize: { x: 20, y: 20 }
  },
  shadow: {
    type: 'shadow',
    name: '暗影突袭',
    damage: 35,
    energyCost: 12,
    cooldown: 40,
    color: '#666666',
    projectileSpeed: 20,
    projectileSize: { x: 12, y: 12 }
  },
  sonic: {
    type: 'sonic',
    name: '声波',
    damage: 18,
    energyCost: 7,
    cooldown: 18,
    color: '#FF88FF',
    projectileSpeed: 14,
    projectileSize: { x: 28, y: 14 }
  },
  toxic: {
    type: 'toxic',
    name: '毒素云',
    damage: 8,
    energyCost: 3,
    cooldown: 8,
    color: '#88FF00',
    projectileSpeed: 4,
    projectileSize: { x: 24, y: 24 }
  }
};

export const BOSS_NAMES: Record<string, string> = {
  fire: '火焰人',
  ice: '寒冰人',
  thunder: '雷电人',
  gravity: '重力人',
  time: '时间人',
  shadow: '暗影人',
  sonic: '声波人',
  toxic: '毒素人'
};

export const KEY_BINDINGS = {
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  JUMP: ['Space', 'KeyK'],
  SHOOT: ['KeyJ'],
  WEAPON_1: ['Digit1'],
  WEAPON_2: ['Digit2'],
  WEAPON_3: ['Digit3'],
  WEAPON_4: ['Digit4'],
  WEAPON_5: ['Digit5'],
  WEAPON_6: ['Digit6'],
  WEAPON_7: ['Digit7'],
  WEAPON_8: ['Digit8'],
  OVERLOAD: ['KeyO'],
  PAUSE: ['Escape', 'KeyP'],
  SELECT: ['Enter'],
  BACK: ['Escape']
};
