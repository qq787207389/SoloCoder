import type { Room, Connection, DungeonFloor, Enemy, ShopData, AltarData, TreasureData } from './types';
import { getRandomItemIdByRarity } from './items';
import { ENEMY_COUNT_BASE, SHOP_CHANCE, ALTAR_CHANCE, TREASURE_CHANCE } from './constants';

const DUNGEON_THEMES = [
  { name: '幽暗洞穴', bgColor: '#1a1a2e', accent: '#2d2d44', enemyTypes: ['goblin', 'bat', 'spider'] },
  { name: '古老墓穴', bgColor: '#1a1a1a', accent: '#3d3d3d', enemyTypes: ['skeleton', 'zombie', 'ghost'] },
  { name: '熔岩洞窟', bgColor: '#2d1a1a', accent: '#4a2020', enemyTypes: ['fire_elemental', 'lava_slime', 'magmin'] },
  { name: '冰霜洞窟', bgColor: '#1a2d3d', accent: '#2d4a5a', enemyTypes: ['ice_elemental', 'frost_wolf', 'snow_imp'] },
  { name: '迷雾森林', bgColor: '#1a2d1a', accent: '#2d4a2d', enemyTypes: ['treant', 'mushroom', 'wolf'] },
];

const ENEMY_TEMPLATES: Record<string, Omit<Enemy, 'id'>> = {
  goblin: {
    name: '哥布林',
    hp: 30, maxHp: 30, attack: 5, defense: 2,
    skills: [{ name: '挥砍', damage: 5 }],
    loot: ['iron_sword', 'short_sword', 'topaz', 'ring_of_guardian'],
    lootCount: { min: 1, max: 2 },
    sprite: '👺', color: '#52b788',
  },
  bat: {
    name: '巨型蝙蝠',
    hp: 20, maxHp: 20, attack: 4, defense: 1,
    skills: [{ name: '啃咬', damage: 4 }, { name: '音波', damage: 3 }],
    loot: ['topaz', 'diamond'],
    lootCount: { min: 0, max: 1 },
    sprite: '🦇', color: '#6b7280',
  },
  spider: {
    name: '巨型蜘蛛',
    hp: 35, maxHp: 35, attack: 6, defense: 3,
    skills: [{ name: '毒牙', damage: 6 }],
    loot: ['iron_sword', 'chain_mail', 'topaz'],
    lootCount: { min: 1, max: 2 },
    sprite: '🕷️', color: '#4a148c',
  },
  skeleton: {
    name: '骷髅兵',
    hp: 40, maxHp: 40, attack: 7, defense: 4,
    skills: [{ name: '骨刃', damage: 7 }],
    loot: ['short_sword', 'leather_shield', 'ring_of_guardian'],
    lootCount: { min: 1, max: 2 },
    sprite: '💀', color: '#e5e7eb',
  },
  zombie: {
    name: '丧尸',
    hp: 50, maxHp: 50, attack: 8, defense: 5,
    skills: [{ name: '撕咬', damage: 8 }],
    loot: ['leather_shield', 'chain_mail', 'topaz'],
    lootCount: { min: 1, max: 3 },
    sprite: '🧟', color: '#22c55e',
  },
  ghost: {
    name: '幽灵',
    hp: 35, maxHp: 35, attack: 10, defense: 2,
    skills: [{ name: '灵触', damage: 10 }],
    loot: ['chain_mail', 'dragon_scale_armor', 'mana_potion'],
    lootCount: { min: 1, max: 2 },
    sprite: '👻', color: '#e0e7ff',
  },
  fire_elemental: {
    name: '火元素',
    hp: 45, maxHp: 45, attack: 12, defense: 4,
    skills: [{ name: '火焰喷射', damage: 12 }],
    loot: ['flame_sword', 'plate_armor', 'topaz'],
    lootCount: { min: 1, max: 2 },
    sprite: '🔥', color: '#e63946',
  },
  lava_slime: {
    name: '熔岩史莱姆',
    hp: 55, maxHp: 55, attack: 9, defense: 8,
    skills: [{ name: '熔岩喷射', damage: 9 }],
    loot: ['leather_shield', 'plate_armor', 'ring_of_guardian'],
    lootCount: { min: 1, max: 2 },
    sprite: '🟥', color: '#dc2626',
  },
  magmin: {
    name: '火矮人',
    hp: 40, maxHp: 40, attack: 11, defense: 5,
    skills: [{ name: '烈焰锤', damage: 11 }],
    loot: ['great_sword', 'plate_armor', 'bread'],
    lootCount: { min: 1, max: 2 },
    sprite: '👹', color: '#ea580c',
  },
  ice_elemental: {
    name: '冰元素',
    hp: 50, maxHp: 50, attack: 11, defense: 6,
    skills: [{ name: '寒冰箭', damage: 11 }],
    loot: ['ice_sword', 'dragon_scale_armor', 'topaz'],
    lootCount: { min: 1, max: 2 },
    sprite: '❄️', color: '#48cae4',
  },
  frost_wolf: {
    name: '冰霜巨狼',
    hp: 60, maxHp: 60, attack: 13, defense: 5,
    skills: [{ name: '冰牙', damage: 13 }, { name: '狼嚎', damage: 5 }],
    loot: ['great_sword', 'dragon_scale_armor', 'bread'],
    lootCount: { min: 2, max: 3 },
    sprite: '🐺', color: '#93c5fd',
  },
  snow_imp: {
    name: '雪精灵',
    hp: 25, maxHp: 25, attack: 8, defense: 2,
    skills: [{ name: '冰锥', damage: 8 }],
    loot: ['dragon_scale_armor', 'topaz'],
    lootCount: { min: 1, max: 2 },
    sprite: '🧊', color: '#bfdbfe',
  },
  treant: {
    name: '树人',
    hp: 70, maxHp: 70, attack: 12, defense: 10,
    skills: [{ name: '树枝抽打', damage: 12 }],
    loot: ['leather_shield', 'bread', 'roast_meat'],
    lootCount: { min: 2, max: 3 },
    sprite: '🌳', color: '#22c55e',
  },
  mushroom: {
    name: '毒蘑菇',
    hp: 30, maxHp: 30, attack: 7, defense: 3,
    skills: [{ name: '毒孢子', damage: 7 }],
    loot: ['health_potion', 'topaz'],
    lootCount: { min: 1, max: 2 },
    sprite: '🍄', color: '#a855f7',
  },
  wolf: {
    name: '森林狼',
    hp: 45, maxHp: 45, attack: 10, defense: 4,
    skills: [{ name: '撕咬', damage: 10 }],
    loot: ['leather_shield', 'roast_meat', 'ring_of_guardian'],
    lootCount: { min: 1, max: 2 },
    sprite: '🐺', color: '#6b7280',
  },
};

