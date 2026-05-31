export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'cloud' | 'moving_cloud' | 'island' | 'bubble';
  moveRangeX?: number;
  moveRangeY?: number;
  moveSpeed?: number;
}

export interface EnemyDef {
  x: number;
  y: number;
  type: 'beetle' | 'jellyfish' | 'dragon';
}

export interface ItemDef {
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'rare_gem' | 'heart';
  requiresRainbow?: boolean;
}

export interface LevelDef {
  name: string;
  height: number;
  platforms: PlatformDef[];
  enemies: EnemyDef[];
  items: ItemDef[];
  bossAreaY: number;
  bossType: 'dragon_king';
}

export const LEVEL_1: LevelDef = {
  name: '第一关：彩虹初现',
  height: 3000,
  platforms: [
    { x: 0, y: 2950, w: 480, h: 50, type: 'island' },
    { x: 50, y: 2800, w: 80, h: 16, type: 'cloud' },
    { x: 180, y: 2700, w: 100, h: 16, type: 'cloud' },
    { x: 320, y: 2600, w: 90, h: 16, type: 'cloud' },
    { x: 80, y: 2500, w: 70, h: 16, type: 'cloud' },
    { x: 200, y: 2400, w: 80, h: 16, type: 'moving_cloud', moveRangeX: 60, moveRangeY: 0, moveSpeed: 1.5 },
    { x: 350, y: 2300, w: 70, h: 16, type: 'cloud' },
    { x: 100, y: 2180, w: 60, h: 16, type: 'bubble', moveRangeX: 40, moveRangeY: 30, moveSpeed: 2 },
    { x: 250, y: 2080, w: 90, h: 16, type: 'cloud' },
    { x: 380, y: 1980, w: 70, h: 16, type: 'cloud' },
    { x: 60, y: 1880, w: 100, h: 16, type: 'cloud' },
    { x: 200, y: 1780, w: 80, h: 16, type: 'moving_cloud', moveRangeX: 0, moveRangeY: 50, moveSpeed: 1.2 },
    { x: 340, y: 1680, w: 80, h: 16, type: 'cloud' },
    { x: 120, y: 1580, w: 70, h: 16, type: 'cloud' },
    { x: 260, y: 1480, w: 60, h: 16, type: 'bubble', moveRangeX: 50, moveRangeY: 40, moveSpeed: 1.8 },
    { x: 380, y: 1380, w: 80, h: 16, type: 'cloud' },
    { x: 50, y: 1280, w: 90, h: 16, type: 'cloud' },
    { x: 190, y: 1180, w: 100, h: 16, type: 'cloud' },
    { x: 330, y: 1080, w: 70, h: 16, type: 'moving_cloud', moveRangeX: 70, moveRangeY: 0, moveSpeed: 1.6 },
    { x: 100, y: 980, w: 80, h: 16, type: 'cloud' },
    { x: 240, y: 880, w: 60, h: 16, type: 'bubble', moveRangeX: 30, moveRangeY: 50, moveSpeed: 2.2 },
    { x: 370, y: 780, w: 90, h: 16, type: 'cloud' },
    { x: 80, y: 680, w: 70, h: 16, type: 'cloud' },
    { x: 210, y: 580, w: 80, h: 16, type: 'moving_cloud', moveRangeX: 50, moveRangeY: 30, moveSpeed: 1.4 },
    { x: 350, y: 480, w: 60, h: 16, type: 'cloud' },
    { x: 150, y: 380, w: 180, h: 20, type: 'island' },
    { x: 50, y: 280, w: 80, h: 16, type: 'cloud' },
    { x: 350, y: 280, w: 80, h: 16, type: 'cloud' },
    { x: 200, y: 180, w: 80, h: 16, type: 'bubble', moveRangeX: 60, moveRangeY: 20, moveSpeed: 2 },
    { x: 100, y: 80, w: 280, h: 24, type: 'island' },
  ],
  enemies: [
    { x: 200, y: 2920, type: 'beetle' },
    { x: 220, y: 2670, type: 'beetle' },
    { x: 350, y: 2570, type: 'beetle' },
    { x: 150, y: 2150, type: 'jellyfish' },
    { x: 300, y: 2050, type: 'jellyfish' },
    { x: 100, y: 1850, type: 'beetle' },
    { x: 250, y: 1750, type: 'jellyfish' },
    { x: 360, y: 1650, type: 'beetle' },
    { x: 180, y: 1550, type: 'jellyfish' },
    { x: 320, y: 1350, type: 'beetle' },
    { x: 80, y: 1250, type: 'jellyfish' },
    { x: 220, y: 1150, type: 'dragon' },
    { x: 350, y: 1050, type: 'jellyfish' },
    { x: 120, y: 950, type: 'beetle' },
    { x: 280, y: 850, type: 'dragon' },
    { x: 390, y: 750, type: 'jellyfish' },
    { x: 100, y: 650, type: 'dragon' },
    { x: 240, y: 550, type: 'beetle' },
    { x: 360, y: 450, type: 'dragon' },
  ],
  items: [
    { x: 70, y: 2780, type: 'coin' },
    { x: 200, y: 2680, type: 'coin' },
    { x: 230, y: 2680, type: 'coin' },
    { x: 340, y: 2580, type: 'coin' },
    { x: 100, y: 2480, type: 'gem' },
    { x: 220, y: 2380, type: 'coin' },
    { x: 360, y: 2280, type: 'coin' },
    { x: 390, y: 2280, type: 'coin' },
    { x: 120, y: 2160, type: 'heart' },
    { x: 270, y: 2060, type: 'gem' },
    { x: 300, y: 2060, type: 'gem' },
    { x: 400, y: 1960, type: 'coin' },
    { x: 80, y: 1860, type: 'coin' },
    { x: 110, y: 1860, type: 'coin' },
    { x: 220, y: 1760, type: 'rare_gem', requiresRainbow: true },
    { x: 360, y: 1660, type: 'coin' },
    { x: 140, y: 1560, type: 'gem' },
    { x: 280, y: 1460, type: 'heart' },
    { x: 400, y: 1360, type: 'coin' },
    { x: 70, y: 1260, type: 'coin' },
    { x: 100, y: 1260, type: 'coin' },
    { x: 210, y: 1160, type: 'gem' },
    { x: 240, y: 1160, type: 'gem' },
    { x: 350, y: 1060, type: 'rare_gem', requiresRainbow: true },
    { x: 120, y: 960, type: 'coin' },
    { x: 260, y: 860, type: 'gem' },
    { x: 390, y: 760, type: 'heart' },
    { x: 100, y: 660, type: 'rare_gem', requiresRainbow: true },
    { x: 230, y: 560, type: 'gem' },
    { x: 370, y: 460, type: 'rare_gem', requiresRainbow: true },
    { x: 200, y: 360, type: 'heart' },
    { x: 240, y: 360, type: 'gem' },
    { x: 70, y: 260, type: 'gem' },
    { x: 370, y: 260, type: 'gem' },
    { x: 220, y: 160, type: 'rare_gem', requiresRainbow: true },
    { x: 200, y: 60, type: 'heart' },
  ],
  bossAreaY: 400,
  bossType: 'dragon_king',
};
