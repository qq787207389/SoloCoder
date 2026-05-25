import { GameState, TileType, Position, ActivityType } from '../types';
import { getBuildingConfig } from '../utils/buildings';
import { spawnBuilding, addNotification } from './GameState';
import { findNearestRoad } from '../utils/pathfinding';

const TICKS_PER_MINUTE = 1;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export function gameTick(state: GameState): GameState {
  if (state.isPaused || state.isGameOver) {
    return state;
  }

  let newState = { ...state };

  for (let i = 0; i < state.speed; i++) {
    newState = advanceTime(newState);
    newState = updateCitizens(newState);
    newState = updateBuildings(newState);
    newState = trySpawnBuildings(newState);
  }

  newState = updateStatistics(newState);
  newState = checkGameOver(newState);

  return newState;
}

function advanceTime(state: GameState): GameState {
  let { minute, hour, day } = state.date;

  minute += TICKS_PER_MINUTE;

  if (minute >= MINUTES_PER_HOUR) {
    minute = 0;
    hour++;

    if (hour >= HOURS_PER_DAY) {
      hour = 0;
      day++;
      state = collectDailyTaxes(state);
    }
  }

  return {
    ...state,
    date: { minute, hour, day }
  };
}

function collectDailyTaxes(state: GameState): GameState {
  let totalTax = 0;
  let totalExpenses = 0;

  state.buildings.forEach(building => {
    const config = getBuildingConfig(building.type);
    totalTax += config.taxRate * building.population;
    totalExpenses += config.maintenanceCost;
  });

  const netIncome = totalTax - totalExpenses;

  return addNotification(
    {
      ...state,
      money: state.money + netIncome,
      statistics: {
        ...state.statistics,
        dailyTaxRevenue: totalTax,
        dailyExpenses: totalExpenses
      }
    },
    `每日结算: +¥${totalTax} -¥${totalExpenses} = ¥${netIncome}`,
    netIncome >= 0 ? 'success' : 'warning'
  );
}

function updateCitizens(state: GameState): GameState {
  const currentHour = state.date.hour;

  const newCitizens = state.citizens.map(citizen => {
    const newCitizen = { ...citizen };
    const schedule = citizen.schedule;

    if (currentHour < schedule.wakeUp) {
      schedule.currentActivity = ActivityType.SLEEPING;
    } else if (currentHour < schedule.leaveHome) {
      schedule.currentActivity = ActivityType.AT_HOME;
    } else if (currentHour < schedule.startWork) {
      schedule.currentActivity = ActivityType.COMMUTING_TO_WORK;
    } else if (currentHour < schedule.endWork) {
      schedule.currentActivity = ActivityType.WORKING;
    } else if (currentHour < schedule.arriveHome) {
      schedule.currentActivity = ActivityType.COMMUTING_HOME;
    } else if (currentHour < schedule.sleep) {
      schedule.currentActivity = ActivityType.AT_HOME;
    } else {
      schedule.currentActivity = ActivityType.SLEEPING;
    }

    return newCitizen;
  });

  let totalPopulation = 0;
  state.buildings.forEach(building => {
    totalPopulation += building.population;
  });

  const totalSatisfaction = newCitizens.reduce((sum, c) => sum + c.satisfaction, 0);
  const avgSatisfaction = newCitizens.length > 0 ? totalSatisfaction / newCitizens.length : 70;

  return {
    ...state,
    citizens: newCitizens,
    population: newCitizens.length,
    averageSatisfaction: avgSatisfaction
  };
}

function updateBuildings(state: GameState): GameState {
  const newBuildings = new Map(state.buildings);

  newBuildings.forEach((building) => {
    const config = getBuildingConfig(building.type);

    const hasRoadAccess = findNearestRoad(building.position, state.map) !== null;
    const canGrow = hasRoadAccess && building.hasWater && building.hasElectricity;

    if (canGrow && building.population < building.maxPopulation) {
      building.growthProgress += 0.1;
      if (building.growthProgress >= 100) {
        building.growthProgress = 0;
        building.population = Math.min(building.population + 1, building.maxPopulation);
      }
    }

    let satisfaction = 50;
    if (hasRoadAccess) satisfaction += 10;
    if (building.hasWater) satisfaction += 10;
    if (building.hasElectricity) satisfaction += 10;
    satisfaction -= state.map[building.position.y][building.position.x].pollution;
    satisfaction = Math.max(0, Math.min(100, satisfaction));
    building.satisfaction = satisfaction;

    building.taxRevenue = config.taxRate * building.population;
  });

  return {
    ...state,
    buildings: newBuildings
  };
}

function trySpawnBuildings(state: GameState): GameState {
  let newState = state;

  state.map.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (
        (tile.type === TileType.RESIDENTIAL ||
          tile.type === TileType.COMMERCIAL ||
          tile.type === TileType.INDUSTRIAL) &&
        !tile.buildingId &&
        Math.random() < 0.001
      ) {
        newState = spawnBuilding(newState, { x, y });
      }
    });
  });

  return newState;
}

function updateStatistics(state: GameState): GameState {
  const { statistics } = state;

  if (state.date.minute === 0) {
    const newPopulationHistory = [...statistics.populationHistory, state.population].slice(-100);
    const newMoneyHistory = [...statistics.moneyHistory, state.money].slice(-100);
    const newSatisfactionHistory = [...statistics.satisfactionHistory, state.averageSatisfaction].slice(-100);

    const avgLandValue = state.map.flat().reduce((sum, tile) => sum + tile.landValue, 0) / (state.mapSize.width * state.mapSize.height);
    const newLandValueHistory = [...statistics.landValueHistory, avgLandValue].slice(-100);

    return {
      ...state,
      statistics: {
        ...statistics,
        populationHistory: newPopulationHistory,
        moneyHistory: newMoneyHistory,
        satisfactionHistory: newSatisfactionHistory,
        landValueHistory: newLandValueHistory
      }
    };
  }

  return state;
}

function checkGameOver(state: GameState): GameState {
  if (state.money < -10000) {
    return addNotification(
      {
        ...state,
        isGameOver: true,
        isPaused: true
      },
      '游戏结束：城市破产了！',
      'error'
    );
  }
  return state;
}

export function setTool(state: GameState, tool: string): GameState {
  return {
    ...state,
    selectedTool: tool as any,
    selectedPosition: null
  };
}

export function setPaused(state: GameState, isPaused: boolean): GameState {
  return {
    ...state,
    isPaused
  };
}

export function setSpeed(state: GameState, speed: number): GameState {
  return {
    ...state,
    speed: Math.max(1, Math.min(5, speed))
  };
}

export function selectPosition(state: GameState, position: Position | null): GameState {
  return {
    ...state,
    selectedPosition: position
  };
}

export function updateCamera(state: GameState, x: number, y: number, zoom: number): GameState {
  return {
    ...state,
    camera: {
      x,
      y,
      zoom: Math.max(0.5, Math.min(2, zoom))
    }
  };
}
