import type { Relic } from '../types';

export const RELICS: Relic[] = [
  {
    id: 'burningBlood',
    name: '燃烧之血',
    rarity: 'starter',
    description: '每场战斗结束后恢复 6 点生命值。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'heal', value: 0 }
    }
  },
  {
    id: 'crystalOrb',
    name: '水晶球',
    rarity: 'starter',
    description: '每场战斗开始时获得 1 点能量。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'energy', value: 1 }
    }
  },
  {
    id: 'leatherBoots',
    name: '皮靴',
    rarity: 'starter',
    description: '每场战斗开始时获得 2 点敏捷。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'dexterity', value: 2 }
    }
  },
  {
    id: 'anchor',
    name: '船锚',
    rarity: 'common',
    description: '每场战斗开始时获得 10 点格挡。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'block', value: 10 }
    }
  },
  {
    id: 'lantern',
    name: '灯笼',
    rarity: 'common',
    description: '每场战斗的第一回合获得 1 点额外能量。',
    effect: {
      trigger: 'onTurnStart',
      action: { type: 'energy', value: 1 }
    }
  },
  {
    id: 'vajra',
    name: '金刚杵',
    rarity: 'common',
    description: '获得 1 点力量。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'strength', value: 1 }
    }
  },
  {
    id: 'pear',
    name: '梨',
    rarity: 'common',
    description: '增加 10 点最大生命值。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'heal', value: 0 }
    }
  },
  {
    id: 'bagOfMarbles',
    name: '弹珠袋',
    rarity: 'common',
    description: '战斗开始时，给予所有敌人 1 层易伤。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'damage', value: 0 }
    }
  },
  {
    id: 'redSkull',
    name: '红骷髅',
    rarity: 'common',
    description: '当生命值低于 50% 时，获得 3 点力量。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'strength', value: 0 }
    }
  },
  {
    id: 'meatOnBone',
    name: '带肉的骨头',
    rarity: 'common',
    description: '当生命值低于 50% 时，战斗结束后恢复 12 点生命值。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'heal', value: 0 }
    }
  },
  {
    id: 'penNib',
    name: '钢笔尖',
    rarity: 'uncommon',
    description: '每打出 10 张攻击牌，下一张攻击牌伤害翻倍。',
    effect: {
      trigger: 'onCardPlayed',
      action: { type: 'damage', value: 0 }
    },
    counters: 0
  },
  {
    id: 'shuriken',
    name: '手里剑',
    rarity: 'uncommon',
    description: '每打出 3 张攻击牌，获得 1 点力量。',
    effect: {
      trigger: 'onCardPlayed',
      action: { type: 'strength', value: 1 }
    },
    counters: 0
  },
  {
    id: 'kunai',
    name: '苦无',
    rarity: 'uncommon',
    description: '每打出 3 张攻击牌，获得 1 点敏捷。',
    effect: {
      trigger: 'onCardPlayed',
      action: { type: 'dexterity', value: 1 }
    },
    counters: 0
  },
  {
    id: 'ornamentalFan',
    name: '装饰扇',
    rarity: 'uncommon',
    description: '每打出 3 张攻击牌，获得 4 点格挡。',
    effect: {
      trigger: 'onCardPlayed',
      action: { type: 'block', value: 4 }
    },
    counters: 0
  },
  {
    id: 'paperKrane',
    name: '纸鹤',
    rarity: 'uncommon',
    description: '虚弱状态下受到的伤害减少 40%。',
    effect: {
      trigger: 'onDamageTaken',
      action: { type: 'block', value: 0 }
    }
  },
  {
    id: 'iceCream',
    name: '冰淇淋',
    rarity: 'rare',
    description: '回合结束时不再失去能量。',
    effect: {
      trigger: 'onTurnEnd',
      action: { type: 'energy', value: 0 }
    }
  },
  {
    id: 'deadBranch',
    name: '枯枝',
    rarity: 'rare',
    description: '每当你消耗一张牌时，将一张随机牌加入手牌。',
    effect: {
      trigger: 'onExhaust',
      action: { type: 'draw', value: 1 }
    }
  },
  {
    id: 'runicPyramid',
    name: '符文金字塔',
    rarity: 'rare',
    description: '回合结束时不再弃牌。',
    effect: {
      trigger: 'onTurnEnd',
      action: { type: 'draw', value: 0 }
    }
  },
  {
    id: 'sneckoEye',
    name: '蛇眼',
    rarity: 'boss',
    description: '每回合开始时多抽 2 张牌。所有牌的消耗随机变为 0-3。',
    effect: {
      trigger: 'onTurnStart',
      action: { type: 'draw', value: 2 }
    }
  },
  {
    id: 'blackStar',
    name: '黑星',
    rarity: 'boss',
    description: '精英战获得 2 个遗物奖励。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'heal', value: 0 }
    }
  },
  {
    id: 'cursedKey',
    name: '诅咒钥匙',
    rarity: 'boss',
    description: '获得 1 点额外能量。每次开启宝箱时，获得一张诅咒牌。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'energy', value: 1 }
    }
  },
  {
    id: 'ectoplasm',
    name: '灵质',
    rarity: 'boss',
    description: '获得 1 点额外能量。不再获得任何金币。',
    effect: {
      trigger: 'onBattleStart',
      action: { type: 'energy', value: 1 }
    }
  }
];

export function getRelic(id: string): Relic | undefined {
  return RELICS.find(r => r.id === id);
}

export function getRelicsByRarity(rarity: string): Relic[] {
  return RELICS.filter(r => r.rarity === rarity);
}

export function getRandomRelic(rarity?: string): Relic {
  let relics = RELICS;
  if (rarity) {
    relics = relics.filter(r => r.rarity === rarity);
  }
  return relics[Math.floor(Math.random() * relics.length)];
}

export function createRelicInstance(relicId: string): Relic | null {
  const template = getRelic(relicId);
  if (!template) return null;
  
  return { ...template };
}
