import { CharacterClass, BaseStats, Skill } from '../types'

export const classBaseStats: Record<CharacterClass, BaseStats> = {
  warrior: {
    hp: 500,
    maxHp: 500,
    mp: 100,
    maxMp: 100,
    attack: 50,
    defense: 30,
    magicAttack: 5,
    magicDefense: 15,
    accuracy: 20,
    dodge: 10,
    speed: 1.2
  },
  mage: {
    hp: 250,
    maxHp: 250,
    mp: 400,
    maxMp: 400,
    attack: 10,
    defense: 10,
    magicAttack: 60,
    magicDefense: 40,
    accuracy: 25,
    dodge: 15,
    speed: 1.0
  },
  taoist: {
    hp: 350,
    maxHp: 350,
    mp: 250,
    maxMp: 250,
    attack: 30,
    defense: 20,
    magicAttack: 35,
    magicDefense: 30,
    accuracy: 22,
    dodge: 12,
    speed: 1.1
  }
}

export const classSkills: Record<CharacterClass, Omit<Skill, 'currentCooldown'>[]> = {
  warrior: [
    { id: 'basic_attack', name: '普通攻击', damage: 1.0, cooldown: 1000, castTime: 0, range: 1, mpCost: 0 },
    { id: 'stabbing', name: '刺杀剑术', damage: 1.8, cooldown: 2000, castTime: 300, range: 2, mpCost: 10 },
    { id: 'slash', name: '半月弯刀', damage: 1.5, cooldown: 3000, castTime: 500, range: 2, mpCost: 15 },
    { id: 'fire_sword', name: '烈火剑法', damage: 3.0, cooldown: 8000, castTime: 800, range: 1, mpCost: 30 }
  ],
  mage: [
    { id: 'basic_attack', name: '普通攻击', damage: 0.5, cooldown: 1000, castTime: 0, range: 3, mpCost: 0 },
    { id: 'fireball', name: '火球术', damage: 1.5, cooldown: 1500, castTime: 200, range: 5, mpCost: 8 },
    { id: 'ice_storm', name: '冰咆哮', damage: 2.5, cooldown: 4000, castTime: 600, range: 6, mpCost: 25 },
    { id: 'thunder', name: '雷电术', damage: 3.5, cooldown: 6000, castTime: 500, range: 7, mpCost: 40 }
  ],
  taoist: [
    { id: 'basic_attack', name: '普通攻击', damage: 0.8, cooldown: 1000, castTime: 0, range: 2, mpCost: 0 },
    { id: 'summon_skeleton', name: '召唤骷髅', damage: 2.0, cooldown: 10000, castTime: 1000, range: 3, mpCost: 50 },
    { id: 'poison', name: '施毒术', damage: 0.5, cooldown: 3000, castTime: 400, range: 4, mpCost: 15 },
    { id: 'heal', name: '治愈术', damage: -2.0, cooldown: 2000, castTime: 300, range: 3, mpCost: 20 }
  ]
}

export const classNameMap: Record<CharacterClass, string> = {
  warrior: '战士',
  mage: '法师',
  taoist: '道士'
}