const BOSS_TEMPLATES: Omit<Enemy, 'id'>[] = [
  {
    name: '地牢守护者',
    hp: 150, maxHp: 150, attack: 15, defense: 10,
    skills: [{ name: '巨斧劈砍', damage: 18 }, { name: '盾击', damage: 12 }],
    loot: ['great_sword', 'shadow_blade', 'leather_shield', 'plate_armor'],
    lootCount: { min: 3, max: 5 },
    isBoss: true,
    sprite: '👿', color: '#7f1d1d',
  },
  {
    name: '巫妖',
    hp: 120, maxHp: 120, attack: 20, defense: 5,
    skills: [{ name: '死亡射线', damage: 22 }, { name: '召唤亡灵', damage: 10 }],
    loot: ['shadow_blade', 'chain_mail', 'dragon_scale_armor', 'mana_potion'],
    lootCount: { min: 3, max: 5 },
    isBoss: true,
    sprite: '🧙', color: '#4a148c',
  },
  {
    name: '火焰巨龙',
    hp: 200, maxHp: 200, attack: 18, defense: 12,
    skills: [{ name: '龙息', damage: 25 }, { name: '龙爪', damage: 15 }],
    loot: ['shadow_blade', 'chain_mail', 'iron_ingot'],
    lootCount: { min: 3, max: 5 },
    isBoss: true,
    sprite: '🐉', color: '#e63946',
  },
];

