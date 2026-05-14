export type CharacterClass = 'warrior' | 'mage' | 'taoist'

export type Quality = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'necklace' | 'ring' | 'bracelet' | 'shoes' | 'consumable'

export type PKStatus = 'white' | 'gray' | 'red'

export type GuildRank = 'leader' | 'deputy' | 'elite' | 'member'

export interface Position {
  x: number
  y: number
}

export interface Skill {
  id: string
  name: string
  damage: number
  cooldown: number
  currentCooldown: number
  castTime: number
  range: number
  mpCost: number
}

export interface BaseStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  magicAttack: number
  magicDefense: number
  accuracy: number
  dodge: number
  speed: number
}

export interface Affix {
  id: string
  name: string
  stat: keyof BaseStats
  value: number
}

export interface Equipment {
  id: string
  name: string
  type: ItemType
  quality: Quality
  level: number
  baseStats: Partial<BaseStats>
  affixes: Affix[]
  enhanceLevel: number
  setId?: string
  luck: number
  curse: number
}

export interface InventoryItem {
  item: Equipment
  count: number
  slot: number
}

export interface Character {
  id: string
  name: string
  class: CharacterClass
  level: number
  exp: number
  position: Position
  stats: BaseStats
  skills: Skill[]
  equipment: Record<string, Equipment | null>
  inventory: InventoryItem[]
  gold: number
  pkValue: number
  pkStatus: PKStatus
  luckyValue: number
  isCasting: boolean
  castProgress: number
  currentSkill: Skill | null
  targetId: string | null
}

export interface Monster {
  id: string
  name: string
  level: number
  position: Position
  stats: BaseStats
  skills: Skill[]
  isBoss: boolean
  aiState: 'idle' | 'chase' | 'attack' | 'dead'
  targetId: string | null
  attackCooldown: number
  dropTable: string
}

export interface GuildMember {
  characterId: string
  name: string
  rank: GuildRank
  joinTime: number
}

export interface Guild {
  id: string
  name: string
  leaderId: string
  members: GuildMember[]
  warehouse: InventoryItem[]
  gold: number
  createdAt: number
}

export interface MapCell {
  x: number
  y: number
  walkable: boolean
  terrain: string
}

export interface GameState {
  player: Character
  monsters: Monster[]
  otherPlayers: Character[]
  guilds: Guild[]
  currentMap: string
  mapData: MapCell[][]
  droppedItems: { id: string; item: Equipment; position: Position }[]
  announcements: { id: number; message: string; time: number }[]
  gameTime: number
  sabakState: {
    isWar: boolean
    startTime: number
    occupyingGuildId: string | null
  }
}

export interface EnhanceConfig {
  successRate: number
  degradeRate: number
  breakRate: number
  protectItem: boolean
}
