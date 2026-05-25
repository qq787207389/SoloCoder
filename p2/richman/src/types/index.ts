export type CellType = 'property' | 'utility' | 'station' | 'chance' | 'fortune' | 'tax' | 'special' | 'go' | 'jail' | 'free_parking';

export type BuildingLevel = 0 | 1 | 2 | 3 | 4 | 'landmark';

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  isAI: boolean;
  character: Character;
  skillCooldown: number;
  ownedProperties: string[];
  stocks: Record<string, number>;
  loans: number;
  mortgagedProperties: string[];
  getOutOfJailCards: number;
  isInJail: boolean;
  jailTurns: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  skillName: string;
  skillDescription: string;
  cooldown: number;
  effect: (game: GameState, player: Player) => void;
}

export interface Property {
  id: string;
  name: string;
  type: 'property';
  colorGroup: string;
  color: string;
  price: number;
  rent: number[];
  buildingCost: number;
  mortgageValue: number;
  ownerId: string | null;
  buildingLevel: BuildingLevel;
  isMortgaged: boolean;
}

export interface Utility {
  id: string;
  name: string;
  type: 'utility';
  price: number;
  baseRent: number;
  mortgageValue: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

export interface Station {
  id: string;
  name: string;
  type: 'station';
  price: number;
  rentPerStation: number;
  mortgageValue: number;
  ownerId: string | null;
  isMortgaged: boolean;
}

export interface ChanceCard {
  id: string;
  title: string;
  description: string;
  effect: (game: GameState, player: Player) => void;
  duration?: number;
}

export interface FortuneCard {
  id: string;
  title: string;
  description: string;
  effect: (game: GameState, player: Player) => void;
  duration?: number;
}

export interface Stock {
  propertyId: string;
  basePrice: number;
  currentPrice: number;
  priceHistory: number[];
  volume: number;
}

export interface GameCell {
  id: string;
  type: CellType;
  name: string;
  data: Property | Utility | Station | null;
  position: Position;
}

export type GamePhase = 'waiting' | 'rolling' | 'moving' | 'triggering' | 'action' | 'trading' | 'ended';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  dice: number[];
  cells: GameCell[];
  stocks: Record<string, Stock>;
  chanceDeck: ChanceCard[];
  fortuneDeck: FortuneCard[];
  turn: number;
  log: string[];
  selectedCell: string | null;
  selectedPlayer: string | null;
  pendingAction: ActionType | null;
  auctioningProperty: string | null;
  currentEvent: EventEffect | null;
}

export type ActionType = 'buy' | 'build' | 'mortgage' | 'unmortgage' | 'sell' | 'trade' | 'useSkill';

export interface EventEffect {
  type: string;
  description: string;
  duration: number;
  apply: (game: GameState) => void;
  expire: (game: GameState) => void;
}

export interface TradeOffer {
  from: string;
  to: string;
  offer: {
    money: number;
    properties: string[];
    stocks: Record<string, number>;
  };
  request: {
    money: number;
    properties: string[];
    stocks: Record<string, number>;
  };
}
