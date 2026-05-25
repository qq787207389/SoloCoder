export interface Position {
  x: number;
  y: number;
}

export interface IsoPosition {
  isoX: number;
  isoY: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum TileType {
  EMPTY = 'empty',
  ROAD = 'road',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  WATER = 'water',
  ELECTRICITY = 'electricity',
  PARK = 'park',
  POLICE = 'police',
  FIRE_STATION = 'fire_station',
  SCHOOL = 'school',
  HOSPITAL = 'hospital'
}

export enum BuildingType {
  HOUSE_LOW = 'house_low',
  HOUSE_MED = 'house_med',
  APARTMENT = 'apartment',
  SHOP_SMALL = 'shop_small',
  SHOP_LARGE = 'shop_large',
  OFFICE = 'office',
  FACTORY_SMALL = 'factory_small',
  FACTORY_LARGE = 'factory_large',
  POLICE = 'police',
  FIRE_STATION = 'fire_station',
  SCHOOL = 'school',
  HOSPITAL = 'hospital',
  PARK = 'park'
}

export enum BuildingCategory {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  PUBLIC_SERVICE = 'public_service'
}

export enum RoadType {
  STREET = 'street',
  AVENUE = 'avenue',
  HIGHWAY = 'highway'
}

export enum ActivityType {
  SLEEPING = 'sleeping',
  AT_HOME = 'at_home',
  COMMUTING_TO_WORK = 'commuting_to_work',
  WORKING = 'working',
  COMMUTING_HOME = 'commuting_home',
  SHOPPING = 'shopping',
  LEISURE = 'leisure'
}

export enum ToolType {
  SELECT = 'select',
  ROAD = 'road',
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  WATER = 'water',
  ELECTRICITY = 'electricity',
  POLICE = 'police',
  FIRE_STATION = 'fire_station',
  SCHOOL = 'school',
  HOSPITAL = 'hospital',
  PARK = 'park',
  DEMOLISH = 'demolish'
}

export enum EventType {
  FIRE = 'fire',
  CRIME = 'crime',
  PLAGUE = 'plague',
  PROTEST = 'protest'
}

export interface Tile {
  position: Position;
  type: TileType;
  buildingId: string | null;
  hasWater: boolean;
  hasElectricity: boolean;
  landValue: number;
  pollution: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  position: Position;
  level: number;
  health: number;
  population: number;
  maxPopulation: number;
  jobs: number;
  maxJobs: number;
  hasWater: boolean;
  hasElectricity: boolean;
  satisfaction: number;
  growthProgress: number;
  taxRevenue: number;
  maintenanceCost: number;
}

export interface Schedule {
  wakeUp: number;
  leaveHome: number;
  startWork: number;
  endWork: number;
  arriveHome: number;
  sleep: number;
  currentActivity: ActivityType;
}

export interface Citizen {
  id: string;
  homeBuildingId: string;
  workBuildingId: string | null;
  position: Position;
  targetPosition: Position | null;
  path: Position[];
  pathIndex: number;
  schedule: Schedule;
  satisfaction: number;
  commuteTime: number;
  hasCar: boolean;
}

export interface Road {
  position: Position;
  type: RoadType;
  capacity: number;
  currentLoad: number;
  congestion: number;
  connections: Position[];
}

export interface GameDate {
  day: number;
  hour: number;
  minute: number;
}

export interface Statistics {
  populationHistory: number[];
  moneyHistory: number[];
  satisfactionHistory: number[];
  landValueHistory: number[];
  commuteTimeDistribution: number[];
  dailyTaxRevenue: number;
  dailyExpenses: number;
}

export interface GameEvent {
  id: string;
  type: EventType;
  position: Position;
  severity: number;
  startTime: GameDate;
  duration: number;
  resolved: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
}

export interface GameState {
  money: number;
  population: number;
  averageSatisfaction: number;
  date: GameDate;
  speed: number;
  isPaused: boolean;
  selectedTool: ToolType;
  selectedPosition: Position | null;
  map: Tile[][];
  buildings: Map<string, Building>;
  citizens: Citizen[];
  roads: Road[];
  events: GameEvent[];
  statistics: Statistics;
  notifications: Notification[];
  mapSize: Size;
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  isGameOver: boolean;
}
