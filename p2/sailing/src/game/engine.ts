import { RNG } from "./rng";
import {
  BIOME_LABEL,
  Island,
  LogEntry,
  Pirate,
  RESOURCE_LABEL,
  ResourceKey,
  Ship,
  UpgradeKey,
  WeatherState,
  WeatherType,
  Whale,
  WorldState,
} from "./types";
import { addInventory, log, payInventory } from "./init";

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  row: boolean;
  toggleSail: boolean;
  toggleAnchor: boolean;
  interact: boolean;
}

const TWO_PI = Math.PI * 2;
const DAY_LENGTH = 480;

export function stepWorld(w: WorldState, dt: number, input: InputState) {
  if (w.dead || w.rescued) return;

  w.time += dt;
  w.timeOfDay = (w.timeOfDay + dt / DAY_LENGTH) % 1;
  const newDay = Math.floor(w.time / DAY_LENGTH) + 1;
  if (newDay !== w.day) {
    w.day = newDay;
    log(w, `第 ${w.day} 天，太阳升起。`, "info");
  }

  if (input.toggleSail) {
    w.ship.sail = w.ship.sail > 0.1 ? 0 : w.ship.upgrades.big_sail ? 1 : 0.6;
    log(w, w.ship.sail > 0.1 ? "升帆。" : "收帆。", "info");
  }
  if (input.toggleAnchor) {
    w.ship.anchored = !w.ship.anchored;
    log(w, w.ship.anchored ? "抛锚。" : "起锚。", "info");
  }

  stepWeather(w, dt);
  stepShip(w, dt, input);
  stepSurvival(w, dt);
  stepIslands(w, dt);
  stepPirates(w, dt);
  stepWhales(w, dt);
  stepFloats(w, dt);
  checkDeath(w);
}

function stepWeather(w: WorldState, dt: number) {
  const weather = w.weather;
  weather.transition = Math.min(1, weather.transition + dt * 0.04);
  if (weather.transition >= 1 && Math.random() < dt * 0.02) {
    weather.transition = 0;
    const next = rollWeather(weather.type, w.day);
    weather.type = next;
    log(w, weatherMsg(next), "warn");
  }
  const base = weatherBase(weather.type);
  weather.windDir += (Math.random() - 0.5) * 0.3 * dt;
  weather.windSpeed = lerp(weather.windSpeed, base.wind, 0.02);
  weather.waveHeight = lerp(weather.waveHeight, base.wave, 0.02);
  weather.fogDensity = lerp(weather.fogDensity, base.fog, 0.02);
}

function weatherBase(t: WeatherType) {
  switch (t) {
    case "clear":
      return { wind: 3, wave: 0.2, fog: 0 };
    case "cloudy":
      return { wind: 5, wave: 0.4, fog: 0 };
    case "rain":
      return { wind: 7, wave: 0.8, fog: 0.1 };
    case "storm":
      return { wind: 12, wave: 1.6, fog: 0 };
    case "fog":
      return { wind: 1.5, wave: 0.2, fog: 0.85 };
  }
}

function rollWeather(prev: WeatherType, day: number): WeatherType {
  const r = Math.random();
  if (prev === "storm") return r < 0.5 ? "rain" : "cloudy";
  if (day < 2) return r < 0.7 ? "clear" : "cloudy";
  if (r < 0.35) return "clear";
  if (r < 0.6) return "cloudy";
  if (r < 0.8) return "rain";
  if (r < 0.92) return "fog";
  return "storm";
}

function weatherMsg(t: WeatherType): string {
  switch (t) {
    case "clear":
      return "天空放晴，海面平静。";
    case "cloudy":
      return "乌云渐起，风向正在改变。";
    case "rain":
      return "下雨了，注意防滑与视野。";
    case "storm":
      return "暴风雨来袭！立即收帆或寻找环礁躲避！";
    case "fog":
      return "浓雾笼罩海面，视野受限。";
  }
}

