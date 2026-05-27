
export type PartType = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'legs' | 'core';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type DamageType = 'kinetic' | 'energy' | 'thermal';

export interface PartStats {
  armor?: number;
  damage?: number;
  accuracy?: number;
  range?: number;
  mobility?: number;
  evasion?: number;
  maxEnergy?: number;
  shield?: number;
  maxHealth?: number;
  actionPoints?: number;
}

export interface Affix {
  id: string;
  name: string;
  description: string;
  type: 'weight' | 'energy' | 'damage' | 'defense' | 'mobility';
  value: number;
}

export interface SetBonus {
  setName: string;
  requiredParts: number;
  effect: string;
  stats: Partial<PartStats>;
}

export interface Part {
  id: string;
  name: string;
  type: PartType;
  rarity: Rarity;
  weight: number;
  durability: number;
  maxDurability: number;
  energyCost: number;
  slotCount: number;
  stats: PartStats;
  affixes: Affix[];
  setBonus?: SetBonus;
  price: number;
  description: string;
  damageType?: DamageType;
}

export interface Mech {
  id: string;
  name: string;
  parts: Record<PartType, Part | null>;
  currentHealth: number;
  maxHealth: number;
  currentShield: number;
  maxShield: number;
  currentEnergy: number;
  maxEnergy: number;
  totalWeight: number;
  actionPoints: number;
  maxActionPoints: number;
  baseStats: PartStats;
}

export interface HexCoord {
  q: number;
  r: number;
}

export type TerrainType = 'normal' | 'cover' | 'highGround' | 'explosive' | 'obstacle';

export interface HexTile {
  coord: HexCoord;
  terrain: TerrainType;
  occupiedBy?: string;
}

export type BattlePhase = 'playerTurn' | 'enemyTurn' | 'victory' | 'defeat';

export interface BattleUnit {
  id: string;
  mech: Mech;
  position: HexCoord;
  team: 'player' | 'enemy';
  hasMoved: boolean;
  hasAttacked: boolean;
  remainingAP: number;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'move' | 'attack' | 'defend' | 'damage' | 'heal';
  timestamp: number;
}

export interface BattleState {
  playerUnit: BattleUnit;
  enemyUnit: BattleUnit;
  grid: HexTile[][];
  phase: BattlePhase;
  turn: number;
  logs: BattleLog[];
  selectedAction: 'move' | 'attack' | 'defend' | null;
  highlightedTiles: HexCoord[];
}

export interface BattleLogEntry {
  id: string;
  opponent: string;
  opponentName: string;
  won: boolean;
  creditsEarned: number;
  date: string;
  damageReceived: number;
}

export interface PlayerSave {
  id: string;
  name: string;
  credits: number;
  reputation: number;
  currentTier: number;
  ownedParts: string[];
  currentMech: Mech;
  battleHistory: BattleLogEntry[];
  unlockedTiers: number[];
}

export interface AssemblyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type ShopItem = {
  partId: string;
  stock: number;
  price: number;
  discount?: number;
};

export interface Tournament {
  id: number;
  name: string;
  tier: number;
  entryFee: number;
  prizePool: number;
  opponents: string[];
  unlocked: boolean;
  completed: boolean;
}

export const PART_TYPES: PartType[] = ['head', 'torso', 'leftArm', 'rightArm', 'legs', 'core'];

export const PART_TYPE_NAMES: Record<PartType, string> = {
  head: '头部',
  torso: '躯干',
  leftArm: '左臂',
  rightArm: '右臂',
  legs: '腿部',
  core: '核心引擎',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_NAMES: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const DAMAGE_TYPE_NAMES: Record<DamageType, string> = {
  kinetic: '动能',
  energy: '能量',
  thermal: '热能',
};
