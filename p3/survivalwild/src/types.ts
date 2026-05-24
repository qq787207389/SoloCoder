export enum TerrainType {
  WATER = 'water',
  SAND = 'sand',
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  CAVE = 'cave'
}

export enum ItemType {
  TWIG = 'twig',
  STONE = 'stone',
  FIBER = 'fiber',
  BERRY = 'berry',
  WOOD = 'wood',
  VINE = 'vine',
  RAW_MEAT = 'raw_meat',
  COOKED_MEAT = 'cooked_meat',
  FRESH_WATER = 'fresh_water',
  ROPE = 'rope',
  STONE_AXE = 'stone_axe',
  STONE_PICKAXE = 'stone_pickaxe',
  BOW = 'bow',
  ARROW = 'arrow',
  TORCH = 'torch',
  IRON_ORE = 'iron_ore',
  IRON_INGOT = 'iron_ingot',
  IRON_AXE = 'iron_axe',
  MEDKIT = 'medkit',
  SHIP_PART = 'ship_part',
  DIARY_FRAGMENT = 'diary_fragment'
}

export const ITEM_INFO: Record<ItemType, { name: string; icon: string; stackable: boolean; maxStack?: number }> = {
  [ItemType.TWIG]: { name: '树枝', icon: '🪵', stackable: true, maxStack: 50 },
  [ItemType.STONE]: { name: '石头', icon: '🪨', stackable: true, maxStack: 50 },
  [ItemType.FIBER]: { name: '纤维', icon: '🧵', stackable: true, maxStack: 50 },
  [ItemType.BERRY]: { name: '浆果', icon: '🫐', stackable: true, maxStack: 20 },
  [ItemType.WOOD]: { name: '木材', icon: '🪓', stackable: true, maxStack: 30 },
  [ItemType.VINE]: { name: '藤蔓', icon: '🌿', stackable: true, maxStack: 30 },
  [ItemType.RAW_MEAT]: { name: '生肉', icon: '🥩', stackable: true, maxStack: 10 },
  [ItemType.COOKED_MEAT]: { name: '熟肉', icon: '🍖', stackable: true, maxStack: 10 },
  [ItemType.FRESH_WATER]: { name: '淡水', icon: '💧', stackable: true, maxStack: 10 },
  [ItemType.ROPE]: { name: '绳子', icon: '🪢', stackable: true, maxStack: 20 },
  [ItemType.STONE_AXE]: { name: '石斧', icon: '⛏️', stackable: false },
  [ItemType.STONE_PICKAXE]: { name: '石镐', icon: '⚒️', stackable: false },
  [ItemType.BOW]: { name: '弓', icon: '🏹', stackable: false },
  [ItemType.ARROW]: { name: '箭矢', icon: '➶', stackable: true, maxStack: 30 },
  [ItemType.TORCH]: { name: '火把', icon: '🔥', stackable: true, maxStack: 10 },
  [ItemType.IRON_ORE]: { name: '铁矿石', icon: '🪨', stackable: true, maxStack: 30 },
  [ItemType.IRON_INGOT]: { name: '铁锭', icon: '🔩', stackable: true, maxStack: 20 },
  [ItemType.IRON_AXE]: { name: '铁斧', icon: '🪓', stackable: false },
  [ItemType.MEDKIT]: { name: '医疗包', icon: '🩹', stackable: true, maxStack: 5 },
  [ItemType.SHIP_PART]: { name: '船只零件', icon: '⚓', stackable: true, maxStack: 5 },
  [ItemType.DIARY_FRAGMENT]: { name: '日记碎片', icon: '📜', stackable: true, maxStack: 10 }
};

export enum BuildingType {
  WALL = 'wall',
  ROOF = 'roof',
  CAMPFIRE = 'campfire',
  SHELTER = 'shelter',
  TRAP = 'trap',
  DRYING_RACK = 'drying_rack',
  FURNACE = 'furnace',
  WORKBENCH = 'workbench'
}

