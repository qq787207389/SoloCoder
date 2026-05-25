import type { CharacterClass, SkillType, TileType, Weapon } from '@/types'

export const TILE_SIZE = 64
export const ISO_TILE_WIDTH = 128
export const ISO_TILE_HEIGHT = 64
export const TILE_HEIGHT = 32

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 20

export const COLORS: Record<string, number> = {
  ground: 0x8B7355,
  wall: 0x4A4A4A,
  half_cover: 0x6B6B6B,
  full_cover: 0x3A3A3A,
  high_ground: 0xA0522D,
  rubble: 0x5C4033,
  water: 0x4169E1,
  door: 0x8B4513,
  window: 0x87CEEB,
  player: 0x4169E1,
  enemy: 0xDC143C,
  moveRange: 0x32CD32,
  attackRange: 0xFF6347,
  selected: 0xFFD700,
  smoke: 0x808080,
}

export const BASE_STATS: Record<CharacterClass, { maxHp: number; moveRange: number; aim: number; defense: number; will: number; dodge: number; armor: number }> = {
  assault: {
    maxHp: 100,
    moveRange: 6,
    aim: 70,
    defense: 30,
    will: 50,
    dodge: 15,
    armor: 0,
  },
  sniper: {
    maxHp: 70,
    moveRange: 4,
    aim: 90,
    defense: 20,
    will: 60,
    dodge: 10,
    armor: 0,
  },
  medic: {
    maxHp: 80,
    moveRange: 5,
    aim: 65,
    defense: 25,
    will: 80,
    dodge: 12,
    armor: 0,
  },
  engineer: {
    maxHp: 90,
    moveRange: 5,
    aim: 60,
    defense: 35,
    will: 55,
    dodge: 10,
    armor: 1,
  },
}

export const CLASS_SKILLS: Record<CharacterClass, SkillType[]> = {
  assault: ['move', 'shoot', 'dash', 'frag_grenade', 'overwatch'],
  sniper: ['move', 'shoot', 'precision_shot', 'smoke_grenade', 'overwatch'],
  medic: ['move', 'shoot', 'heal', 'revive', 'smoke_grenade', 'overwatch'],
  engineer: ['move', 'shoot', 'place_mine', 'repair_cover', 'frag_grenade', 'overwatch'],
}

export const SKILL_DEFINITIONS: Record<SkillType, { name: string; description: string; apCost: number; cooldown: number; range: number; icon: string }> = {
  move: {
    name: '移动',
    description: '移动到指定位置',
    apCost: 1,
    cooldown: 0,
    range: 0,
    icon: '👟',
  },
  shoot: {
    name: '射击',
    description: '使用当前武器攻击目标',
    apCost: 1,
    cooldown: 0,
    range: 0,
    icon: '🔫',
  },
  overwatch: {
    name: '警戒',
    description: '结束回合，敌人移动时自动射击',
    apCost: 1,
    cooldown: 0,
    range: 0,
    icon: '👁️',
  },
  dash: {
    name: '冲锋',
    description: '移动后可以射击',
    apCost: 2,
    cooldown: 3,
    range: 0,
    icon: '💨',
  },
  precision_shot: {
    name: '精准射击',
    description: '命中率和暴击率大幅提升',
    apCost: 2,
    cooldown: 3,
    range: 0,
    icon: '🎯',
  },
  heal: {
    name: '治疗',
    description: '恢复目标生命值',
    apCost: 1,
    cooldown: 2,
    range: 4,
    icon: '💚',
  },
  revive: {
    name: '复活',
    description: '复活倒地的队友',
    apCost: 2,
    cooldown: 5,
    range: 2,
    icon: '❤️‍🔥',
  },
  place_mine: {
    name: '埋设地雷',
    description: '在当前位置放置地雷',
    apCost: 1,
    cooldown: 3,
    range: 1,
    icon: '💣',
  },
  repair_cover: {
    name: '修复掩体',
    description: '修复损坏的掩体',
    apCost: 1,
    cooldown: 2,
    range: 2,
    icon: '🔧',
  },
  smoke_grenade: {
    name: '烟雾弹',
    description: '制造烟雾遮蔽视野',
    apCost: 1,
    cooldown: 4,
    range: 6,
    icon: '💨',
  },
  frag_grenade: {
    name: '手雷',
    description: '投掷手雷造成范围伤害，可破坏掩体',
    apCost: 1,
    cooldown: 3,
    range: 6,
    icon: '💥',
  },
}

