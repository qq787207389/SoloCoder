export type Biome = "palm" | "volcano" | "reef" | "iceberg" | "wreck" | "tower" | "lagoon";

export type WeatherType = "clear" | "cloudy" | "rain" | "storm" | "fog";

export interface Island {
  id: string;
  x: number;
  y: number;
  radius: number;
  biome: Biome;
  discovered: boolean;
  visited: boolean;
  resources: Partial<Record<ResourceKey, number>>;
  hasCamp: boolean;
  hasClue: boolean;
  seed: number;
}

export type ResourceKey =
  | "wood"
  | "palm_fruit"
  | "coconut"
  | "herb"
  | "stone"
  | "iron"
  | "obsidian"
  | "fish"
  | "water"
  | "ice"
  | "clue"
  | "shell"
  | "vine"
  | "rope";

export interface Ship {
  x: number;
  y: number;
  heading: number;
  speed: number;
  vx: number;
  vy: number;
  rudder: number;
  sail: number;
  anchored: boolean;
  rowing: boolean;
  hull: number;
  maxHull: number;
  upgrades: Record<UpgradeKey, boolean>;
  hp: number;
  maxHp: number;
}

export type UpgradeKey =
  | "mast"
  | "big_sail"
  | "hull_plate"
  | "engine"
  | "fishing_net"
  | "freezer"
  | "radio"
  | "sonar"
  | "forge";

export interface PlayerStats {
  hunger: number;
  thirst: number;
  warmth: number;
  stamina: number;
  injured: number;
}

export interface WeatherState {
  type: WeatherType;
  windDir: number;
  windSpeed: number;
  waveHeight: number;
  fogDensity: number;
  transition: number;
}

export interface Pirate {
  x: number;
  y: number;
  heading: number;
  speed: number;
  hp: number;
  active: boolean;
}

export interface Whale {
  x: number;
  y: number;
  heading: number;
  speed: number;
  timer: number;
}

export interface FloatingItem {
  x: number;
  y: number;
  res: ResourceKey;
  amount: number;
}

export interface LogEntry {
  time: number;
  msg: string;
  tone: "info" | "warn" | "good" | "bad";
}

export interface WorldState {
  seed: number;
  time: number;
  day: number;
  timeOfDay: number;
  islands: Island[];
  ship: Ship;
  stats: PlayerStats;
  weather: WeatherState;
  inventory: Partial<Record<ResourceKey, number>>;
  pirates: Pirate[];
  whales: Whale[];
  floats: FloatingItem[];
  logs: LogEntry[];
  nearbyIslandId: string | null;
  onIslandId: string | null;
  rescued: boolean;
  dead: boolean;
  cluesFound: number;
  totalClues: number;
  rescueX: number;
  rescueY: number;
  rescueSignal: boolean;
}

export const RESOURCE_LABEL: Record<ResourceKey, string> = {
  wood: "木材",
  palm_fruit: "棕榈果",
  coconut: "椰子",
  herb: "草药",
  stone: "石头",
  iron: "铁矿石",
  obsidian: "黑曜石",
  fish: "鱼",
  water: "淡水",
  ice: "浮冰",
  clue: "日记残页",
  shell: "贝壳",
  vine: "藤蔓",
  rope: "绳索",
};

export const UPGRADE_LABEL: Record<UpgradeKey, string> = {
  mast: "桅杆",
  big_sail: "大三角帆",
  hull_plate: "铁制船壳",
  engine: "便携式引擎",
  fishing_net: "拖网",
  freezer: "冷冻舱",
  radio: "无线电",
  sonar: "水下探测器",
  forge: "便携锻炉",
};

export const UPGRADE_COST: Record<UpgradeKey, Partial<Record<ResourceKey, number>>> = {
  mast: { wood: 12, rope: 3 },
  big_sail: { wood: 6, vine: 6, rope: 2 },
  hull_plate: { iron: 10, wood: 8 },
  engine: { iron: 15, stone: 6 },
  fishing_net: { rope: 4, vine: 6 },
  freezer: { iron: 8, ice: 4 },
  radio: { iron: 6, shell: 2 },
  sonar: { iron: 4, shell: 3 },
  forge: { stone: 8, iron: 4 },
};

export const BIOME_LABEL: Record<Biome, string> = {
  palm: "棕榈树岛",
  volcano: "火山岛",
  reef: "暗礁区",
  iceberg: "浮冰山",
  wreck: "沉船残骸",
  tower: "废弃瞭望塔",
  lagoon: "环礁",
};
