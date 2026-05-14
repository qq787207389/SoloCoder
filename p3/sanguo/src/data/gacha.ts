import { GachaPool } from '../types'

export const GACHA_POOLS: Record<string, GachaPool> = {
  'normal': {
    id: 'normal',
    name: '普通招募',
    rates: [
      { rarity: 'N', rate: 0.5 },
      { rarity: 'R', rate: 0.35 },
      { rarity: 'SR', rate: 0.12 },
      { rarity: 'SSR', rate: 0.025 },
      { rarity: 'UR', rate: 0.005 }
    ],
    pityCount: 0,
    softPity: 80,
    hardPity: 100
  },
  'limited': {
    id: 'limited',
    name: '限定招募',
    rates: [
      { rarity: 'N', rate: 0.45 },
      { rarity: 'R', rate: 0.35 },
      { rarity: 'SR', rate: 0.14 },
      { rarity: 'SSR', rate: 0.045 },
      { rarity: 'UR', rate: 0.015 }
    ],
    pityCount: 0,
    softPity: 70,
    hardPity: 90,
    featured: ['lubu', 'zhugeliang']
  },
  'friend': {
    id: 'friend',
    name: '友情招募',
    rates: [
      { rarity: 'N', rate: 0.7 },
      { rarity: 'R', rate: 0.25 },
      { rarity: 'SR', rate: 0.05 }
    ],
    pityCount: 0,
    softPity: 0,
    hardPity: 0
  }
}
