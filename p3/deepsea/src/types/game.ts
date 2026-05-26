export interface Position {
  x: number
  y: number
}

export type TerrainType = 'sand' | 'rock' | 'mountain' | 'vent' | 'cave' | 'wreck' | 'trench' | 'whalefall'

export type ResourceType = 'ore' | 'organic' | 'rare_ore' | 'crystal' | 'fuel' | 'biomass'

export interface ResourceNode {
  id: string
  type: ResourceType
  amount: number
  position: Position
  discovered: boolean
}

export interface Tile {
  x: number
  y: number
  terrain: TerrainType
  depth: number
  discovered: boolean
  resources: ResourceNode[]
}

export interface MapData {
  width: number
  height: number
  tiles: Tile[][]
  seed: number
}

export type ModuleType = 'habitat' | 'power' | 'oxygen' | 'storage' | 'research' | 'factory' | 'nuclear' | 'bio_lab' | 'defense'

export interface BaseModule {
  id: string
  type: ModuleType
  position: Position
  health: number
  maxHealth: number
  powerConsumption: number
  powerProduction: number
  oxygenConsumption: number
  oxygenProduction: number
  storageCapacity: number
  connections: string[]
}

export type SubmersibleType = 'scout' | 'miner' | 'research'

export type SubmersibleStatus = 'docked' | 'exploring' | 'returning' | 'damaged'

export interface Submersible {
  id: string
  name: string
  type: SubmersibleType
  status: SubmersibleStatus
  position: Position
  targetPosition?: Position
  path: Position[]
  health: number
  maxHealth: number
  maxDepth: number
  speed: number
  cargoCapacity: number
  cargo: { type: ResourceType; amount: number }[]
  fuel: number
  maxFuel: number
}

export interface Resources {
  ore: number
  organic: number
  rare_ore: number
  crystal: number
  fuel: number
  biomass: number
  alloy: number
  electronics: number
}

export type CreatureType = 'squid' | 'worm' | 'ray' | 'fish_school' | 'angler'

export interface Creature {
  id: string
  type: CreatureType
  position: Position
  health: number
  hostile: boolean
  speed: number
}

export type EventType = 'resource_discovery' | 'creature_encounter' | 'treasure' | 'earthquake' | 'pressure_warning'

export interface GameEvent {
  id: string
  type: EventType
  message: string
  timestamp: number
  options?: { text: string; action: string }[]
}

export type TechType = 'deep_dive' | 'advanced_mining' | 'bio_scan' | 'nuclear_power' | 'auto_defense' | 'pressure_hull'

export interface Technology {
  id: TechType
  name: string
  description: string
  cost: Partial<Resources>
  unlocked: boolean
  prerequisites: TechType[]
}

export interface GameState {
  day: number
  time: number
  paused: boolean
  resources: Resources
  baseModules: BaseModule[]
  submersibles: Submersible[]
  creatures: Creature[]
  technologies: Technology[]
  events: GameEvent[]
  currentPower: number
  currentOxygen: number
  maxPower: number
  maxOxygen: number
  maxStorage: number
  usedStorage: number
  map: MapData
  camera: Position
  zoom: number
  selectedSubmersible?: string
  buildMode: ModuleType | null
}