function stepShip(w: WorldState, dt: number, input: InputState) {
  const s = w.ship;
  if (s.anchored) {
    s.vx *= 0.9;
    s.vy *= 0.9;
  } else {
    const rudderInput = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    s.rudder = lerp(s.rudder, rudderInput, 0.12);
    s.heading += s.rudder * dt * 1.2 * (0.4 + Math.min(1, s.speed / 3));

    const windForce = w.weather.windSpeed * s.sail;
    const windAng = w.weather.windDir - s.heading;
    const sailFactor = Math.max(0, Math.cos(windAng));
    let accel = windForce * sailFactor * 0.08;

    if (input.row) {
      if (w.stats.stamina > 0.5) {
        accel += 0.25;
        w.stats.stamina = Math.max(0, w.stats.stamina - dt * 3);
      }
    }
    if (s.upgrades.engine && input.up) {
      if (w.stats.stamina > 0.2) {
        accel += 0.35;
      }
    }

    const oceanDrift = 0.05;
    s.vx += Math.cos(w.weather.windDir + Math.PI / 2) * oceanDrift * dt;
    s.vy += Math.sin(w.weather.windDir + Math.PI / 2) * oceanDrift * dt;

    const maxSpeed = 4 + (s.upgrades.big_sail ? 2 : 0) + (s.upgrades.engine ? 2 : 0);
    const forwardX = Math.cos(s.heading);
    const forwardY = Math.sin(s.heading);
    s.vx += forwardX * accel * dt;
    s.vy += forwardY * accel * dt;

    const drag = 0.9 + (s.upgrades.hull_plate ? -0.03 : 0) + countUpgradeDrag(s);
    const damp = Math.pow(0.995, dt * 60 * drag);
    s.vx *= damp;
    s.vy *= damp;
    s.speed = Math.hypot(s.vx, s.vy);
    if (s.speed > maxSpeed) {
      s.vx = (s.vx / s.speed) * maxSpeed;
      s.vy = (s.vy / s.speed) * maxSpeed;
      s.speed = maxSpeed;
    }
    s.x += s.vx * dt * 10;
    s.y += s.vy * dt * 10;
  }

  const wave = w.weather.waveHeight;
  if (wave > 1.2 && Math.random() < dt * 0.3 * (wave - 1.2)) {
    s.hull -= 0.8;
    if (Math.random() < 0.15) log(w, "巨浪拍打着船体。", "warn");
  }
  if (s.hull < 0) s.hull = 0;
}

function countUpgradeDrag(s: Ship) {
  let d = 0;
  (Object.keys(s.upgrades) as UpgradeKey[]).forEach((k) => {
    if (s.upgrades[k]) d += 0.02;
  });
  return d;
}

function stepSurvival(w: WorldState, dt: number) {
  const rate = dt / 8;
  w.stats.hunger = Math.max(0, w.stats.hunger - rate * 0.6);
  w.stats.thirst = Math.max(0, w.stats.thirst - rate * 0.9);
  if (w.weather.type === "storm" || w.weather.type === "rain") {
    w.stats.warmth = Math.max(0, w.stats.warmth - rate * 0.3);
  } else {
    w.stats.warmth = Math.min(100, w.stats.warmth + rate * 0.1);
  }

  if (w.onIslandId) {
    w.stats.stamina = Math.min(100, w.stats.stamina + dt * 2.5);
  } else if (w.ship.anchored) {
    w.stats.stamina = Math.min(100, w.stats.stamina + dt * 1.5);
  } else if (!w.ship.rowing) {
    w.stats.stamina = Math.min(100, w.stats.stamina + dt * 0.4);
  } else {
    w.stats.stamina = Math.max(0, w.stats.stamina - dt * 0.3);
  }
  if (w.stats.thirst <= 0) w.stats.injured += dt * 2;
  if (w.stats.hunger <= 0) w.stats.injured += dt * 1.5;
  if (w.stats.warmth <= 0) w.stats.injured += dt * 1.5;
  if (w.stats.injured > 0 && w.stats.warmth > 50 && w.stats.thirst > 30 && w.stats.hunger > 30) {
    w.stats.injured = Math.max(0, w.stats.injured - dt * 0.8);
  }
  if (w.stats.injured >= 100) w.dead = true;

  if (w.ship.upgrades.fishing_net && !w.ship.anchored && Math.random() < dt * 0.08) {
    addInventory(w.inventory, { fish: 1 });
    log(w, "拖网捕获到一条鱼。", "good");
  }
}