let roomIdCounter = 0;

function createRoom(
  x: number,
  y: number,
  width: number,
  height: number,
  type: Room['type'] = 'empty'
): Room {
  return {
    id: `room_${++roomIdCounter}`,
    x,
    y,
    width,
    height,
    type,
    cleared: false,
    discovered: false,
    connections: [],
  };
}

function createEnemyFromTemplate(templateId: string, floorLevel: number): Enemy {
  const template = ENEMY_TEMPLATES[templateId] || ENEMY_TEMPLATES.goblin;
  const levelMultiplier = 1 + (floorLevel - 1) * 0.15;
  return {
    ...template,
    id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hp: Math.floor(template.hp * levelMultiplier),
    maxHp: Math.floor(template.maxHp * levelMultiplier),
    attack: Math.floor(template.attack * levelMultiplier),
    defense: Math.floor(template.defense * levelMultiplier),
  };
}

function createBoss(floorLevel: number): Enemy {
  const template = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];
  const levelMultiplier = 1 + (floorLevel - 1) * 0.2;
  return {
    ...template,
    id: `boss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hp: Math.floor(template.hp * levelMultiplier),
    maxHp: Math.floor(template.maxHp * levelMultiplier),
    attack: Math.floor(template.attack * levelMultiplier),
    defense: Math.floor(template.defense * levelMultiplier),
  };
}

function generateShopData(): ShopData {
  const items: { itemId: string; price: number }[] = [];
  const itemCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < itemCount; i++) {
    const rarityRoll = Math.random();
    let itemId: string;
    if (rarityRoll < 0.5) itemId = getRandomItemIdByRarity('common');
    else if (rarityRoll < 0.8) itemId = getRandomItemIdByRarity('uncommon');
    else if (rarityRoll < 0.95) itemId = getRandomItemIdByRarity('rare');
    else itemId = getRandomItemIdByRarity('epic');

    const basePrice = 10 + Math.floor(Math.random() * 50);
    items.push({ itemId, price: basePrice });
  }
  return { items, sellsPotions: true, refreshCount: 3 };
}

function generateAltarData(): AltarData {
  const types: AltarData['type'][] = ['sacrifice', 'blessing', 'curse'];
  const type = types[Math.floor(Math.random() * types.length)];
  const descriptions: Record<string, string> = {
    sacrifice: '献祭一件物品，获得永久属性加成',
    blessing: '祈祷获得神圣祝福，恢复全部生命',
    curse: '接受暗黑诅咒，获得强大力量但降低防御',
  };
  return { type, description: descriptions[type], used: false };
}

function generateTreasureData(floorLevel: number): TreasureData {
  const itemCount = 2 + Math.floor(Math.random() * 3) + Math.floor(floorLevel / 3);
  const items: string[] = [];
  for (let i = 0; i < itemCount; i++) {
    const roll = Math.random();
    if (roll < 0.4) items.push(getRandomItemIdByRarity('common'));
    else if (roll < 0.7) items.push(getRandomItemIdByRarity('uncommon'));
    else if (roll < 0.9) items.push(getRandomItemIdByRarity('rare'));
    else items.push(getRandomItemIdByRarity('epic'));
  }
  return { items, opened: false };
}

export function generateDungeonFloor(level: number): DungeonFloor {
  const theme = DUNGEON_THEMES[Math.min(level - 1, DUNGEON_THEMES.length - 1)];

  const roomCount = 5 + Math.floor(Math.random() * 4) + Math.floor(level / 2);
  const rooms: Room[] = [];
  const connections: Connection[] = [];

  const mapWidth = 40;
  const mapHeight = 30;
  const placedRooms: Room[] = [];

  for (let i = 0; i < roomCount; i++) {
    let attempts = 0;
    let placed = false;

    while (!placed && attempts < 100) {
      const width = 3 + Math.floor(Math.random() * 4);
      const height = 3 + Math.floor(Math.random() * 3);
      const x = Math.floor(Math.random() * (mapWidth - width));
      const y = Math.floor(Math.random() * (mapHeight - height));

      let overlaps = false;
      for (const other of placedRooms) {
        if (
          x < other.x + other.width + 1 &&
          x + width + 1 > other.x &&
          y < other.y + other.height + 1 &&
          y + height + 1 > other.y
        ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const room = createRoom(x, y, width, height);
        placedRooms.push(room);
        rooms.push(room);
        placed = true;
      }
      attempts++;
    }
  }

  if (rooms.length < 2) {
    const room1 = createRoom(5, 5, 4, 4);
    const room2 = createRoom(15, 5, 4, 4);
    rooms.push(room1, room2);
  }

  rooms[0].type = 'start';
  rooms[0].discovered = true;

  if (rooms.length > 1) {
    rooms[rooms.length - 1].type = 'boss';
    rooms[rooms.length - 1].content = createBoss(level);
  }

  for (let i = 1; i < rooms.length - 1; i++) {
    const roll = Math.random();
    if (roll < SHOP_CHANCE) {
      rooms[i].type = 'shop';
      rooms[i].content = generateShopData();
    } else if (roll < SHOP_CHANCE + ALTAR_CHANCE) {
      rooms[i].type = 'altar';
      rooms[i].content = generateAltarData();
    } else if (roll < SHOP_CHANCE + ALTAR_CHANCE + TREASURE_CHANCE) {
      rooms[i].type = 'treasure';
      rooms[i].content = generateTreasureData(level);
    } else {
      rooms[i].type = 'enemy';
      const enemyTypes = theme.enemyTypes;
      const templateId = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      rooms[i].content = createEnemyFromTemplate(templateId, level);
    }
  }

  for (let i = 0; i < rooms.length; i++) {
    const distances = rooms
      .map((r, j) => ({
        index: j,
        dist: Math.abs(r.x - rooms[i].x) + Math.abs(r.y - rooms[i].y),
      }))
      .filter((d) => d.index !== i)
      .sort((a, b) => a.dist - b.dist);

    const connectCount = Math.min(2 + Math.floor(Math.random() * 2), distances.length);
    for (let j = 0; j < connectCount; j++) {
      const targetIndex = distances[j].index;
      if (!rooms[i].connections.includes(rooms[targetIndex].id)) {
        rooms[i].connections.push(rooms[targetIndex].id);
        rooms[targetIndex].connections.push(rooms[i].id);
        connections.push({ from: rooms[i].id, to: rooms[targetIndex].id });
      }
    }
  }

  return {
    level,
    rooms,
    connections,
    playerRoomId: rooms[0].id,
    theme: theme.name,
  };
}

export function getRoomById(dungeon: DungeonFloor, roomId: string): Room | undefined {
  return dungeon.rooms.find((r) => r.id === roomId);
}

export function getConnectedRooms(dungeon: DungeonFloor, roomId: string): Room[] {
  const room = getRoomById(dungeon, roomId);
  if (!room) return [];
  return room.connections
    .map((id) => getRoomById(dungeon, id))
    .filter((r): r is Room => r !== undefined);
}

export function moveToRoom(dungeon: DungeonFloor, roomId: string): DungeonFloor {
  const newDungeon = { ...dungeon, playerRoomId: roomId };
  const room = getRoomById(newDungeon, roomId);
  if (room) {
    room.discovered = true;
  }
  return newDungeon;
}

export { DUNGEON_THEMES, ENEMY_TEMPLATES };
