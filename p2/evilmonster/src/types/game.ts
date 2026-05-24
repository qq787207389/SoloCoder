export type TileType = 'rock' | 'floor' | 'wall' | 'room' | 'entrance' | 'heart' | 'treasury';

export type RoomType = 'training' | 'alchemy' | 'hatchery' | 'treasury' | 'lair';

export type MonsterType = 'imp' | 'skeleton' | 'assassin';

export type AdventurerClass = 'warrior' | 'mage' | 'thief';

export type TrapType = 'spike' | 'gas' | 'boulder' | 'pressure_plate';

export type SpellType = 'fireball' | 'lightning' | 'heal';

export type ToolType = 'dig' | 'room' | 'monster' | 'trap' | 'move' | null;

export type GameMode = 'management' | 'combat';

export type AdventurerState = 'exploring' | 'fighting' | 'fleeing' | 'looting' | 'dead';

export type MonsterState = 'patrolling' | 'fighting' | 'idle' | 'striking' | 'dead';

export interface Point {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  roomId?: string;
  trapId?: string;
  passable: boolean;
  explored: boolean;
}

export interface Room {
  id: string;
  type: RoomType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StatusEffect {
  type: 'poison' | 'stunned' | 'burning';
  duration: number;
  damagePerSecond: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  attack: number;
  effects: StatusEffect[];
}

export interface Monster extends Entity {
  type: 'monster';
  monsterType: MonsterType;
  level: number;
  mood: number;
  salary: number;
  state: MonsterState;
  targetId?: string;
  patrolPath: Point[];
  patrolIndex: number;
  attackCooldown: number;
}

export interface Adventurer extends Entity {
  type: 'adventurer';
  adventurerClass: AdventurerClass;
  state: AdventurerState;
  path: Point[];
  pathIndex: number;
  targetId?: string;
  gold: number;
  attackCooldown: number;
  lootPriority: 'monster' | 'treasure' | 'heart';
}

export interface Trap {
  id: string;
  type: TrapType;
  x: number;
  y: number;
  cooldown: number;
  maxCooldown: number;
  damage: number;
  linkedTraps: string[];
  triggered: boolean;
}

export interface Spell {
  type: SpellType;
  cooldown: number;
  maxCooldown: number;
  manaCost: number;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  mode: GameMode;
  gold: number;
  fear: number;
  mana: number;
  maxMana: number;
  wave: number;
  waveTimer: number;
  heartHealth: number;
  maxHeartHealth: number;
  gameOver: boolean;
  selectedTool: ToolType;
  selectedRoomType: RoomType | null;
  selectedMonsterType: MonsterType | null;
  selectedTrapType: TrapType | null;
  selectedEntityId: string | null;
  cameraX: number;
  cameraY: number;
  zoom: number;
  isPaused: boolean;
}

export interface MonsterConfig {
  name: string;
  maxHealth: number;
  attack: number;
  speed: number;
  salary: number;
  moodDecay: number;
  cost: number;
  color: string;
}

export interface AdventurerConfig {
  name: string;
  maxHealth: number;
  attack: number;
  speed: number;
  color: string;
  lootPriority: 'monster' | 'treasure' | 'heart';
}

export interface TrapConfig {
  name: string;
  damage: number;
  cooldown: number;
  cost: number;
  color: string;
  effect?: StatusEffect;
}

export interface SpellConfig {
  name: string;
  damage: number;
  cooldown: number;
  manaCost: number;
  range: number;
  color: string;
}
