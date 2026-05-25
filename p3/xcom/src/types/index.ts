export type Team = 'player' | 'enemy'

export type TileType = 
  | 'ground' 
  | 'wall' 
  | 'half_cover' 
  | 'full_cover' 
  | 'high_ground' 
  | 'rubble' 
  | 'water'
  | 'door'
  | 'window'

export type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest'

export type CharacterClass = 'assault' | 'sniper' | 'medic' | 'engineer'

export type SkillType = 
  | 'move' 
  | 'shoot' 
  | 'overwatch'
  | 'dash'
  | 'precision_shot'
  | 'heal'
  | 'revive'
  | 'place_mine'
  | 'repair_cover'
  | 'smoke_grenade'
  | 'frag_grenade'

export type GamePhase = 
  | 'menu'
  | 'level_select'
  | 'player_turn'
  | 'enemy_turn'
  | 'animation'
  | 'game_over'
  | 'victory'

export type TurnPhase = 
  | 'select_unit'
  | 'select_action'
  | 'select_target'
  | 'execute_action'
  | 'waiting'

export interface Position {
  x: number
  y: number
}

export interface IsometricPosition {
  x: number
  y: number
  z: number
}

export interface Tile {
  id: string
  type: TileType
  position: Position
  height: number
  coverDirection?: Direction
  destructible: boolean
  hp: number
  maxHp: number
}

export interface Weapon {
  id: string
  name: string
  damage: number
  accuracy: number
  range: number
  minRange: number
  ammo: number
  maxAmmo: number
  armorPiercing: number
  critChance: number
  critMultiplier: number
  canUseAfterMove: boolean
}

export interface Skill {
  id: SkillType
  name: string
  description: string
  apCost: number
  cooldown: number
  currentCooldown: number
  range: number
  icon: string
}

export interface CharacterStats {
  maxHp: number
  hp: number
  moveRange: number
  aim: number
  defense: number
  will: number
  dodge: number
  armor: number
}

export interface Character {
  id: string
  name: string
  team: Team
  class: CharacterClass
  position: Position
  facing: Direction
  stats: CharacterStats
  weapons: Weapon[]
  currentWeaponIndex: number
  skills: Skill[]
  ap: number
  maxAp: number
  level: number
  exp: number
  expToNext: number
  isOverwatch: boolean
  isSuppressed: boolean
  suppressionTurns: number
  statusEffects: StatusEffect[]
  inventory: Item[]
}

export interface StatusEffect {
  id: string
  name: string
  type: 'buff' | 'debuff'
  duration: number
  statModifiers: Partial<CharacterStats>
}

export interface Item {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'consumable' | 'accessory'
  icon: string
  description: string
}

export interface SmokeCloud {
  id: string
  position: Position
  radius: number
  turnsRemaining: number
}

export interface Mine {
  id: string
  position: Position
  team: Team
  damage: number
  radius: number
}

export interface LevelData {
  id: string
  name: string
  description: string
  width: number
  height: number
  tiles: Tile[]
  playerStartPositions: Position[]
  enemySpawns: Position[]
  enemyTypes: CharacterClass[]
  objective: string
}

export interface AttackResult {
  hit: boolean
  crit: boolean
  damage: number
  coverBonus: number
  flanked: boolean
  targetId: string
}

export interface ActionLog {
  id: string
  timestamp: number
  message: string
  type: 'info' | 'damage' | 'heal' | 'move' | 'kill'
}

export interface RaycastResult {
  hit: boolean
  tiles: Tile[]
  distance: number
  coverLevel: 'none' | 'half' | 'full'
  flanked: boolean
}

export interface AIAction {
  type: 'move' | 'attack' | 'skill' | 'overwatch' | 'grenade'
  target?: Position | string
  position?: Position
  skill?: SkillType
  utility: number
}
