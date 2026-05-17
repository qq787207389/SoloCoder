import { GameMap } from '../types';

const TILES = {
  GRASS: 0,
  FOREST: 1,
  WATER: 2,
  MOUNTAIN: 3,
  PATH: 4,
  FLOOR: 5,
  WALL: 6,
  DOOR: 7
};

const createEmptyMap = (width: number, height: number, fill: number = TILES.GRASS): number[][] => {
  return Array(height).fill(null).map(() => Array(width).fill(fill));
};

const createVillageMap = (): number[][] => {
  const map = createEmptyMap(25, 20, TILES.GRASS);
  
  for (let x = 0; x < 25; x++) {
    map[0][x] = TILES.WALL;
    map[19][x] = TILES.WALL;
  }
  for (let y = 0; y < 20; y++) {
    map[y][0] = TILES.WALL;
    map[y][24] = TILES.WALL;
  }
  
  for (let y = 2; y < 7; y++) {
    for (let x = 2; x < 8; x++) {
      map[y][x] = TILES.FLOOR;
    }
  }
  for (let x = 3; x < 7; x++) {
    map[2][x] = TILES.WALL;
  }
  map[6][4] = TILES.DOOR;
  
  for (let y = 2; y < 7; y++) {
    for (let x = 17; x < 23; x++) {
      map[y][x] = TILES.FLOOR;
    }
  }
  for (let x = 18; x < 22; x++) {
    map[2][x] = TILES.WALL;
  }
  map[6][19] = TILES.DOOR;
  
  for (let y = 12; y < 18; y++) {
    for (let x = 9; x < 16; x++) {
      map[y][x] = TILES.FLOOR;
    }
  }
  for (let x = 10; x < 15; x++) {
    map[12][x] = TILES.WALL;
  }
  map[17][12] = TILES.DOOR;
  
  for (let y = 7; y < 12; y++) {
    map[y][12] = TILES.PATH;
  }
  for (let x = 4; x < 21; x++) {
    map[9][x] = TILES.PATH;
  }
  
  for (let y = 14; y < 17; y++) {
    map[y][4] = TILES.FOREST;
    map[y][5] = TILES.FOREST;
    map[y][19] = TILES.FOREST;
    map[y][20] = TILES.FOREST;
  }
  
  map[19][12] = TILES.DOOR;
  
  return map;
};

const createFieldMap = (): number[][] => {
  const map = createEmptyMap(30, 25, TILES.GRASS);
  
  for (let x = 8; x < 14; x++) {
    map[5][x] = TILES.PATH;
    map[6][x] = TILES.PATH;
  }
  
  for (let y = 6; y < 20; y++) {
    map[y][10] = TILES.PATH;
    map[y][11] = TILES.PATH;
  }
  
  for (let x = 5; x < 17; x++) {
    map[18][x] = TILES.PATH;
    map[19][x] = TILES.PATH;
  }
  
  for (let y = 2; y < 6; y++) {
    for (let x = 2; x < 6; x++) {
      map[y][x] = TILES.FOREST;
    }
  }
  
  for (let y = 2; y < 6; y++) {
    for (let x = 24; x < 28; x++) {
      map[y][x] = TILES.FOREST;
    }
  }
  
  for (let y = 21; y < 25; y++) {
    for (let x = 20; x < 29; x++) {
      map[y][x] = TILES.WATER;
    }
  }
  
  for (let y = 8; y < 14; y++) {
    for (let x = 18; x < 25; x++) {
      map[y][x] = TILES.MOUNTAIN;
    }
  }
  
  map[0][10] = TILES.DOOR;
  map[0][11] = TILES.DOOR;
  map[19][14] = TILES.DOOR;
  map[19][15] = TILES.DOOR;
  
  return map;
};

const createCaveMap = (): number[][] => {
  const map = createEmptyMap(20, 15, TILES.WALL);
  
  for (let y = 1; y < 14; y++) {
    for (let x = 1; x < 19; x++) {
      map[y][x] = TILES.FLOOR;
    }
  }
  
  for (let y = 1; y < 6; y++) {
    map[y][8] = TILES.WALL;
    map[y][9] = TILES.WALL;
    map[y][10] = TILES.WALL;
  }
  
  for (let y = 9; y < 14; y++) {
    map[y][5] = TILES.WALL;
    map[y][6] = TILES.WALL;
    map[y][13] = TILES.WALL;
    map[y][14] = TILES.WALL;
  }
  
  for (let x = 3; x < 7; x++) {
    map[7][x] = TILES.WALL;
  }
  for (let x = 13; x < 17; x++) {
    map[7][x] = TILES.WALL;
  }
  
  map[0][9] = TILES.DOOR;
  map[0][10] = TILES.DOOR;
  
  return map;
};

const createCastleMap = (): number[][] => {
  const map = createEmptyMap(20, 15, TILES.WALL);
  
  for (let y = 1; y < 14; y++) {
    for (let x = 1; x < 19; x++) {
      map[y][x] = TILES.FLOOR;
    }
  }
  
  for (let y = 1; y < 5; y++) {
    map[y][8] = TILES.WALL;
    map[y][9] = TILES.WALL;
    map[y][10] = TILES.WALL;
    map[y][11] = TILES.WALL;
  }
  
  for (let x = 5; x < 15; x++) {
    map[7][x] = TILES.WALL;
  }
  map[7][9] = TILES.DOOR;
  map[7][10] = TILES.DOOR;
  
  map[0][9] = TILES.DOOR;
  map[0][10] = TILES.DOOR;
  
  return map;
};