function stepIslands(w: WorldState, dt: number) {
  w.nearbyIslandId = null;
  const s = w.ship;
  for (const isl of w.islands) {
    const dx = isl.x - s.x;
    const dy = isl.y - s.y;
    const d = Math.hypot(dx, dy);
    if (d < isl.radius + 200 && !isl.discovered) {
      isl.discovered = true;
      log(w, `发现岛屿：${BIOME_LABEL[isl.biome]}`, "good");
    }
    if (d < isl.radius + 80) {
      w.nearbyIslandId = isl.id;
    }
    if (isl.biome === "reef" && d < isl.radius) {
      if (Math.random() < dt * 0.4) {
        w.ship.hull -= 1;
      }
    }
  }
}

function stepPirates(w: WorldState, dt: number) {
  if (w.pirates.length < 1 && Math.random() < dt * 0.01 && w.day >= 3) {
    const ang = Math.random() * TWO_PI;
    const dist = 1500;
    w.pirates.push({
      x: w.ship.x + Math.cos(ang) * dist,
      y: w.ship.y + Math.sin(ang) * dist,
      heading: ang + Math.PI,
      speed: 2.5,
      hp: 60,
      active: true,
    });
    log(w, "海平面上出现一艘可疑小船……", "warn");
  }
  for (const p of w.pirates) {
    if (!p.active) continue;
    const dx = w.ship.x - p.x;
    const dy = w.ship.y - p.y;
    const d = Math.hypot(dx, dy);
    p.heading = Math.atan2(dy, dx);
    if (d > 80) {
      p.x += Math.cos(p.heading) * p.speed * dt * 10;
      p.y += Math.sin(p.heading) * p.speed * dt * 10;
    } else {
      if (Math.random() < dt * 0.8) {
        w.ship.hull -= 1.5;
        log(w, "海盗撞击你的船体！", "bad");
      }
    }
    if (d > 2500) p.active = false;
  }
  w.pirates = w.pirates.filter((p) => p.active);
}

function stepWhales(w: WorldState, dt: number) {
  if (w.whales.length < 2 && Math.random() < dt * 0.015) {
    const ang = Math.random() * TWO_PI;
    const dist = 900;
    w.whales.push({
      x: w.ship.x + Math.cos(ang) * dist,
      y: w.ship.y + Math.sin(ang) * dist,
      heading: Math.random() * TWO_PI,
      speed: 1.2,
      timer: 15 + Math.random() * 10,
    });
    log(w, "远处海面翻涌——有鲸群经过。", "info");
  }
  for (const wh of w.whales) {
    wh.timer -= dt;
    wh.x += Math.cos(wh.heading) * wh.speed * dt * 10;
    wh.y += Math.sin(wh.heading) * wh.speed * dt * 10;
  }
  w.whales = w.whales.filter((wh) => wh.timer > 0);
}

function stepFloats(w: WorldState, dt: number) {
  const s = w.ship;
  const dx = w.weather.windDir + Math.PI / 2;
  for (const f of w.floats) {
    f.x += Math.cos(dx) * 0.2 * dt;
    f.y += Math.sin(dx) * 0.2 * dt;
  }
  for (const f of w.floats) {
    const d = Math.hypot(f.x - s.x, f.y - s.y);
    if (d < 30) {
      addInventory(w.inventory, { [f.res]: f.amount });
      log(w, `打捞了 ${RESOURCE_LABEL[f.res]} x${f.amount}`, "good");
      f.x = 999999;
    }
  }
  w.floats = w.floats.filter((f) => f.x < 10000);
}

function checkDeath(w: WorldState) {
  if (w.ship.hull <= 0) {
    w.dead = true;
    log(w, "船体沉没……你被大海吞没。", "bad");
  }
}

