import { Skill } from '../types'

export const SKILLS: Record<string, Skill> = {
  's1001': {
    id: 's1001',
    name: '方天画戟',
    description: '对单个敌人造成300%攻击力的伤害，有50%几率使目标眩晕1回合',
    type: 'active',
    cost: 4,
    cooldown: 3,
    target: 'single',
    effects: [
      { type: 'damage', value: 3.0, chance: 1 },
      { type: 'debuff', stat: 'spd', value: -1, duration: 1, chance: 0.5 }
    ]
  },
  's2001': {
    id: 's2001',
    name: '天下无双',
    description: '被动：攻击力提升20%，每次攻击后恢复10%生命值',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'atk', value: 0.2, duration: -1 }
    ]
  },
  's1002': {
    id: 's1002',
    name: '青龙偃月',
    description: '对单个敌人造成280%攻击力的伤害，若目标生命值低于50%则伤害提升50%',
    type: 'active',
    cost: 3,
    cooldown: 2,
    target: 'single',
    effects: [
      { type: 'damage', value: 2.8, chance: 1 }
    ]
  },
  's2002': {
    id: 's2002',
    name: '武圣',
    description: '被动：暴击率提升15%，暴击伤害提升30%',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'critRate', value: 0.15, duration: -1 },
      { type: 'buff', stat: 'critDamage', value: 0.3, duration: -1 }
    ]
  },
  's1003': {
    id: 's1003',
    name: '咆哮',
    description: '对所有敌人造成180%攻击力的伤害，并降低敌人防御力20%持续2回合',
    type: 'active',
    cost: 4,
    cooldown: 3,
    target: 'all',
    effects: [
      { type: 'damage', value: 1.8, chance: 1 },
      { type: 'debuff', stat: 'def', value: -0.2, duration: 2, chance: 1 }
    ]
  },
  's2003': {
    id: 's2003',
    name: '燕人',
    description: '被动：生命值提升25%，受到伤害时有30%几率反击',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'hp', value: 0.25, duration: -1 }
    ]
  },
  's1004': {
    id: 's1004',
    name: '奸雄',
    description: '对所有敌人造成150%攻击力的伤害，并恢复自身造成伤害30%的生命值',
    type: 'active',
    cost: 3,
    cooldown: 2,
    target: 'all',
    effects: [
      { type: 'damage', value: 1.5, chance: 1 }
    ]
  },
  's2004': {
    id: 's2004',
    name: '枭雄',
    description: '被动：己方全体攻击力提升10%，魏国武将额外提升10%',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'ally_all',
    effects: [
      { type: 'buff', stat: 'atk', value: 0.1, duration: -1 }
    ]
  },
  's1005': {
    id: 's1005',
    name: '制衡',
    description: '恢复己方全体100%攻击力的生命值，并提升防御力20%持续2回合',
    type: 'active',
    cost: 3,
    cooldown: 2,
    target: 'ally_all',
    effects: [
      { type: 'heal', value: 1.0, chance: 1 },
      { type: 'buff', stat: 'def', value: 0.2, duration: 2, chance: 1 }
    ]
  },
  's2005': {
    id: 's2005',
    name: '守业',
    description: '被动：己方全体防御力提升15%，吴国武将额外提升10%',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'ally_all',
    effects: [
      { type: 'buff', stat: 'def', value: 0.15, duration: -1 }
    ]
  },
  's1006': {
    id: 's1006',
    name: '八卦阵',
    description: '对所有敌人造成250%攻击力的伤害，有60%几率使目标沉默2回合',
    type: 'active',
    cost: 5,
    cooldown: 4,
    target: 'all',
    effects: [
      { type: 'damage', value: 2.5, chance: 1 }
    ]
  },
  's2006': {
    id: 's2006',
    name: '卧龙',
    description: '被动：技能伤害提升30%，速度提升15%',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'spd', value: 0.15, duration: -1 }
    ]
  },
  's1007': {
    id: 's1007',
    name: '火烧赤壁',
    description: '对所有敌人造成220%攻击力的火焰伤害，灼烧效果持续3回合',
    type: 'active',
    cost: 4,
    cooldown: 3,
    target: 'all',
    effects: [
      { type: 'damage', value: 2.2, chance: 1 }
    ]
  },
  's2007': {
    id: 's2007',
    name: '英姿',
    description: '被动：暴击率提升20%，每次暴击后恢复5%生命值',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'critRate', value: 0.2, duration: -1 }
    ]
  },
  's1008': {
    id: 's1008',
    name: '龙胆',
    description: '对单个敌人造成320%攻击力的伤害，无视敌人30%防御力',
    type: 'active',
    cost: 3,
    cooldown: 2,
    target: 'single',
    effects: [
      { type: 'damage', value: 3.2, chance: 1 }
    ]
  },
  's2008': {
    id: 's2008',
    name: '常胜',
    description: '被动：速度提升20%，闪避率提升15%',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: [
      { type: 'buff', stat: 'spd', value: 0.2, duration: -1 }
    ]
  },
  's1009': {
    id: 's1009',
    name: '连环计',
    description: '对所有敌人造成160%攻击力的伤害，并降低敌人速度30%持续2回合',
    type: 'active',
    cost: 3,
    cooldown: 2,
    target: 'all',
    effects: [
      { type: 'damage', value: 1.6, chance: 1 },
      { type: 'debuff', stat: 'spd', value: -0.3, duration: 2, chance: 1 }
    ]
  },
  's2009': {
    id: 's2009',
    name: '闭月',
    description: '被动：男性敌人对其伤害降低20%，有40%几率魅惑攻击自己的男性敌人',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: []
  },
  's1010': {
    id: 's1010',
    name: '弓腰姬',
    description: '对单个敌人造成200%攻击力的伤害，有70%几率使目标中毒3回合',
    type: 'active',
    cost: 2,
    cooldown: 1,
    target: 'single',
    effects: [
      { type: 'damage', value: 2.0, chance: 1 }
    ]
  },
  's2010': {
    id: 's2010',
    name: '枭姬',
    description: '被动：普通攻击有50%几率攻击两次',
    type: 'passive',
    cost: 0,
    cooldown: 0,
    target: 'self',
    effects: []
  }
}