export const BUILDING_INFO: Record<BuildingType, { name: string; icon: string; cost: { item: ItemType; count: number }[] }> = {
  [BuildingType.WALL]: { name: '墙壁', icon: '🧱', cost: [{ item: ItemType.WOOD, count: 3 }] },
  [BuildingType.ROOF]: { name: '屋顶', icon: '🏠', cost: [{ item: ItemType.WOOD, count: 4 }, { item: ItemType.VINE, count: 2 }] },
  [BuildingType.CAMPFIRE]: { name: '篝火', icon: '🔥', cost: [{ item: ItemType.WOOD, count: 5 }, { item: ItemType.STONE, count: 3 }] },
  [BuildingType.SHELTER]: { name: '庇护所', icon: '⛺', cost: [{ item: ItemType.WOOD, count: 10 }, { item: ItemType.VINE, count: 5 }] },
  [BuildingType.TRAP]: { name: '陷阱', icon: '🪤', cost: [{ item: ItemType.WOOD, count: 3 }, { item: ItemType.ROPE, count: 2 }] },
  [BuildingType.DRYING_RACK]: { name: '晾肉架', icon: '🥓', cost: [{ item: ItemType.WOOD, count: 6 }, { item: ItemType.VINE, count: 3 }] },
  [BuildingType.FURNACE]: { name: '熔炉', icon: '🏭', cost: [{ item: ItemType.STONE, count: 15 }, { item: ItemType.WOOD, count: 5 }] },
  [BuildingType.WORKBENCH]: { name: '工作台', icon: '🔧', cost: [{ item: ItemType.WOOD, count: 8 }] }
};

export enum AnimalType {
  BOAR = 'boar',
  SNAKE = 'snake',
  WOLF = 'wolf'
}

export enum AnimalState {
  IDLE = 'idle',
  PATROL = 'patrol',
  CHASE = 'chase',
  FLEE = 'flee',
  ATTACK = 'attack',
  DEAD = 'dead'
}

export enum WeatherType {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  RAIN = 'rain',
  STORM = 'storm'
}

export interface Recipe {
  id: string;
  result: ItemType;
  resultCount: number;
  ingredients: { item: ItemType; count: number }[];
  requires?: BuildingType;
}

export interface InventorySlot {
  item: ItemType | null;
  count: number;
}

export interface PlayerState {
  x: number;
  y: number;
  health: number;
  hunger: number;
  thirst: number;
  stamina: number;
  temperature: number;
  inventory: InventorySlot[];
  hotbarIndex: number;
}

export interface Animal {
  id: string;
  type: AnimalType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  state: AnimalState;
  targetX: number;
  targetY: number;
  lastAttackTime: number;
}

export interface ResourceNode {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  amount: number;
  maxAmount: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  health: number;
  lit?: boolean;
}

export interface MapTile {
  terrain: TerrainType;
  elevation: number;
  moisture: number;
}

export interface GameState {
  player: PlayerState;
  map: MapTile[][];
  resources: ResourceNode[];
  buildings: Building[];
  animals: Animal[];
  timeOfDay: number;
  day: number;
  weather: WeatherType;
  shipPartsFound: number;
  totalShipParts: number;
  gameOver: boolean;
  victory: boolean;
  seed: number;
}

export const RECIPES: Recipe[] = [
  { id: 'rope', result: ItemType.ROPE, resultCount: 1, ingredients: [{ item: ItemType.FIBER, count: 3 }] },
  { id: 'stone_axe', result: ItemType.STONE_AXE, resultCount: 1, ingredients: [{ item: ItemType.TWIG, count: 2 }, { item: ItemType.STONE, count: 3 }] },
  { id: 'stone_pickaxe', result: ItemType.STONE_PICKAXE, resultCount: 1, ingredients: [{ item: ItemType.TWIG, count: 2 }, { item: ItemType.STONE, count: 5 }] },
  { id: 'bow', result: ItemType.BOW, resultCount: 1, ingredients: [{ item: ItemType.WOOD, count: 3 }, { item: ItemType.ROPE, count: 2 }] },
  { id: 'arrow', result: ItemType.ARROW, resultCount: 3, ingredients: [{ item: ItemType.TWIG, count: 2 }, { item: ItemType.STONE, count: 1 }] },
  { id: 'torch', result: ItemType.TORCH, resultCount: 2, ingredients: [{ item: ItemType.TWIG, count: 2 }, { item: ItemType.FIBER, count: 1 }] },
  { id: 'iron_ingot', result: ItemType.IRON_INGOT, resultCount: 1, ingredients: [{ item: ItemType.IRON_ORE, count: 2 }], requires: BuildingType.FURNACE },
  { id: 'iron_axe', result: ItemType.IRON_AXE, resultCount: 1, ingredients: [{ item: ItemType.IRON_INGOT, count: 2 }, { item: ItemType.WOOD, count: 2 }], requires: BuildingType.WORKBENCH },
  { id: 'cooked_meat', result: ItemType.COOKED_MEAT, resultCount: 1, ingredients: [{ item: ItemType.RAW_MEAT, count: 1 }], requires: BuildingType.CAMPFIRE }
];