export const MAPS: Record<string, GameMap> = {
  village: {
    name: 'village',
    displayName: '和平村',
    width: 25,
    height: 20,
    tiles: createVillageMap(),
    collisionTiles: [TILES.WALL, TILES.WATER, TILES.MOUNTAIN, TILES.FOREST],
    npcs: [
      {
        id: 'king',
        name: '村长',
        position: { x: 12, y: 14 },
        color: '#ffd700',
        dialogues: [
          '欢迎来到和平村，年轻的勇者！',
          '最近洞窟中出现了一只可怕的巨兽，许多村民因此受难。',
          '如果你能击败那只巨兽，我将授予你勇者的称号！',
          '请去洞窟的深处找到它并击败它吧！'
        ],
        questFlag: 'hasTalkedToKing'
      },
      {
        id: 'elder',
        name: '村老',
        position: { x: 5, y: 5 },
        color: '#aaaaaa',
        dialogues: [
          '传说在这个世界的北方有一座魔王城...',
          '只有真正的勇者才能进入并击败魔王。',
          '当你获得勇者之证后，就可以前往魔王城了。'
        ]
      },
      {
        id: 'girl',
        name: '小女孩',
        position: { x: 8, y: 8 },
        color: '#ffaaaa',
        dialogues: [
          '大哥哥，你要去冒险吗？',
          '外面有很多怪物，要小心哦！',
          '这个药草送给你，希望能帮到你~'
        ],
        questFlag: 'hasTalkedToGirl'
      },
      {
        id: 'guard',
        name: '守卫',
        position: { x: 12, y: 18 },
        color: '#4488ff',
        dialogues: [
          '南边的大门通往野外。',
          '野外有很多怪物，要做好准备再出去！',
          '击败洞窟的巨兽后，你就是真正的勇者了！'
        ]
      }
    ],
    chests: [
      {
        id: 'chest1',
        position: { x: 3, y: 4 },
        itemId: 'herb',
        opened: false,
        gold: 20
      },
      {
        id: 'chest2',
        position: { x: 20, y: 4 },
        itemId: 'magicWater',
        opened: false
      }
    ],
    portals: [
      {
        position: { x: 12, y: 19 },
        targetMap: 'field',
        targetPosition: { x: 10, y: 1 }
      }
    ],
    encounterRate: 0,
    encounterTable: [],
    bgColor: '#2a5a2a'
  },
  
  field: {
    name: 'field',
    displayName: '郊外平原',
    width: 30,
    height: 25,
    tiles: createFieldMap(),
    collisionTiles: [TILES.WALL, TILES.WATER, TILES.MOUNTAIN, TILES.FOREST],
    npcs: [],
    chests: [
      {
        id: 'fieldChest1',
        position: { x: 22, y: 3 },
        itemId: 'betterHerb',
        opened: false,
        gold: 50
      },
      {
        id: 'fieldChest2',
        position: { x: 3, y: 22 },
        itemId: 'magicWater',
        opened: false,
        gold: 30
      }
    ],
    portals: [
      {
        position: { x: 10, y: 0 },
        targetMap: 'village',
        targetPosition: { x: 12, y: 18 }
      },
      {
        position: { x: 14, y: 19 },
        targetMap: 'cave',
        targetPosition: { x: 9, y: 1 }
      }
    ],
    encounterRate: 0.07,
    encounterTable: ['slime', 'bat', 'goblin', 'wolf'],
    bgColor: '#3a7a3a'
  },
  
  cave: {
    name: 'cave',
    displayName: '黑暗洞窟',
    width: 20,
    height: 15,
    tiles: createCaveMap(),
    collisionTiles: [TILES.WALL],
    npcs: [],
    chests: [
      {
        id: 'caveChest1',
        position: { x: 3, y: 3 },
        itemId: 'copperSwordItem',
        opened: false
      },
      {
        id: 'caveChest2',
        position: { x: 16, y: 3 },
        itemId: 'leatherArmorItem',
        opened: false
      },
      {
        id: 'caveChest3',
        position: { x: 9, y: 12 },
        itemId: 'betterHerb',
        opened: false,
        gold: 100
      }
    ],
    portals: [
      {
        position: { x: 9, y: 0 },
        targetMap: 'field',
        targetPosition: { x: 14, y: 18 }
      }
    ],
    encounterRate: 0.1,
    encounterTable: ['bat', 'skeleton', 'goblin'],
    bgColor: '#2a2a2a'
  },
  
  castle: {
    name: 'castle',
    displayName: '魔王城',
    width: 20,
    height: 15,
    tiles: createCastleMap(),
    collisionTiles: [TILES.WALL],
    npcs: [],
    chests: [
      {
        id: 'castleChest1',
        position: { x: 3, y: 10 },
        itemId: 'betterHerb',
        opened: false
      },
      {
        id: 'castleChest2',
        position: { x: 16, y: 10 },
        itemId: 'magicWater',
        opened: false
      }
    ],
    portals: [],
    encounterRate: 0.15,
    encounterTable: ['skeleton', 'goblin', 'wolf'],
    bgColor: '#4a1a1a'
  }
};
