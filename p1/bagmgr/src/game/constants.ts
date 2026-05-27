export const CELL_SIZE = 48;
export const CELL_GAP = 2;
export const INVENTORY_PADDING = 16;

export const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#52b788',
  rare: '#48cae4',
  epic: '#9d4edd',
  legendary: '#c9a227',
};

export const RARITY_WEIGHTS: Record<string, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#e63946',
  ice: '#48cae4',
  lightning: '#ffd60a',
  poison: '#52b788',
  holy: '#ffd6a5',
  dark: '#9d4edd',
  none: '#9ca3af',
};

export const ITEM_TYPE_COLORS: Record<string, string> = {
  weapon: '#e63946',
  armor: '#48cae4',
  potion: '#52b788',
  ring: '#9d4edd',
  gem: '#c9a227',
  food: '#ffd6a5',
  material: '#9ca3af',
  scroll: '#f4a261',
};

export const ELEMENT_NAMES: Record<string, string> = {
  fire: '火焰',
  ice: '冰霜',
  lightning: '雷电',
  poison: '剧毒',
  holy: '神圣',
  dark: '暗影',
  none: '无',
};

export const ITEM_TYPE_NAMES: Record<string, string> = {
  weapon: '武器',
  armor: '护甲',
  potion: '药水',
  ring: '戒指',
  gem: '宝石',
  food: '食物',
  material: '材料',
  scroll: '卷轴',
};

export const RARITY_NAMES: Record<string, string> = {
  common: '普通',
  uncommon: '精良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const STAMINA_COST_PER_MOVE = 1;
export const STAMINA_COMBAT_REGEN = 2;
export const CAMP_STAMINA_REGEN = 10;

export const MAX_FLOORS = 10;
export const ENEMY_COUNT_BASE = 3;
export const SHOP_CHANCE = 0.15;
export const ALTAR_CHANCE = 0.1;
export const TREASURE_CHANCE = 0.12;

export const BASE_DAMAGE_VARIANCE = 0.15;
export const CRIT_MULTIPLIER = 1.5;

export const ADJACENCY_BOOSTS = {
  fire_gem_weapon: { attack: 5, description: '火焰附魔：攻击力+5' },
  ice_gem_weapon: { attack: 3, description: '冰霜附魔：攻击力+3，减速效果' },
  lightning_gem_weapon: { attack: 4, description: '雷电附魔：攻击力+4，连锁效果' },
  poison_gem_weapon: { attack: 2, description: '剧毒附魔：攻击力+2，持续伤害' },
  holy_gem_weapon: { attack: 6, description: '神圣附魔：攻击力+6，对亡灵额外伤害' },
  dark_gem_weapon: { attack: 4, description: '暗影附魔：攻击力+4，吸血效果' },
  ring_armor: { defense: 3, description: '戒指共鸣：防御+3' },
  potion_food: { hp: 5, description: '美食搭配：回复+5' },
  scroll_gem: { mana: 10, description: '奥术共振：法力+10' },
};
