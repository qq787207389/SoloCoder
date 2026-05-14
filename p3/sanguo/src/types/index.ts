export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR'
export type Faction = 'wei' | 'shu' | 'wu' | 'qun'
export type Attribute = 'force' | 'intelligence' | 'command' | 'politics'

export interface Hero {
  id: string
  name: string
  rarity: Rarity
  faction: Faction
  level: number
  star: number
  maxStar: number
  baseStats: Stats
  growthStats: Stats
  skills: string[]
  fate: string[]
  talentPoints: number
  talents: string[]
  equipment: Equipment[]
}

export interface Stats {
  hp: number
  atk: number
  def: number
  spd: number
  critRate: number
  critDamage: number
}

export interface Skill {
  id: string
  name: string
  description: string
  type: 'active' | 'passive'
  cost: number
  cooldown: number
  target: 'single' | 'all' | 'self' | 'ally' | 'ally_all'
  damage?: number
  effects?: SkillEffect[]
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield'
  stat?: keyof Stats
  value?: number
  duration?: number
  chance?: number
}

export interface Buff {
  id: string
  name: string
  type: 'buff' | 'debuff'
  stat: keyof Stats
  value: number
  duration: number
  maxDuration: number
}

export interface Equipment {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'horse'
  rarity: Rarity
  stats: Partial<Stats>
}

export interface Fate {
  id: string
  name: string
  heroes: string[]
  effect: Partial<Stats>
}

export interface Formation {
  id: string
  name: string
  effect: Partial<Stats>
  positions: number[]
}

export interface BattleUnit {
  hero: Hero
  currentHp: number
  maxHp: number
  atb: number
  maxAtb: number
  buffs: Buff[]
  isPlayer: boolean
  position: number
}

export interface BattleLog {
  turn: number
  message: string
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'skill' | 'system'
}

export interface GachaPool {
  id: string
  name: string
  rates: { rarity: Rarity; rate: number }[]
  pityCount: number
  softPity: number
  hardPity: number
  featured?: string[]
}

export interface GachaHistory {
  timestamp: number
  results: { rarity: Rarity; heroId: string; isNew: boolean }[]
}

export interface PlayerData {
  gold: number
  jade: number
  exp: number
  level: number
  heroes: Hero[]
  formation: (string | null)[]
  inventory: Equipment[]
  gachaHistory: GachaHistory[]
  pityCounters: Record<string, number>
  activityProgress: Record<string, any>
}

export interface ActivityBoss {
  id: string
  name: string
  hp: number
  maxHp: number
  level: number
  rewards: { type: string; value: number }[]
}
