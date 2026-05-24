export type Owner = 'player' | 'ai';
export type UnitType = 'worker' | 'infantry' | 'archer' | 'cavalry';
export type BuildingType = 'base' | 'barracks' | 'tower' | 'blacksmith';
export type ResourceType = 'gold' | 'wood';
export type UnitState = 'idle' | 'moving' | 'attacking' | 'gathering' | 'returning' | 'building' | 'dead';

export interface Position {
  x: number;
  y: number;
}

export interface PathPoint extends Position {
  reached?: boolean;
}

export interface ResourceNode {
  id: string;
  type: ResourceType;
  x: number;
  y: number;
  amount: number;
  maxAmount: number;
}

export interface Entity {
  id: string;
  type: 'unit' | 'building';
  x: number;
  y: number;
  width: number;
  height: number;
  owner: Owner;
  health: number;
  maxHealth: number;
}

export interface Unit extends Entity {
  type: 'unit';
  unitType: UnitType;
  speed: number;
  attack: number;
  range: number;
  attackSpeed: number;
  attackCooldown: number;
  state: UnitState;
  path: PathPoint[];
  pathIndex: number;
  targetId: string | null;
  targetType: 'unit' | 'building' | 'resource' | null;
  carryingResource: { type: ResourceType; amount: number } | null;
  gatheringProgress: number;
  buildingProgress: number;
  buildingTargetId: string | null;
  visionRange: number;
}

export interface Building extends Entity {
  type: 'building';
  buildingType: BuildingType;
  isComplete: boolean;
  buildProgress: number;
  productionQueue: ProductionItem[];
  isProducing: boolean;
  productionProgress: number;
}

export interface ProductionItem {
  unitType: UnitType;
  progress: number;
  totalTime: number;
}

export interface MapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: number[][];
  resources: ResourceNode[];
}

export interface GameResources {
  gold: number;
  wood: number;
  population: number;
  maxPopulation: number;
}

export interface FogData {
  explored: boolean[][];
  visible: boolean[][];
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface GameState {
  map: MapData;
  units: Unit[];
  buildings: Building[];
  resources: {
    player: GameResources;
    ai: GameResources;
  };
  selectedUnits: string[];
  groups: Map<number, string[]>;
  fogOfWar: FogData;
  camera: Camera;
  gameOver: boolean;
  winner: Owner | null;
  buildingPlacement: BuildingType | null;
}

export interface UnitConfig {
  name: string;
  health: number;
  speed: number;
  attack: number;
  range: number;
  attackSpeed: number;
  visionRange: number;
  cost: { gold: number; wood: number };
  buildTime: number;
  size: number;
  population: number;
}

export interface BuildingConfig {
  name: string;
  health: number;
  size: { width: number; height: number };
  cost: { gold: number; wood: number };
  buildTime: number;
  produces: UnitType[];
  attack?: number;
  range?: number;
  attackSpeed?: number;
}

export interface GameConfig {
  units: Record<UnitType, UnitConfig>;
  buildings: Record<BuildingType, BuildingConfig>;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  visible: boolean;
}

export interface AIState {
  currentState: 'economy' | 'military_prep' | 'harass' | 'attack' | 'defend';
  armySize: number;
  targetBaseId: string | null;
  lastHarassTime: number;
}
