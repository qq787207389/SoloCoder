export interface Position {
  x: number;
  y: number;
}

export interface PlayerStats {
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  gold: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  attack: number;
  defense: number;
  price: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'key';
  effect?: {
    hp?: number;
    mp?: number;
  };
  price: number;
  description: string;
  equipmentId?: string;
}

export interface InventoryItem {
  item: Item;
  count: number;
}

export interface Spell {
  id: string;
  name: string;
  mpCost: number;
  damage?: number;
  heal?: number;
  description: string;
}

export interface Player {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  stats: PlayerStats;
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
  };
  inventory: InventoryItem[];
  spells: Spell[];
  mapName: string;
}

export interface NPC {
  id: string;
  name: string;
  position: Position;
  dialogues: string[];
  questFlag?: string;
  color: string;
}

export interface Chest {
  id: string;
  position: Position;
  itemId: string;
  opened: boolean;
  gold?: number;
}

export interface MapPortal {
  position: Position;
  targetMap: string;
  targetPosition: Position;
}

export interface GameMap {
  name: string;
  displayName: string;
  width: number;
  height: number;
  tiles: number[][];
  collisionTiles: number[];
  npcs: NPC[];
  chests: Chest[];
  portals: MapPortal[];
  encounterRate: number;
  encounterTable: string[];
  bgColor: string;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  color: string;
  skills: { name: string; damage: number; hpThreshold: number }[];
}

export interface BattleState {
  enemy: Enemy;
  turn: 'player' | 'enemy';
  playerAction: string | null;
  selectedSpell: Spell | null;
  selectedItem: Item | null;
  log: string[];
  isOver: boolean;
  victory: boolean;
}

export interface GameState {
  player: Player;
  currentMap: string;
  maps: Record<string, GameMap>;
  flags: Record<string, boolean>;
  gamePhase: 'map' | 'battle' | 'menu' | 'dialogue';
  battleState: BattleState | null;
  dialogueBox: {
    visible: boolean;
    text: string[];
    currentIndex: number;
    npcId: string | null;
  };
  questLog: string[];
  currentQuest: string;
}

export type TileType = 
  | 'grass'
  | 'water'
  | 'forest'
  | 'mountain'
  | 'floor'
  | 'wall'
  | 'path'
  | 'door';
