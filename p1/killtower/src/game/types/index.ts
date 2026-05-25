export type CardType = 'attack' | 'skill' | 'power';
export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare';
export type CardTarget = 'self' | 'single' | 'all' | 'none' | 'allEnemies';

export type StatusType = 
  | 'weak' 
  | 'vulnerable' 
  | 'strength' 
  | 'dexterity' 
  | 'poison' 
  | 'regen' 
  | 'thorns'
  | 'artifact'
  | 'intangible';

export type EffectType = 
  | 'damage' 
  | 'block' 
  | 'draw' 
  | 'discard' 
  | 'applyStatus' 
  | 'exhaust' 
  | 'energy'
  | 'heal'
  | 'strength'
  | 'dexterity';

export type NodeType = 'enemy' | 'elite' | 'boss' | 'shop' | 'event' | 'campfire' | 'rest';

export type CharacterClass = 'warrior' | 'mage' | 'rogue';

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'boss' | 'starter';

export type RelicTrigger = 
  | 'onBattleStart' 
  | 'onTurnStart' 
  | 'onTurnEnd' 
  | 'onCardPlayed' 
  | 'onDamageDealt'
  | 'onDamageTaken'
  | 'onBlockGained'
  | 'onKill'
  | 'onExhaust';

export type GamePhase = 
  | 'menu' 
  | 'characterSelect'
  | 'map' 
  | 'battle' 
  | 'shop' 
  | 'campfire' 
  | 'event' 
  | 'reward' 
  | 'deck' 
  | 'victory' 
  | 'defeat';

export type IntentType = 'attack' | 'defend' | 'buff' | 'debuff' | 'special' | 'unknown';

export interface CardEffect {
  type: EffectType;
  value: number;
  statusType?: StatusType;
  target?: 'self' | 'enemy' | 'allEnemies';
  condition?: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  rarity: CardRarity;
  description: string;
  upgradedDescription?: string;
  effects: CardEffect[];
  target: CardTarget;
  exhausts?: boolean;
  isInnate?: boolean;
  isEthereal?: boolean;
  isUpgraded?: boolean;
  classes?: CharacterClass[];
}

export interface StatusEffect {
  type: StatusType;
  stacks: number;
  duration?: number;
}

export interface CombatEntity {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  block: number;
  statusEffects: StatusEffect[];
}

export interface Player extends CombatEntity {
  energy: number;
  maxEnergy: number;
  gold: number;
}

export interface EnemyMove {
  id: string;
  name: string;
  intent: IntentType;
  damage?: number;
  hits?: number;
  block?: number;
  buffs?: { type: StatusType; stacks: number }[];
  debuffs?: { type: StatusType; stacks: number }[];
  weight: number;
}

export interface EnemyIntent {
  type: IntentType;
  moveId: string;
  damage?: number;
  hits?: number;
  block?: number;
  buffs?: { type: StatusType; stacks: number }[];
  debuffs?: { type: StatusType; stacks: number }[];
}

export interface Enemy extends CombatEntity {
  type: string;
  intent: EnemyIntent;
  moves: EnemyMove[];
  moveHistory: string[];
  isElite?: boolean;
  isBoss?: boolean;
}

export interface RelicAction {
  type: 'block' | 'damage' | 'heal' | 'energy' | 'draw' | 'strength' | 'dexterity' | 'gold';
  value: number;
}

export interface RelicEffect {
  trigger: RelicTrigger;
  action: RelicAction;
  condition?: string;
}

export interface Relic {
  id: string;
  name: string;
  rarity: RelicRarity;
  description: string;
  effect: RelicEffect;
  counters?: number;
}

export interface Character {
  id: CharacterClass;
  name: string;
  description: string;
  maxHp: number;
  startingGold: number;
  startingDeck: string[];
  startingRelic: string;
  color: string;
}

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  layer: number;
  connections: string[];
  completed: boolean;
  accessible: boolean;
  visited?: boolean;
}

export interface GameMap {
  layers: MapNode[][];
  currentLayer: number;
  currentNodeId: string | null;
  floor: number;
}

export interface BattleState {
  turn: number;
  phase: 'player' | 'enemy' | 'animating';
  player: Player;
  enemies: Enemy[];
  deck: Card[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  selectedCard: Card | null;
  selectedEnemy: string | null;
  battleLog: string[];
  relics: Relic[];
}

export interface ShopItem {
  id: string;
  type: 'card' | 'relic' | 'potion' | 'removeCard';
  item?: Card | Relic;
  price: number;
  sold: boolean;
}

export interface ShopState {
  cards: ShopItem[];
  relics: ShopItem[];
  potions: ShopItem[];
  removeCardPrice: number;
}

export interface EventChoice {
  text: string;
  effect: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: EventChoice[];
}

export interface Reward {
  type: 'card' | 'gold' | 'relic' | 'potion';
  value?: number;
  cards?: Card[];
  relic?: Relic;
}

export interface GameState {
  phase: GamePhase;
  character: Character | null;
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  deck: Card[];
  relics: Relic[];
  map: GameMap | null;
  battle: BattleState | null;
  shop: ShopState | null;
  currentEvent: GameEvent | null;
  rewards: Reward[];
  floor: number;
  maxFloor: number;
}

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  seed: number;
}
