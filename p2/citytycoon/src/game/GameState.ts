import {
  GameState,
  Tile,
  TileType,
  ToolType,
  Building,
  BuildingType,
  Citizen,
  Road,
  RoadType,
  ActivityType,
  Size,
  Position,
  Notification
} from '../types';
import { getBuildingConfig, getResidentialBuildingForLevel } from '../utils/buildings';

const MAP_WIDTH = 32;
const MAP_HEIGHT = 32;
const INITIAL_MONEY = 50000;

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyMap(width: number, height: number): Tile[][] {
  const map: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        position: { x, y },
        type: TileType.EMPTY,
        buildingId: null,
        hasWater: false,
        hasElectricity: false,
        landValue: 50,
        pollution: 0
      });
    }
    map.push(row);
  }
  return map;
}

function createCitizen(homeBuildingId: string): Citizen {
  const wakeUp = 6 + Math.floor(Math.random() * 2);
  const leaveHome = wakeUp + 1 + Math.floor(Math.random() * 2);
  const startWork = leaveHome + Math.floor(Math.random() * 2);
  const endWork = 17 + Math.floor(Math.random() * 2);
  const arriveHome = endWork + Math.floor(Math.random() * 2);
  const sleep = 22 + Math.floor(Math.random() * 2);

  return {
    id: generateId(),
    homeBuildingId,
    workBuildingId: null,
    position: { x: 0, y: 0 },
    targetPosition: null,
    path: [],
    pathIndex: 0,
    schedule: {
      wakeUp,
      leaveHome,
      startWork,
      endWork,
      arriveHome,
      sleep,
      currentActivity: ActivityType.SLEEPING
    },
    satisfaction: 70,
    commuteTime: 0,
    hasCar: Math.random() > 0.5
  };
}

export function createInitialState(): GameState {
  const mapSize: Size = { width: MAP_WIDTH, height: MAP_HEIGHT };
  const map = createEmptyMap(MAP_WIDTH, MAP_HEIGHT);

  return {
    money: INITIAL_MONEY,
    population: 0,
    averageSatisfaction: 70,
    date: { day: 1, hour: 7, minute: 0 },
    speed: 1,
    isPaused: false,
    selectedTool: ToolType.SELECT,
    selectedPosition: null,
    map,
    buildings: new Map<string, Building>(),
    citizens: [],
    roads: [],
    events: [],
    statistics: {
      populationHistory: [0],
      moneyHistory: [INITIAL_MONEY],
      satisfactionHistory: [70],
      landValueHistory: [50],
      commuteTimeDistribution: [],
      dailyTaxRevenue: 0,
      dailyExpenses: 0
    },
    notifications: [],
    mapSize,
    camera: {
      x: 0,
      y: 0,
      zoom: 1
    },
    isGameOver: false
  };
}

export function placeRoad(state: GameState, position: Position): GameState {
  const { x, y } = position;
  if (x < 0 || x >= state.mapSize.width || y < 0 || y >= state.mapSize.height) {
    return state;
  }

  const tile = state.map[y][x];
  if (tile.type !== TileType.EMPTY) {
    return state;
  }

  const cost = 100;
  if (state.money < cost) {
    return addNotification(state, '资金不足！', 'error');
  }

  const newMap = state.map.map(row => row.map(t => ({ ...t })));
  newMap[y][x] = {
    ...tile,
    type: TileType.ROAD
  };

  const newRoad: Road = {
    position,
    type: RoadType.STREET,
    capacity: 10,
    currentLoad: 0,
    congestion: 0,
    connections: []
  };

  return {
    ...state,
    map: newMap,
    roads: [...state.roads, newRoad],
    money: state.money - cost
  };
}

export function placeZone(state: GameState, position: Position, zoneType: TileType): GameState {
  const { x, y } = position;
  if (x < 0 || x >= state.mapSize.width || y < 0 || y >= state.mapSize.height) {
    return state;
  }

  const tile = state.map[y][x];
  if (tile.type !== TileType.EMPTY) {
    return state;
  }

  const cost = 10;
  if (state.money < cost) {
    return addNotification(state, '资金不足！', 'error');
  }

  const newMap = state.map.map(row => row.map(t => ({ ...t })));
  newMap[y][x] = {
    ...tile,
    type: zoneType
  };

  return {
    ...state,
    map: newMap,
    money: state.money - cost
  };
}

