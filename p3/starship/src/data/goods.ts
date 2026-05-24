import type { Good, GoodType } from '../types';

export const GOODS: Record<GoodType, Good> = {
  food: {
    id: 'food',
    name: '粮食',
    basePrice: 50,
    icon: '🌾'
  },
  ore: {
    id: 'ore',
    name: '矿石',
    basePrice: 80,
    icon: '🪨'
  },
  electronics: {
    id: 'electronics',
    name: '电子元件',
    basePrice: 200,
    icon: '🔌'
  },
  consumerGoods: {
    id: 'consumerGoods',
    name: '消费品',
    basePrice: 120,
    icon: '📦'
  },
  rareMinerals: {
    id: 'rareMinerals',
    name: '稀有矿',
    basePrice: 350,
    icon: '💎'
  },
  industrialParts: {
    id: 'industrialParts',
    name: '工业部件',
    basePrice: 180,
    icon: '⚙️'
  }
};

export const GOOD_TYPES: GoodType[] = [
  'food', 'ore', 'electronics', 'consumerGoods', 'rareMinerals', 'industrialParts'
];
