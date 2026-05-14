import { Affix, Quality } from '../types'

export const affixPool: Omit<Affix, 'id'>[] = [
  { name: '力量', stat: 'attack', value: 5 },
  { name: '强壮', stat: 'attack', value: 10 },
  { name: '暴怒', stat: 'attack', value: 15 },
  { name: '神武', stat: 'attack', value: 25 },
  { name: '体魄', stat: 'maxHp', value: 50 },
  { name: '坚韧', stat: 'maxHp', value: 100 },
  { name: '生命', stat: 'maxHp', value: 200 },
  { name: '不朽', stat: 'maxHp', value: 350 },
  { name: '魔力', stat: 'magicAttack', value: 5 },
  { name: '魔法', stat: 'magicAttack', value: 10 },
  { name: '圣灵', stat: 'magicAttack', value: 15 },
  { name: '传说', stat: 'magicAttack', value: 25 },
  { name: '守护', stat: 'defense', value: 5 },
  { name: '铁壁', stat: 'defense', value: 10 },
  { name: '金刚', stat: 'defense', value: 15 },
  { name: '不破', stat: 'defense', value: 25 },
  { name: '灵韵', stat: 'maxMp', value: 30 },
  { name: '冥想', stat: 'maxMp', value: 60 },
  { name: '智慧', stat: 'maxMp', value: 100 },
  { name: '永恒', stat: 'maxMp', value: 180 },
  { name: '灵巧', stat: 'dodge', value: 3 },
  { name: '疾风', stat: 'dodge', value: 6 },
  { name: '幻影', stat: 'dodge', value: 10 },
  { name: '虚无', stat: 'dodge', value: 15 },
  { name: '精准', stat: 'accuracy', value: 3 },
  { name: '鹰眼', stat: 'accuracy', value: 6 },
  { name: '致命', stat: 'accuracy', value: 10 },
  { name: '必中', stat: 'accuracy', value: 15 }
]

export const qualityAffixCount: Record<Quality, { min: number; max: number }> = {
  common: { min: 0, max: 1 },
  uncommon: { min: 1, max: 2 },
  rare: { min: 2, max: 3 },
  epic: { min: 3, max: 4 },
  legendary: { min: 4, max: 5 }
}

export const qualityMultiplier: Record<Quality, number> = {
  common: 0.6,
  uncommon: 0.8,
  rare: 1.0,
  epic: 1.3,
  legendary: 1.8
}

export const qualityColor: Record<Quality, string> = {
  common: '#999999',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000'
}

export const qualityNames: Record<Quality, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
}
