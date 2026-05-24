export type GoodType = 'food' | 'ore' | 'electronics' | 'consumerGoods' | 'rareMinerals' | 'industrialParts';

export type PlanetType = 'agricultural' | 'mining' | 'tech' | 'industrial' | 'trade';

export type GamePhase = 'starmap' | 'trading' | 'traveling' | 'combat' | 'event' | 'shipyard';

export type EventType = 'storm' | 'festival' | 'shortage' | 'surplus' | 'pirate' | 'distress' | 'inspection';

export type WeaponType = 'laser' | 'missile' | 'railgun';

export type ShieldType = 'basic' | 'advanced' | 'heavy';

export type EngineType = 'basic' | 'advanced' | 'warp';

export type Formation = 'offensive' | 'defensive' | 'balanced';

export interface Good {
  id: GoodType;
  name: string;
  basePrice: number;
  icon: string;
}

export interface PlanetGood {
  type: GoodType;
  supply: number;
  demand: number;
  currentPrice: number;
  priceHistory: number[];
}

export interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  x: number;
  y: number;
  goods: PlanetGood[];
  description: string;
  color: string;
  size: number;
  activeEvents: PlanetEvent[];
}

export interface PlanetEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  affectedGood?: GoodType;
  demandMultiplier?: number;
  supplyMultiplier?: number;
  duration: number;
  remainingDays: number;
}

export interface ShipComponent {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
}

export interface CargoItem {
  type: GoodType;
  quantity: number;
  buyPrice: number;
}

export interface Frigate {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  accuracy: number;
  weaponType: WeaponType;
}

export interface Fleet {
  credits: number;
  mothership: {
    hp: number;
    maxHp: number;
    cargoCapacity: number;
    cargo: CargoItem[];
    shield: ShipComponent;
    engine: ShipComponent;
    weapon: ShipComponent;
  };
  frigates: Frigate[];
  formation: Formation;
  currentPlanetId: string;
  targetPlanetId?: string;
  travelProgress: number;
}

export interface CombatUnit {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  damage: number;
  accuracy: number;
  shield: number;
  maxShield: number;
  x: number;
  y: number;
  targetId?: string;
}

export interface CombatState {
  playerUnits: CombatUnit[];
  enemyUnits: CombatUnit[];
  isActive: boolean;
  turn: number;
  log: string[];
  result?: 'victory' | 'defeat' | 'retreat';
}

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  action: () => void;
}

export interface GameState {
  day: number;
  phase: GamePhase;
  planets: Planet[];
  fleet: Fleet;
  currentEvent?: GameEvent;
  combatState?: CombatState;
  messages: string[];
}