export function attemptLand(w: WorldState): boolean {
  if (!w.nearbyIslandId) return false;
  w.onIslandId = w.nearbyIslandId;
  const isl = w.islands.find((i) => i.id === w.nearbyIslandId)!;
  isl.visited = true;
  log(w, `登上了${BIOME_LABEL[isl.biome]}。`, "info");
  return true;
}

export function depart(w: WorldState) {
  if (!w.onIslandId) return;
  w.onIslandId = null;
  log(w, "驶离了岛屿。", "info");
}

export function collectResource(w: WorldState, key: ResourceKey, amount = 1): boolean {
  if (!w.onIslandId) return false;
  const isl = w.islands.find((i) => i.id === w.onIslandId);
  if (!isl) return false;
  const have = isl.resources[key] || 0;
  if (have <= 0) return false;
  isl.resources[key] = have - amount;
  addInventory(w.inventory, { [key]: amount });
  log(w, `采集 ${RESOURCE_LABEL[key]} x${amount}`, "good");
  return true;
}

export function drinkWater(w: WorldState) {
  if ((w.inventory.water || 0) <= 0) return log(w, "没有淡水。", "warn");
  w.inventory.water = (w.inventory.water || 0) - 1;
  w.stats.thirst = Math.min(100, w.stats.thirst + 40);
  log(w, "饮用了一口淡水。", "good");
}

export function distillWater(w: WorldState) {
  if ((w.inventory.wood || 0) < 1) return log(w, "蒸馏需要木材来生火。", "warn");
  w.inventory.wood = (w.inventory.wood || 0) - 1;
  addInventory(w.inventory, { water: 2 });
  log(w, "蒸馏了 2 份淡水。", "good");
}

export function eat(w: WorldState, k: ResourceKey) {
  if ((w.inventory[k] || 0) <= 0) return log(w, "没有食物。", "warn");
  w.inventory[k] = (w.inventory[k] || 0) - 1;
  const val = k === "fish" ? 18 : k === "coconut" ? 20 : 15;
  const stamBoost = k === "fish" ? 12 : k === "coconut" ? 10 : 8;
  w.stats.hunger = Math.min(100, w.stats.hunger + val);
  w.stats.stamina = Math.min(100, w.stats.stamina + stamBoost);
  log(w, "食用了 " + RESOURCE_LABEL[k] + "。", "good");
}

export function fish(w: WorldState) {
  if (w.onIslandId) return log(w, "请先下水再捕鱼。", "warn");
  if (w.ship.anchored && Math.random() < 0.6) {
    addInventory(w.inventory, { fish: 1 });
    log(w, "抛网捕到一条鱼！", "good");
  } else if (Math.random() < 0.25) {
    addInventory(w.inventory, { fish: 1 });
    log(w, "在浪中艰难地捕到一条鱼。", "good");
  } else {
    log(w, "一无所获。", "warn");
  }
}

export function repair(w: WorldState) {
  const needWood = 2;
  if ((w.inventory.wood || 0) < needWood) return log(w, "修补船体需要木材。", "warn");
  w.inventory.wood = (w.inventory.wood || 0) - needWood;
  w.ship.hull = Math.min(w.ship.maxHull, w.ship.hull + 20);
  log(w, "船体修补完毕，耐久 +20。", "good");
}

export function bandage(w: WorldState) {
  const need = 1;
  if ((w.inventory.herb || 0) < need) return log(w, "需要草药。", "warn");
  w.inventory.herb = (w.inventory.herb || 0) - need;
  w.stats.injured = Math.max(0, w.stats.injured - 30);
  log(w, "伤口包扎好了。", "good");
}

export function readClue(w: WorldState) {
  if (!w.onIslandId) return;
  const isl = w.islands.find((i) => i.id === w.onIslandId);
  if (!isl || !isl.hasClue || (isl.resources.clue || 0) <= 0) return;
  isl.resources.clue = 0;
  isl.hasClue = false;
  w.cluesFound += 1;
  log(w, `拼凑出线索（${w.cluesFound}/${w.totalClues}）：向东北方向的高塔前进。`, "good");
  w.rescueSignal = true;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
