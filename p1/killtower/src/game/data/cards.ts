import type { Card } from '../types';

export const CARDS: Card[] = [
  {
    id: 'strike',
    name: '打击',
    type: 'attack',
    cost: 1,
    rarity: 'basic',
    description: '造成 6 点伤害。',
    upgradedDescription: '造成 9 点伤害。',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
    target: 'single'
  },
  {
    id: 'defend',
    name: '防御',
    type: 'skill',
    cost: 1,
    rarity: 'basic',
    description: '获得 5 点格挡。',
    upgradedDescription: '获得 8 点格挡。',
    effects: [{ type: 'block', value: 5, target: 'self' }],
    target: 'self'
  },
  {
    id: 'bash',
    name: '痛击',
    type: 'attack',
    cost: 2,
    rarity: 'basic',
    description: '造成 8 点伤害，给予 2 层易伤。',
    upgradedDescription: '造成 10 点伤害，给予 3 层易伤。',
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'applyStatus', value: 2, statusType: 'vulnerable', target: 'enemy' }
    ],
    target: 'single'
  },
  {
    id: 'zap',
    name: '电击',
    type: 'attack',
    cost: 1,
    rarity: 'basic',
    description: '造成 5 点伤害。',
    upgradedDescription: '造成 8 点伤害。',
    effects: [{ type: 'damage', value: 5, target: 'enemy' }],
    target: 'single',
    classes: ['mage']
  },
  {
    id: 'arcaneBlast',
    name: '奥术冲击',
    type: 'attack',
    cost: 2,
    rarity: 'basic',
    description: '造成 12 点伤害。',
    upgradedDescription: '造成 16 点伤害。',
    effects: [{ type: 'damage', value: 12, target: 'enemy' }],
    target: 'single',
    classes: ['mage']
  },
  {
    id: 'arcaneArmor',
    name: '奥术护甲',
    type: 'skill',
    cost: 1,
    rarity: 'basic',
    description: '获得 6 点格挡。',
    upgradedDescription: '获得 9 点格挡。',
    effects: [{ type: 'block', value: 6, target: 'self' }],
    target: 'self',
    classes: ['mage']
  },
  {
    id: 'poisonBlade',
    name: '淬毒之刃',
    type: 'attack',
    cost: 1,
    rarity: 'basic',
    description: '造成 4 点伤害，给予 2 层中毒。',
    upgradedDescription: '造成 6 点伤害，给予 3 层中毒。',
    effects: [
      { type: 'damage', value: 4, target: 'enemy' },
      { type: 'applyStatus', value: 2, statusType: 'poison', target: 'enemy' }
    ],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'backstab',
    name: '背刺',
    type: 'attack',
    cost: 0,
    rarity: 'basic',
    description: '造成 6 点伤害。',
    upgradedDescription: '造成 9 点伤害。',
    effects: [{ type: 'damage', value: 6, target: 'enemy' }],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'cleave',
    name: '横扫',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '对所有敌人造成 8 点伤害。',
    upgradedDescription: '对所有敌人造成 11 点伤害。',
    effects: [{ type: 'damage', value: 8, target: 'allEnemies' }],
    target: 'allEnemies',
    classes: ['warrior']
  },
  {
    id: 'ironWave',
    name: '铁壁波',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '获得 5 点格挡，造成 5 点伤害。',
    upgradedDescription: '获得 7 点格挡，造成 7 点伤害。',
    effects: [
      { type: 'block', value: 5, target: 'self' },
      { type: 'damage', value: 5, target: 'enemy' }
    ],
    target: 'single',
    classes: ['warrior']
  },
  {
    id: 'pommelStrike',
    name: '剑柄打击',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '造成 9 点伤害，抽 1 张牌。',
    upgradedDescription: '造成 10 点伤害，抽 2 张牌。',
    effects: [
      { type: 'damage', value: 9, target: 'enemy' },
      { type: 'draw', value: 1, target: 'self' }
    ],
    target: 'single',
    classes: ['warrior']
  },
  {
    id: 'shrugItOff',
    name: ' shrug it off',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    description: '获得 8 点格挡，抽 1 张牌。',
    upgradedDescription: '获得 11 点格挡，抽 1 张牌。',
    effects: [
      { type: 'block', value: 8, target: 'self' },
      { type: 'draw', value: 1, target: 'self' }
    ],
    target: 'self',
    classes: ['warrior']
  },
  {
    id: 'armaments',
    name: '武装',
    type: 'skill',
    cost: 1,
    rarity: 'common',
    description: '获得 5 点格挡。本场战斗中所有牌消耗 -1。',
    upgradedDescription: '获得 5 点格挡。升级手中一张牌。',
    effects: [{ type: 'block', value: 5, target: 'self' }],
    target: 'self',
    classes: ['warrior']
  },
  {
    id: 'flex',
    name: '肌肉强化',
    type: 'skill',
    cost: 0,
    rarity: 'common',
    description: '获得 2 点力量，回合结束时失去 2 点力量。',
    upgradedDescription: '获得 4 点力量，回合结束时失去 4 点力量。',
    effects: [{ type: 'strength', value: 2, target: 'self' }],
    target: 'self',
    classes: ['warrior']
  },
  {
    id: 'twinStrike',
    name: '双重打击',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '造成 5 点伤害两次。',
    upgradedDescription: '造成 7 点伤害两次。',
    effects: [
      { type: 'damage', value: 5, target: 'enemy' },
      { type: 'damage', value: 5, target: 'enemy' }
    ],
    target: 'single',
    classes: ['warrior', 'rogue']
  },
  {
    id: 'flameBarrier',
    name: '烈焰屏障',
    type: 'power',
    cost: 2,
    rarity: 'uncommon',
    description: '每当你受到攻击伤害时，反弹 4 点伤害。',
    upgradedDescription: '每当你受到攻击伤害时，反弹 6 点伤害。',
    effects: [{ type: 'applyStatus', value: 4, statusType: 'thorns', target: 'self' }],
    target: 'none',
    classes: ['warrior']
  },
  {
    id: 'inflame',
    name: '燃烧',
    type: 'power',
    cost: 1,
    rarity: 'uncommon',
    description: '获得 2 点力量。',
    upgradedDescription: '获得 3 点力量。',
    effects: [{ type: 'strength', value: 2, target: 'self' }],
    target: 'none',
    classes: ['warrior']
  },
  {
    id: 'fireball',
    name: '火球术',
    type: 'attack',
    cost: 2,
    rarity: 'common',
    description: '造成 16 点伤害。',
    upgradedDescription: '造成 20 点伤害。',
    effects: [{ type: 'damage', value: 16, target: 'enemy' }],
    target: 'single',
    classes: ['mage']
  },
  {
    id: 'coldSnap',
    name: '寒流',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '造成 8 点伤害，给予 1 层虚弱。',
    upgradedDescription: '造成 10 点伤害，给予 2 层虚弱。',
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'applyStatus', value: 1, statusType: 'weak', target: 'enemy' }
    ],
    target: 'single',
    classes: ['mage']
  },
  {
    id: 'defragment',
    name: '碎片整理',
    type: 'power',
    cost: 1,
    rarity: 'uncommon',
    description: '获得 1 点敏捷。',
    upgradedDescription: '获得 2 点敏捷。',
    effects: [{ type: 'dexterity', value: 1, target: 'self' }],
    target: 'none',
    classes: ['mage']
  },
  {
    id: 'sneakyStrike',
    name: '潜行打击',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '造成 7 点伤害。如果这是你本回合打出的第一张攻击牌，抽 1 张牌。',
    upgradedDescription: '造成 9 点伤害。如果这是你本回合打出的第一张攻击牌，抽 1 张牌。',
    effects: [{ type: 'damage', value: 7, target: 'enemy' }],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'catalyst',
    name: '催化剂',
    type: 'skill',
    cost: 1,
    rarity: 'uncommon',
    description: '目标敌人的中毒层数翻倍。',
    upgradedDescription: '目标敌人的中毒层数翻三倍。',
    effects: [],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'neutralize',
    name: '压制',
    type: 'attack',
    cost: 0,
    rarity: 'common',
    description: '造成 5 点伤害，给予 2 层虚弱。',
    upgradedDescription: '造成 7 点伤害，给予 3 层虚弱。',
    effects: [
      { type: 'damage', value: 5, target: 'enemy' },
      { type: 'applyStatus', value: 2, statusType: 'weak', target: 'enemy' }
    ],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'dash',
    name: '疾冲',
    type: 'attack',
    cost: 1,
    rarity: 'common',
    description: '获得 5 点格挡，造成 5 点伤害。',
    upgradedDescription: '获得 7 点格挡，造成 7 点伤害。',
    effects: [
      { type: 'block', value: 5, target: 'self' },
      { type: 'damage', value: 5, target: 'enemy' }
    ],
    target: 'single',
    classes: ['rogue']
  },
  {
    id: 'heal',
    name: '治疗术',
    type: 'skill',
    cost: 1,
    rarity: 'uncommon',
    description: '恢复 10 点生命值。',
    upgradedDescription: '恢复 15 点生命值。',
    effects: [{ type: 'heal', value: 10, target: 'self' }],
    target: 'self'
  },
  {
    id: 'adrenaline',
    name: '肾上腺素',
    type: 'skill',
    cost: 0,
    rarity: 'uncommon',
    description: '获得 1 点能量，抽 2 张牌。',
    upgradedDescription: '获得 2 点能量，抽 2 张牌。',
    effects: [
      { type: 'energy', value: 1, target: 'self' },
      { type: 'draw', value: 2, target: 'self' }
    ],
    target: 'self',
    exhausts: true
  }
];

export function getCard(id: string): Card | undefined {
  return CARDS.find(c => c.id === id);
}

export function getCardsByClass(classId: string): Card[] {
  return CARDS.filter(c => !c.classes || c.classes.includes(classId as any));
}

export function getCardsByRarity(rarity: string): Card[] {
  return CARDS.filter(c => c.rarity === rarity);
}

export function createCardInstance(cardId: string, isUpgraded = false): Card | null {
  const template = getCard(cardId);
  if (!template) return null;
  
  return {
    ...template,
    isUpgraded,
    id: `${cardId}_${Math.random().toString(36).substring(2, 9)}`
  };
}
