import { Item, Equipment } from '../types';

export const EQUIPMENT: Record<string, Equipment> = {
  copperSword: {
    id: 'copperSword',
    name: '铜剑',
    type: 'weapon',
    attack: 5,
    defense: 0,
    price: 50,
    description: '一把普通的铜制剑'
  },
  ironSword: {
    id: 'ironSword',
    name: '铁剑',
    type: 'weapon',
    attack: 10,
    defense: 0,
    price: 150,
    description: '坚固的铁制剑'
  },
  steelSword: {
    id: 'steelSword',
    name: '钢剑',
    type: 'weapon',
    attack: 18,
    defense: 0,
    price: 400,
    description: '锋利的钢制长剑'
  },
  heroSword: {
    id: 'heroSword',
    name: '勇者之剑',
    type: 'weapon',
    attack: 30,
    defense: 0,
    price: 1000,
    description: '传说中的勇者佩剑'
  },
  leatherArmor: {
    id: 'leatherArmor',
    name: '皮甲',
    type: 'armor',
    attack: 0,
    defense: 5,
    price: 40,
    description: '简单的皮革护甲'
  },
  chainMail: {
    id: 'chainMail',
    name: '锁子甲',
    type: 'armor',
    attack: 0,
    defense: 12,
    price: 180,
    description: '金属环编制的护甲'
  },
  plateArmor: {
    id: 'plateArmor',
    name: '板甲',
    type: 'armor',
    attack: 0,
    defense: 25,
    price: 500,
    description: '厚重的全身板甲'
  },
  heroArmor: {
    id: 'heroArmor',
    name: '勇者之甲',
    type: 'armor',
    attack: 0,
    defense: 40,
    price: 1200,
    description: '传说中的勇者护甲'
  }
};

export const ITEMS: Record<string, Item> = {
  herb: {
    id: 'herb',
    name: '药草',
    type: 'consumable',
    effect: { hp: 30 },
    price: 10,
    description: '恢复少量HP'
  },
  betterHerb: {
    id: 'betterHerb',
    name: '高级药草',
    type: 'consumable',
    effect: { hp: 80 },
    price: 50,
    description: '恢复大量HP'
  },
  magicWater: {
    id: 'magicWater',
    name: '魔法水',
    type: 'consumable',
    effect: { mp: 20 },
    price: 30,
    description: '恢复MP'
  },
  heroProof: {
    id: 'heroProof',
    name: '勇者之证',
    type: 'key',
    price: 0,
    description: '证明勇者身份的宝物'
  },
  copperSwordItem: {
    id: 'copperSwordItem',
    name: '铜剑',
    type: 'equipment',
    price: 50,
    description: '一把普通的铜制剑',
    equipmentId: 'copperSword'
  },
  leatherArmorItem: {
    id: 'leatherArmorItem',
    name: '皮甲',
    type: 'equipment',
    price: 40,
    description: '简单的皮革护甲',
    equipmentId: 'leatherArmor'
  }
};
