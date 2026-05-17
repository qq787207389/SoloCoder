import { Spell } from '../types';

export const SPELLS: Record<string, Spell> = {
  fireball: {
    id: 'fireball',
    name: '小火球',
    mpCost: 5,
    damage: 15,
    description: '发射一颗火球造成伤害'
  },
  heal: {
    id: 'heal',
    name: '回复术',
    mpCost: 8,
    heal: 40,
    description: '恢复自身生命值'
  },
  iceBlast: {
    id: 'iceBlast',
    name: '冰霜冲击',
    mpCost: 10,
    damage: 25,
    description: '释放寒冰魔法造成大量伤害'
  }
};