export function placeBuilding(state: GameState, position: Position, buildingType: BuildingType): GameState {
  const { x, y } = position;
  if (x < 0 || x >= state.mapSize.width || y < 0 || y >= state.mapSize.height) {
    return state;
  }

  const tile = state.map[y][x];
  if (tile.buildingId) {
    return addNotification(state, '该地块已有建筑！', 'warning');
  }
  if (tile.type !== TileType.EMPTY && tile.type !== TileType.RESIDENTIAL && 
      tile.type !== TileType.COMMERCIAL && tile.type !== TileType.INDUSTRIAL) {
    return state;
  }

  const config = getBuildingConfig(buildingType);
  if (state.money < config.cost) {
    return addNotification(state, '资金不足！', 'error');
  }

  const buildingId = generateId();
  const building: Building = {
    id: buildingId,
    type: buildingType,
    position,
    level: 1,
    health: 100,
    population: 0,
    maxPopulation: config.maxPopulation,
    jobs: 0,
    maxJobs: config.maxJobs,
    hasWater: false,
    hasElectricity: false,
    satisfaction: 70,
    growthProgress: 0,
    taxRevenue: 0,
    maintenanceCost: config.maintenanceCost
  };

  const newMap = state.map.map(row => row.map(t => ({ ...t })));
  newMap[y][x] = {
    ...tile,
    type: buildingType === BuildingType.PARK ? TileType.PARK : tile.type,
    buildingId
  };

  const newBuildings = new Map(state.buildings);
  newBuildings.set(buildingId, building);

  let newCitizens = [...state.citizens];
  if (config.maxPopulation > 0) {
    for (let i = 0; i < config.maxPopulation; i++) {
      newCitizens.push(createCitizen(buildingId));
    }
  }

  return {
    ...state,
    map: newMap,
    buildings: newBuildings,
    citizens: newCitizens,
    money: state.money - config.cost
  };
}

export function demolish(state: GameState, position: Position): GameState {
  const { x, y } = position;
  if (x < 0 || x >= state.mapSize.width || y < 0 || y >= state.mapSize.height) {
    return state;
  }

  const tile = state.map[y][x];
  if (tile.type === TileType.EMPTY) {
    return state;
  }

  const newMap = state.map.map(row => row.map(t => ({ ...t })));
  newMap[y][x] = {
    ...tile,
    type: TileType.EMPTY,
    buildingId: null
  };

  let newBuildings = new Map(state.buildings);
  let newCitizens = state.citizens;

  if (tile.buildingId) {
    newBuildings.delete(tile.buildingId);
    newCitizens = state.citizens.filter(c => c.homeBuildingId !== tile.buildingId);
  }

  const newRoads = state.roads.filter(
    r => r.position.x !== x || r.position.y !== y
  );

  const refund = 25;

  return {
    ...state,
    map: newMap,
    buildings: newBuildings,
    citizens: newCitizens,
    roads: newRoads,
    money: state.money + refund
  };
}

export function addNotification(
  state: GameState,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success'
): GameState {
  const notification: Notification = {
    id: generateId(),
    message,
    type,
    timestamp: Date.now()
  };

  const notifications = [...state.notifications, notification].slice(-10);

  return {
    ...state,
    notifications
  };
}

export function removeNotification(state: GameState, notificationId: string): GameState {
  return {
    ...state,
    notifications: state.notifications.filter(n => n.id !== notificationId)
  };
}

export function spawnBuilding(state: GameState, position: Position): GameState {
  const tile = state.map[position.y]?.[position.x];
  if (!tile || tile.buildingId) return state;

  let buildingType: BuildingType | null = null;

  if (tile.type === TileType.RESIDENTIAL) {
    buildingType = getResidentialBuildingForLevel(1);
  } else if (tile.type === TileType.COMMERCIAL) {
    buildingType = BuildingType.SHOP_SMALL;
  } else if (tile.type === TileType.INDUSTRIAL) {
    buildingType = BuildingType.FACTORY_SMALL;
  }

  if (!buildingType) return state;

  const config = getBuildingConfig(buildingType);
  const buildingId = generateId();

  const building: Building = {
    id: buildingId,
    type: buildingType,
    position,
    level: 1,
    health: 100,
    population: 0,
    maxPopulation: config.maxPopulation,
    jobs: 0,
    maxJobs: config.maxJobs,
    hasWater: tile.hasWater,
    hasElectricity: tile.hasElectricity,
    satisfaction: 70,
    growthProgress: 0,
    taxRevenue: 0,
    maintenanceCost: config.maintenanceCost
  };

  const newMap = state.map.map(row => row.map(t => ({ ...t })));
  newMap[position.y][position.x].buildingId = buildingId;

  const newBuildings = new Map(state.buildings);
  newBuildings.set(buildingId, building);

  let newCitizens = [...state.citizens];
  if (config.maxPopulation > 0) {
    for (let i = 0; i < Math.floor(config.maxPopulation * 0.5); i++) {
      const citizen = createCitizen(buildingId);
      citizen.position = { ...position };
      newCitizens.push(citizen);
    }
  }

  return {
    ...state,
    map: newMap,
    buildings: newBuildings,
    citizens: newCitizens
  };
}
