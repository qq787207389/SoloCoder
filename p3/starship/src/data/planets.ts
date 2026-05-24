import type { Planet, PlanetType, GoodType, PlanetGood } from '../types';
import { GOOD_TYPES, GOODS } from './goods';

interface PlanetTemplate {
  name: string;
  type: PlanetType;
  description: string;
  color: string;
  produces: GoodType[];
  consumes: GoodType[];
  baseSupply: Record<GoodType, number>;
  baseDemand: Record<GoodType, number>;
}

const PLANET_TEMPLATES: PlanetTemplate[] = [
  {
    name: '新伊甸',
    type: 'agricultural',
    description: '肥沃的农业星球，广袤的麦田和果园覆盖了大部分地表。',
    color: '#4ade80',
    produces: ['food'],
    consumes: ['industrialParts', 'electronics'],
    baseSupply: { food: 100, ore: 20, electronics: 10, consumerGoods: 30, rareMinerals: 5, industrialParts: 15 },
    baseDemand: { food: 30, ore: 40, electronics: 70, consumerGoods: 50, rareMinerals: 20, industrialParts: 80 }
  },
  {
    name: '铁砧星',
    type: 'mining',
    description: '富含矿物的岩石星球，矿井和冶炼厂遍布各地。',
    color: '#a16207',
    produces: ['ore'],
    consumes: ['food', 'consumerGoods'],
    baseSupply: { food: 20, ore: 100, electronics: 15, consumerGoods: 25, rareMinerals: 40, industrialParts: 35 },
    baseDemand: { food: 90, ore: 20, electronics: 50, consumerGoods: 85, rareMinerals: 15, industrialParts: 60 }
  },
  {
    name: '奇点站',
    type: 'tech',
    description: '高科技研究中心，悬浮在太空中的巨型空间站。',
    color: '#3b82f6',
    produces: ['electronics'],
    consumes: ['rareMinerals', 'food'],
    baseSupply: { food: 15, ore: 25, electronics: 90, consumerGoods: 40, rareMinerals: 10, industrialParts: 50 },
    baseDemand: { food: 60, ore: 30, electronics: 25, consumerGoods: 55, rareMinerals: 95, industrialParts: 45 }
  },
  {
    name: '熔炉世界',
    type: 'industrial',
    description: '重工业星球，烟囱林立，日夜不停地生产各种工业品。',
    color: '#ef4444',
    produces: ['industrialParts'],
    consumes: ['ore', 'electronics'],
    baseSupply: { food: 25, ore: 35, electronics: 30, consumerGoods: 45, rareMinerals: 15, industrialParts: 95 },
    baseDemand: { food: 70, ore: 95, electronics: 75, consumerGoods: 50, rareMinerals: 40, industrialParts: 20 }
  },
  {
    name: '黄金港',
    type: 'trade',
    description: '繁华的贸易枢纽，来自银河系各地的商人和货物汇聚于此。',
    color: '#eab308',
    produces: ['consumerGoods'],
    consumes: [],
    baseSupply: { food: 50, ore: 50, electronics: 50, consumerGoods: 70, rareMinerals: 50, industrialParts: 50 },
    baseDemand: { food: 50, ore: 50, electronics: 50, consumerGoods: 40, rareMinerals: 50, industrialParts: 50 }
  },
  {
    name: '翡翠谷',
    type: 'agricultural',
    description: '气候宜人的农业星球，以出产高品质食品闻名。',
    color: '#22c55e',
    produces: ['food'],
    consumes: ['industrialParts'],
    baseSupply: { food: 110, ore: 15, electronics: 20, consumerGoods: 35, rareMinerals: 8, industrialParts: 20 },
    baseDemand: { food: 25, ore: 35, electronics: 60, consumerGoods: 55, rareMinerals: 25, industrialParts: 75 }
  },
  {
    name: '深渊矿场',
    type: 'mining',
    description: '深入地下的采矿殖民地，出产珍贵的稀有矿物。',
    color: '#78350f',
    produces: ['ore', 'rareMinerals'],
    consumes: ['food', 'consumerGoods', 'industrialParts'],
    baseSupply: { food: 10, ore: 120, electronics: 10, consumerGoods: 20, rareMinerals: 60, industrialParts: 25 },
    baseDemand: { food: 95, ore: 15, electronics: 45, consumerGoods: 90, rareMinerals: 10, industrialParts: 70 }
  },
  {
    name: '智芯城',
    type: 'tech',
    description: '人工智能研究中心，整个星球就是一台超级计算机。',
    color: '#06b6d4',
    produces: ['electronics'],
    consumes: ['rareMinerals', 'industrialParts'],
    baseSupply: { food: 20, ore: 20, electronics: 100, consumerGoods: 35, rareMinerals: 8, industrialParts: 40 },
    baseDemand: { food: 55, ore: 25, electronics: 20, consumerGoods: 50, rareMinerals: 100, industrialParts: 65 }
  },
  {
    name: '铸造厂',
    type: 'industrial',
    description: '军工制造星球，生产舰队所需的武器和装甲。',
    color: '#dc2626',
    produces: ['industrialParts'],
    consumes: ['ore', 'rareMinerals'],
    baseSupply: { food: 30, ore: 40, electronics: 35, consumerGoods: 40, rareMinerals: 20, industrialParts: 100 },
    baseDemand: { food: 65, ore: 100, electronics: 55, consumerGoods: 45, rareMinerals: 80, industrialParts: 25 }
  },
  {
    name: '水晶宫',
    type: 'trade',
    description: '奢华的贸易中心，是富商巨贾们的游乐场。',
    color: '#f472b6',
    produces: [],
    consumes: [],
    baseSupply: { food: 60, ore: 60, electronics: 60, consumerGoods: 80, rareMinerals: 60, industrialParts: 60 },
    baseDemand: { food: 60, ore: 60, electronics: 60, consumerGoods: 30, rareMinerals: 60, industrialParts: 60 }
  },
  {
    name: '希望殖民地',
    type: 'agricultural',
    description: '新建的农业殖民地，充满了机遇与挑战。',
    color: '#84cc16',
    produces: ['food'],
    consumes: ['industrialParts', 'consumerGoods'],
    baseSupply: { food: 85, ore: 25, electronics: 15, consumerGoods: 30, rareMinerals: 12, industrialParts: 18 },
    baseDemand: { food: 35, ore: 45, electronics: 65, consumerGoods: 75, rareMinerals: 22, industrialParts: 85 }
  },
  {
    name: '彗星港',
    type: 'trade',
    description: '位于彗星轨道上的自由贸易港，法律在这里形同虚设。',
    color: '#8b5cf6',
    produces: [],
    consumes: [],
    baseSupply: { food: 45, ore: 45, electronics: 45, consumerGoods: 65, rareMinerals: 45, industrialParts: 45 },
    baseDemand: { food: 55, ore: 55, electronics: 55, consumerGoods: 50, rareMinerals: 55, industrialParts: 55 }
  }
];

