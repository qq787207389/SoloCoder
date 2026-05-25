import {
  LogEntry,
  ResourceKey,
  Ship,
  UPGRADE_COST,
  UpgradeKey,
  WorldState,
} from "./types";
import { generateIslands } from "./world";
import { RNG } from "./rng";

const INITIAL_INV: Partial<Record<ResourceKey, number>> = {
  wood: 2,
  coconut: 2,
  water: 3,
  fish: 1,
  rope: 1,
};

export function createInitialShip(): Ship {
  return {
    x: 0,
    y: 0,
    heading: 0,
    speed: 0,
    vx: 0,
    vy: 0,
    rudder: 0,
    sail: 0.3,
    anchored: false,
    rowing: false,
    hull: 60,
    maxHull: 60,
    upgrades: {
      mast: false,
      big_sail: false,
      hull_plate: false,
      engine: false,
      fishing_net: false,
      freezer: false,
      radio: false,
      sonar: false,
      forge: false,
    },
    hp: 100,
    maxHp: 100,
  };
}

export function createInitialWorld(seed = Date.now() & 0x7fffffff): WorldState {
  const islands = generateIslands(seed, 180);
  const totalClues = islands.filter((i) => i.hasClue).length;
  const rescue = islands.find((i) => i.biome === "tower") || islands[0];
  return {
    seed,
    time: 0,
    day: 1,
    timeOfDay: 0.35,
    islands,
    ship: createInitialShip(),
    stats: {
      hunger: 80,
      thirst: 80,
      warmth: 90,
      stamina: 100,
      injured: 0,
    },
    weather: {
      type: "clear",
      windDir: Math.PI * 0.25,
      windSpeed: 4,
      waveHeight: 0.3,
      fogDensity: 0,
      transition: 1,
    },
    inventory: { ...INITIAL_INV },
    pirates: [],
    whales: [],
    floats: spawnFloats(seed, 200),
    logs: [
      { time: 0, msg: "你在一艘破木筏上醒来，四周是一望无际的海洋……", tone: "info" },
      { time: 0, msg: "使用 WASD 控制方向，空格划桨加速，F 升/收帆。", tone: "info" },
    ],
    nearbyIslandId: null,
    onIslandId: null,
    rescued: false,
    dead: false,
    cluesFound: 0,
    totalClues,
    rescueX: rescue.x,
    rescueY: rescue.y,
    rescueSignal: false,
  };
}

function spawnFloats(seed: number, count: number) {
  const rng = new RNG(seed ^ 0xabcdef);
  const floats: WorldState["floats"] = [];
  for (let i = 0; i < count; i++) {
    const resList: ResourceKey[] = ["wood", "wood", "rope", "vine", "coconut", "shell"];
    const res = rng.pick(resList);
    floats.push({
      x: rng.range(-8000, 8000),
      y: rng.range(-8000, 8000),
      res,
      amount: rng.int(1, 3),
    });
  }
  return floats;
}

export function log(w: WorldState, msg: string, tone: LogEntry["tone"] = "info") {
  w.logs.unshift({ time: w.time, msg, tone });
  if (w.logs.length > 60) w.logs.pop();
}

export function hasInventory(inv: Partial<Record<ResourceKey, number>>, cost: Partial<Record<ResourceKey, number>>): boolean {
  for (const k in cost) {
    if ((inv[k as ResourceKey] || 0) < (cost[k as ResourceKey] || 0)) return false;
  }
  return true;
}

export function payInventory(inv: Partial<Record<ResourceKey, number>>, cost: Partial<Record<ResourceKey, number>>) {
  for (const k in cost) {
    inv[k as ResourceKey] = (inv[k as ResourceKey] || 0) - (cost[k as ResourceKey] || 0);
  }
}

export function addInventory(inv: Partial<Record<ResourceKey, number>>, gain: Partial<Record<ResourceKey, number>>) {
  for (const k in gain) {
    inv[k as ResourceKey] = (inv[k as ResourceKey] || 0) + (gain[k as ResourceKey] || 0);
  }
}

export function tryUpgrade(w: WorldState, key: UpgradeKey): boolean {
  if (w.ship.upgrades[key]) return false;
  const cost = UPGRADE_COST[key];
  if (!hasInventory(w.inventory, cost)) {
    log(w, "资源不足，无法升级：" + key, "warn");
    return false;
  }
  payInventory(w.inventory, cost);
  w.ship.upgrades[key] = true;
  if (key === "hull_plate") {
    w.ship.maxHull = 120;
    w.ship.hull = Math.min(w.ship.maxHull, w.ship.hull + 60);
  }
  log(w, "已安装升级：" + key, "good");
  return true;
}
