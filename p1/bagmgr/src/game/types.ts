export type ItemShape = { dx: number; dy: number }[];

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'potion' | 'ring' | 'gem' | 'food' | 'material' | 'scroll';
export type ElementType = 'fire' | 'ice' | 'lightning' | 'poison' | 'holy' | 'dark' | 'none';
export type AdjacencyEffectType = 'enchant' | 'boost' | 'corrupt' | 'stabilize' | 'empower' | 'weaken';

export interface ItemStats {
  attack?: number;
  defense?: number;
  hp?: number;
  stamina?: number;
  critChance?: number;
  mana?: number;
}

export interface ItemEffect {
  type: 'passive' | 'active' | 'consumable';
  description: string;
  value?: number;
}

export interface AdjacencyEffect {
  targetType?: ItemType;
  targetElement?: ElementType;
  effect: AdjacencyEffectType;
  value: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  shape: ItemShape;
  rotation: number;
  rarity: ItemRarity;
  type: ItemType;
  element: ElementType;
  stats: ItemStats;
  effects: ItemEffect[];
  adjacencyEffects?: AdjacencyEffect[];
  position?: { x: number; y: number } | null;
  icon: string;
  color: string;
  stackable?: boolean;
  maxStack?: number;
  quantity?: number;
  price?: number;
}

export interface SpecialSlot {
  id: string;
  type: 'weapon' | 'potion' | 'quick-access' | 'armor';
  x: number;
  y: number;
  width: number;
  height: number;
  effect: string;
  label: string;
}

export interface Backpack {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  specialSlots: SpecialSlot[];
  baseStats: {
    hp: number;
    stamina: number;
    attack: number;
    defense: number;
  };
  specialAbility: string;
  color: string;
  bgPattern: string;
}

export interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'empty' | 'enemy' | 'shop' | 'altar' | 'boss' | 'exit' | 'start' | 'treasure';
  cleared: boolean;
  discovered: boolean;
  content?: Enemy | ShopData | AltarData | TreasureData;
  connections: string[];
}

export interface Connection {
  from: string;
  to: string;
}

export interface DungeonFloor {
  level: number;
  rooms: Room[];
  connections: Connection[];
  playerRoomId: string;
  theme: string;
}

export interface EnemySkill {
  name: string;
  damage: number;
  effect?: string;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  skills: EnemySkill[];
  loot: string[];
  lootCount: { min: number; max: number };
  isBoss?: boolean;
  sprite: string;
  color: string;
}

export interface ShopData {
  items: { itemId: string; price: number }[];
  sellsPotions: boolean;
  refreshCount: number;
}

export interface AltarData {
  type: 'sacrifice' | 'blessing' | 'curse';
  description: string;
  used: boolean;
}

export interface TreasureData {
  items: string[];
  opened: boolean;
}

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  damage: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  itemId?: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

export interface CombatState {
  player: {
    hp: number;
    maxHp: number;
    stamina: number;
    maxStamina: number;
    accessibleItems: Item[];
    skills: CombatSkill[];
    defense: number;
    attack: number;
  };
  enemy: Enemy;
  turn: 'player' | 'enemy';
  log: string[];
  round: number;
  isOver: boolean;
  result: 'win' | 'lose' | null;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  resultItemId: string;
  requiredMaterials: { itemType: ItemType; element?: ElementType; shape?: ItemShape }[];
  description: string;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  gold: number;
  level: number;
  exp: number;
  inventory: Item[];
  backpack: Backpack;
  currentFloor: number;
  inCombat: boolean;
  currentCombat: CombatState | null;
  currentLoot: Item[];
  permanentBuffs: string[];
}

export type GameScreen = 'menu' | 'dungeon' | 'inventory' | 'combat' | 'loot' | 'camp' | 'shop' | 'altar' | 'gameover' | 'victory';

export interface GameState {
  screen: GameScreen;
  player: PlayerState;
  dungeon: DungeonFloor | null;
  selectedItemId: string | null;
  draggedItemId: string | null;
  hoveredCell: { x: number; y: number } | null;
  message: string | null;
  seed: number;
}
