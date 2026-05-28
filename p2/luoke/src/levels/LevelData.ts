import { LevelData, Platform, ElementType } from '../utils/types';

const createPlatforms = (levelType: string): Platform[] => {
  const platforms: Platform[] = [];
  
  platforms.push({ x: 0, y: 500, width: 3000, height: 40, type: 'solid' });
  
  switch (levelType) {
    case 'fire':
      platforms.push(
        { x: 200, y: 400, width: 150, height: 20, type: 'solid' },
        { x: 450, y: 350, width: 150, height: 20, type: 'solid' },
        { x: 700, y: 300, width: 150, height: 20, type: 'solid' },
        { x: 950, y: 350, width: 150, height: 20, type: 'solid' },
        { x: 1200, y: 400, width: 200, height: 20, type: 'solid' },
        { x: 350, y: 250, width: 100, height: 20, type: 'breakable' },
        { x: 550, y: 200, width: 100, height: 20, type: 'breakable' },
        { x: 800, y: 480, width: 40, height: 20, type: 'spike' },
        { x: 1000, y: 480, width: 40, height: 20, type: 'spike' }
      );
      break;
      
    case 'ice':
      platforms.push(
        { x: 150, y: 420, width: 200, height: 20, type: 'solid' },
        { x: 450, y: 380, width: 200, height: 20, type: 'solid' },
        { x: 750, y: 340, width: 200, height: 20, type: 'solid' },
        { x: 1050, y: 380, width: 200, height: 20, type: 'solid' },
        { x: 1350, y: 420, width: 200, height: 20, type: 'solid' },
        { x: 600, y: 280, width: 120, height: 20, type: 'solid' },
        { x: 900, y: 240, width: 120, height: 20, type: 'solid' }
      );
      break;
      
    default:
      platforms.push(
        { x: 150, y: 400, width: 150, height: 20, type: 'solid' },
        { x: 400, y: 350, width: 150, height: 20, type: 'solid' },
        { x: 650, y: 300, width: 150, height: 20, type: 'solid' },
        { x: 900, y: 350, width: 150, height: 20, type: 'solid' },
        { x: 1150, y: 400, width: 150, height: 20, type: 'solid' },
        { x: 300, y: 250, width: 100, height: 20, type: 'breakable' },
        { x: 550, y: 200, width: 100, height: 20, type: 'breakable' }
      );
  }
  
  return platforms;
};

export const LEVELS: Record<string, LevelData> = {
  fire: {
    id: 'fire',
    name: '火焰关卡',
    element: ElementType.FIRE,
    backgroundColor: '#331100',
    platforms: createPlatforms('fire'),
    enemySpawns: [
      { type: 'patrol', x: 300, y: 460 },
      { type: 'patrol', x: 600, y: 460 },
      { type: 'turret', x: 850, y: 330 },
      { type: 'patrol', x: 1100, y: 460 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  ice: {
    id: 'ice',
    name: '寒冰关卡',
    element: ElementType.ICE,
    backgroundColor: '#002233',
    platforms: createPlatforms('ice'),
    enemySpawns: [
      { type: 'patrol', x: 250, y: 460 },
      { type: 'turret', x: 550, y: 360 },
      { type: 'patrol', x: 850, y: 460 },
      { type: 'turret', x: 1150, y: 360 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  thunder: {
    id: 'thunder',
    name: '雷电关卡',
    element: ElementType.THUNDER,
    backgroundColor: '#222200',
    platforms: createPlatforms('thunder'),
    enemySpawns: [
      { type: 'patrol', x: 200, y: 460 },
      { type: 'turret', x: 500, y: 310 },
      { type: 'patrol', x: 800, y: 460 },
      { type: 'turret', x: 1100, y: 310 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  gravity: {
    id: 'gravity',
    name: '重力关卡',
    element: ElementType.GRAVITY,
    backgroundColor: '#220033',
    platforms: createPlatforms('gravity'),
    enemySpawns: [
      { type: 'patrol', x: 350, y: 460 },
      { type: 'patrol', x: 700, y: 460 },
      { type: 'turret', x: 1000, y: 260 },
      { type: 'patrol', x: 1300, y: 460 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  time: {
    id: 'time',
    name: '时间关卡',
    element: ElementType.TIME,
    backgroundColor: '#003322',
    platforms: createPlatforms('time'),
    enemySpawns: [
      { type: 'turret', x: 300, y: 310 },
      { type: 'patrol', x: 600, y: 460 },
      { type: 'turret', x: 900, y: 310 },
      { type: 'patrol', x: 1200, y: 460 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  shadow: {
    id: 'shadow',
    name: '暗影关卡',
    element: ElementType.SHADOW,
    backgroundColor: '#111122',
    platforms: createPlatforms('shadow'),
    enemySpawns: [
      { type: 'patrol', x: 400, y: 460 },
      { type: 'turret', x: 700, y: 260 },
      { type: 'patrol', x: 1000, y: 460 },
      { type: 'turret', x: 1300, y: 260 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  sonic: {
    id: 'sonic',
    name: '声波关卡',
    element: ElementType.SONIC,
    backgroundColor: '#330033',
    platforms: createPlatforms('sonic'),
    enemySpawns: [
      { type: 'turret', x: 250, y: 360 },
      { type: 'patrol', x: 550, y: 460 },
      { type: 'turret', x: 850, y: 360 },
      { type: 'patrol', x: 1150, y: 460 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  },
  toxic: {
    id: 'toxic',
    name: '毒素关卡',
    element: ElementType.TOXIC,
    backgroundColor: '#113300',
    platforms: createPlatforms('toxic'),
    enemySpawns: [
      { type: 'patrol', x: 300, y: 460 },
      { type: 'patrol', x: 600, y: 460 },
      { type: 'turret', x: 900, y: 260 },
      { type: 'patrol', x: 1200, y: 460 }
    ],
    bossPosition: { x: 2500, y: 400 },
    width: 3000,
    height: 540
  }
};
