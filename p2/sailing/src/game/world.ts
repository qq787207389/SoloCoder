import { Biome, Island, ResourceKey } from "./types";
import { RNG, fbm } from "./rng";

const BIOME_WEIGHTS: { biome: Biome; weight: number }[] = [
  { biome: "palm", weight: 30 },
  { biome: "lagoon", weight: 12 },
  { biome: "reef", weight: 18 },
  { biome: "volcano", weight: 10 },
  { biome: "iceberg", weight: 10 },
  { biome: "wreck", weight: 10 },
  { biome: "tower", weight: 10 },
];

function pickBiome(rng: RNG, latitude: number): Biome {
  let weights = BIOME_WEIGHTS.map((b) => ({ ...b }));
  if (latitude > 0.6) {
    weights = weights.map((w) =>
      w.biome === "iceberg" ? { ...w, weight: w.weight * 3 } : w
    );
  } else if (latitude < 0.4) {
    weights = weights.map((w) =>
      w.biome === "volcano" || w.biome === "palm"
        ? { ...w, weight: w.weight * 1.8 }
        : w
    );
  }
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let r = rng.next() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.biome;
  }
  return "palm";
}

function biomeResources(biome: Biome, rng: RNG): Partial<Record<ResourceKey, number>> {
  const r: Partial<Record<ResourceKey, number>> = {};
  const add = (k: ResourceKey, min: number, max: number) => {
    r[k] = (r[k] || 0) + rng.int(min, max);
  };
  switch (biome) {
    case "palm":
      add("wood", 6, 12);
      add("coconut", 4, 8);
      add("palm_fruit", 3, 6);
      add("vine", 2, 5);
      add("herb", 1, 3);
      break;
    case "volcano":
      add("stone", 6, 12);
      add("obsidian", 2, 5);
      add("iron", 3, 7);
      break;
    case "reef":
      add("fish", 3, 6);
      add("shell", 3, 6);
      add("water", 2, 4);
      break;
    case "iceberg":
      add("ice", 5, 10);
      add("stone", 2, 4);
      add("fish", 2, 4);
      break;
    case "wreck":
      add("iron", 3, 6);
      add("rope", 2, 5);
      add("wood", 4, 8);
      add("clue", 1, 1);
      break;
    case "tower":
      add("clue", 1, 1);
      add("stone", 3, 6);
      add("rope", 1, 3);
      break;
    case "lagoon":
      add("fish", 2, 5);
      add("water", 4, 8);
      add("vine", 2, 4);
      break;
  }
  return r;
}

export interface Region {
  x: number;
  y: number;
  size: number;
}

export function generateIslands(seed: number, count = 180): Island[] {
  const rng = new RNG(seed);
  const islands: Island[] = [];
  const worldSize = 12000;
  const minDist = 360;

  let tries = 0;
  while (islands.length < count && tries < count * 20) {
    tries++;
    const x = rng.range(-worldSize, worldSize);
    const y = rng.range(-worldSize, worldSize);
    let ok = true;
    for (const i of islands) {
      const dx = i.x - x;
      const dy = i.y - y;
      if (dx * dx + dy * dy < minDist * minDist) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const latitude = (y + worldSize) / (worldSize * 2);
    const biome = pickBiome(rng, latitude);
    const radius = rng.range(
      biome === "reef" ? 140 : biome === "iceberg" ? 160 : 110,
      biome === "volcano" ? 240 : 200
    );
    const hasClue = biome === "wreck" || biome === "tower" || rng.chance(0.08);
    islands.push({
      id: `isl_${islands.length}`,
      x,
      y,
      radius,
      biome,
      discovered: false,
      visited: false,
      resources: biomeResources(biome, rng),
      hasCamp: false,
      hasClue,
      seed: rng.int(0, 1e9),
    });
  }
  return islands;
}

export function oceanHeight(x: number, y: number, seed: number): number {
  const n = fbm(x / 1800, y / 1800, seed, 3);
  return n;
}
