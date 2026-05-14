import { Fate } from '../types'

export const FATES: Record<string, Fate> = {
  'f001': {
    id: 'f001',
    name: '三英战吕布',
    heroes: ['lubu', 'guanyu', 'zhangfei'],
    effect: { atk: 0.15, critRate: 0.05 }
  },
  'f002': {
    id: 'f002',
    name: '英雄美人',
    heroes: ['lubu', 'diaochan'],
    effect: { hp: 0.1, critDamage: 0.1 }
  },
  'f003': {
    id: 'f003',
    name: '五虎上将',
    heroes: ['guanyu', 'zhangfei', 'zhaoyun', 'zhugeliang'],
    effect: { atk: 0.2, spd: 0.1 }
  },
  'f004': {
    id: 'f004',
    name: '奸雄当道',
    heroes: ['caocao'],
    effect: { atk: 0.1, def: 0.1 }
  },
  'f005': {
    id: 'f005',
    name: '曹魏天下',
    heroes: ['caocao'],
    effect: { hp: 0.15, def: 0.1 }
  },
  'f006': {
    id: 'f006',
    name: '江东双璧',
    heroes: ['zhouyu', 'sunquan'],
    effect: { atk: 0.12, spd: 0.08 }
  },
  'f007': {
    id: 'f007',
    name: '东吴世家',
    heroes: ['sunquan', 'sunshangxiang'],
    effect: { def: 0.15, hp: 0.1 }
  },
  'f008': {
    id: 'f008',
    name: '卧龙先生',
    heroes: ['zhugeliang'],
    effect: { atk: 0.15, critRate: 0.08 }
  },
  'f009': {
    id: 'f009',
    name: '周郎顾曲',
    heroes: ['zhouyu'],
    effect: { atk: 0.1, critDamage: 0.15 }
  },
  'f010': {
    id: 'f010',
    name: '常胜将军',
    heroes: ['zhaoyun'],
    effect: { spd: 0.15, critRate: 0.06 }
  },
  'f011': {
    id: 'f011',
    name: '绝世佳人',
    heroes: ['diaochan'],
    effect: { spd: 0.1, def: 0.08 }
  },
  'f012': {
    id: 'f012',
    name: '巾帼英雄',
    heroes: ['sunshangxiang'],
    effect: { atk: 0.1, critRate: 0.05 }
  }
}
