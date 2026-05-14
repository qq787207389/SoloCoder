import { Equipment } from '../types'

export const EQUIPMENT: Record<string, Equipment> = {
  'e001': {
    id: 'e001',
    name: '方天画戟',
    type: 'weapon',
    rarity: 'UR',
    stats: { atk: 150, critRate: 0.1 }
  },
  'e002': {
    id: 'e002',
    name: '青龙偃月刀',
    type: 'weapon',
    rarity: 'SSR',
    stats: { atk: 120, critDamage: 0.2 }
  },
  'e003': {
    id: 'e003',
    name: '丈八蛇矛',
    type: 'weapon',
    rarity: 'SSR',
    stats: { atk: 110, hp: 500 }
  },
  'e004': {
    id: 'e004',
    name: '青釭剑',
    type: 'weapon',
    rarity: 'SSR',
    stats: { atk: 100, critRate: 0.15 }
  },
  'e005': {
    id: 'e005',
    name: '麒麟弓',
    type: 'weapon',
    rarity: 'SSR',
    stats: { atk: 95, spd: 10 }
  },
  'e006': {
    id: 'e006',
    name: '龙鳞铠',
    type: 'armor',
    rarity: 'SSR',
    stats: { def: 80, hp: 800 }
  },
  'e007': {
    id: 'e007',
    name: '八卦衣',
    type: 'armor',
    rarity: 'SSR',
    stats: { def: 70, atk: 30 }
  },
  'e008': {
    id: 'e008',
    name: '赤兔马',
    type: 'horse',
    rarity: 'UR',
    stats: { spd: 30, critRate: 0.08 }
  },
  'e009': {
    id: 'e009',
    name: '的卢马',
    type: 'horse',
    rarity: 'SSR',
    stats: { spd: 25, def: 20 }
  },
  'e010': {
    id: 'e010',
    name: '玉玺',
    type: 'accessory',
    rarity: 'UR',
    stats: { atk: 50, def: 50, hp: 300 }
  }
}
