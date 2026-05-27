import type { Backpack, SpecialSlot } from './types';

const warriorSlot: SpecialSlot = {
  id: 'warrior-weapon-rack',
  type: 'weapon',
  x: 0,
  y: 0,
  width: 4,
  height: 1,
  effect: '武器架：放在此区域的武器攻击+3',
  label: '武器架',
};

const alchemistSlot: SpecialSlot = {
  id: 'alchemist-stabilizer',
  type: 'potion',
  x: 0,
  y: 0,
  width: 2,
  height: 2,
  effect: '药剂稳定槽：药水不会变质，效果+50%',
  label: '药剂槽',
};

const rogueSlot: SpecialSlot = {
  id: 'rogue-quick',
  type: 'quick-access',
  x: 0,
  y: 0,
  width: 3,
  height: 1,
  effect: '快速取物：所有物品战斗中都可快速取用',
  label: '快速槽',
};

const mageSlot: SpecialSlot = {
  id: 'mage-arcane',
  type: 'quick-access',
  x: 0,
  y: 0,
  width: 2,
  height: 2,
  effect: '奥术焦点：宝石和卷轴效果翻倍',
  label: '奥术槽',
};

export const BACKPACKS: Backpack[] = [
  {
    id: 'warrior',
    name: '战士背包',
    description: '重装战士的标准装备，有武器架加成，初始生命值高。',
    width: 8,
    height: 6,
    specialSlots: [warriorSlot],
    baseStats: { hp: 120, stamina: 80, attack: 10, defense: 8 },
    specialAbility: '坚毅：受到伤害减少10%',
    color: '#8b0000',
    bgPattern: 'leather',
  },
  {
    id: 'alchemist',
    name: '药师背包',
    description: '药剂师的专用背包，药剂槽稳定药水，初始法力较高。',
    width: 7,
    height: 7,
    specialSlots: [alchemistSlot],
    baseStats: { hp: 80, stamina: 100, attack: 6, defense: 4 },
    specialAbility: '炼金精通：药水效果+50%',
    color: '#2d5016',
    bgPattern: 'herbs',
  },
  {
    id: 'rogue',
    name: '盗贼背包',
    description: '小巧轻便，虽然空间小但所有物品都能快速取用。',
    width: 6,
    height: 6,
    specialSlots: [rogueSlot],
    baseStats: { hp: 70, stamina: 120, attack: 12, defense: 3 },
    specialAbility: '敏捷：所有物品战斗中可快速取用',
    color: '#1a1a2e',
    bgPattern: 'shadow',
  },
  {
    id: 'mage',
    name: '法师背包',
    description: '奥术师的背包，有奥术焦点增强魔法物品效果。',
    width: 7,
    height: 6,
    specialSlots: [mageSlot],
    baseStats: { hp: 75, stamina: 90, attack: 14, defense: 3 },
    specialAbility: '奥术：宝石和卷轴效果翻倍',
    color: '#4a148c',
    bgPattern: 'runes',
  },
];

export function getBackpackById(id: string): Backpack | undefined {
  return BACKPACKS.find((b) => b.id === id);
}