function generatePlanetGoods(template: PlanetTemplate): PlanetGood[] {
  return GOOD_TYPES.map(type => {
    const good = GOODS[type];
    const baseSupply = template.baseSupply[type] || 50;
    const baseDemand = template.baseDemand[type] || 50;
    const variance = 0.2;
    const supply = baseSupply * (1 + (Math.random() - 0.5) * variance);
    const demand = baseDemand * (1 + (Math.random() - 0.5) * variance);
    const priceRatio = demand / supply;
    const currentPrice = Math.round(good.basePrice * priceRatio);
    return {
      type,
      supply: Math.round(supply),
      demand: Math.round(demand),
      currentPrice,
      priceHistory: [currentPrice]
    };
  });
}

export function generatePlanets(): Planet[] {
  const positions = generatePlanetPositions(PLANET_TEMPLATES.length);
  return PLANET_TEMPLATES.map((template, index) => ({
    id: `planet-${index}`,
    name: template.name,
    type: template.type,
    x: positions[index].x,
    y: positions[index].y,
    goods: generatePlanetGoods(template),
    description: template.description,
    color: template.color,
    size: 20 + Math.random() * 15,
    activeEvents: []
  }));
}

function generatePlanetPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const minDistance = 120;
  const mapWidth = 800;
  const mapHeight = 500;
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0, y = 0;
    while (!validPosition && attempts < 100) {
      x = 100 + Math.random() * (mapWidth - 200);
      y = 80 + Math.random() * (mapHeight - 160);
      validPosition = positions.every(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return Math.sqrt(dx * dx + dy * dy) > minDistance;
      });
      attempts++;
    }
    positions.push({ x, y });
  }
  return positions;
}