export const WEAPON_TEMPLATES: Record<string, Omit<Weapon, 'id'>> = {
  assault_rifle: {
    name: '突击步枪',
    damage: 25,
    accuracy: 75,
    range: 8,
    minRange: 1,
    ammo: 30,
    maxAmmo: 30,
    armorPiercing: 0,
    critChance: 10,
    critMultiplier: 1.5,
    canUseAfterMove: true,
  },
  sniper_rifle: {
    name: '狙击步枪',
    damage: 60,
    accuracy: 95,
    range: 15,
    minRange: 4,
    ammo: 5,
    maxAmmo: 5,
    armorPiercing: 2,
    critChance: 30,
    critMultiplier: 2,
    canUseAfterMove: false,
  },
  shotgun: {
    name: '霰弹枪',
    damage: 40,
    accuracy: 60,
    range: 3,
    minRange: 1,
    ammo: 8,
    maxAmmo: 8,
    armorPiercing: 1,
    critChance: 15,
    critMultiplier: 1.8,
    canUseAfterMove: true,
  },
  smg: {
    name: '冲锋枪',
    damage: 18,
    accuracy: 65,
    range: 6,
    minRange: 1,
    ammo: 50,
    maxAmmo: 50,
    armorPiercing: 0,
    critChance: 8,
    critMultiplier: 1.3,
    canUseAfterMove: true,
  },
  pistol: {
    name: '手枪',
    damage: 15,
    accuracy: 70,
    range: 5,
    minRange: 1,
    ammo: 12,
    maxAmmo: 12,
    armorPiercing: 0,
    critChance: 12,
    critMultiplier: 1.5,
    canUseAfterMove: true,
  },
}

export const TILE_PROPERTIES: Record<TileType, { walkable: boolean; blocksMovement: boolean; blocksLOS: boolean; coverLevel: 'none' | 'half' | 'full'; destructible: boolean; hp: number }> = {
  ground: { walkable: true, blocksMovement: false, blocksLOS: false, coverLevel: 'none', destructible: false, hp: 0 },
  wall: { walkable: false, blocksMovement: true, blocksLOS: true, coverLevel: 'full', destructible: true, hp: 100 },
  half_cover: { walkable: true, blocksMovement: false, blocksLOS: false, coverLevel: 'half', destructible: true, hp: 50 },
  full_cover: { walkable: true, blocksMovement: false, blocksLOS: false, coverLevel: 'full', destructible: true, hp: 80 },
  high_ground: { walkable: true, blocksMovement: false, blocksLOS: false, coverLevel: 'none', destructible: false, hp: 0 },
  rubble: { walkable: true, blocksMovement: false, blocksLOS: false, coverLevel: 'half', destructible: false, hp: 0 },
  water: { walkable: false, blocksMovement: true, blocksLOS: false, coverLevel: 'none', destructible: false, hp: 0 },
  door: { walkable: true, blocksMovement: false, blocksLOS: true, coverLevel: 'half', destructible: true, hp: 60 },
  window: { walkable: false, blocksMovement: false, blocksLOS: false, coverLevel: 'half', destructible: true, hp: 30 },
}

export const COVER_BONUSES = {
  half: { defense: 20, dodge: 15 },
  full: { defense: 40, dodge: 30 },
  high_ground: { aim: 10, defense: 5 },
  flanked: { defense: -40, dodge: -20 },
}

export const EXP_PER_LEVEL = 100
export const EXP_PER_KILL = 50
export const EXP_PER_DAMAGE = 1
export const LEVEL_UP_STAT_POINTS = 2
