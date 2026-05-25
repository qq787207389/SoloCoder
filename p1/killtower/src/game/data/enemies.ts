import type { Enemy, EnemyMove, StatusType } from '../types';
import { generateId } from '../utils';

interface EnemyTemplate {
  type: string;
  name: string;
  maxHp: [number, number];
  moves: EnemyMove[];
  isElite?: boolean;
  isBoss?: boolean;
}

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  {
    type: 'slime_small',
    name: '小史莱姆',
    maxHp: [10, 14],
    moves: [
      { id: 'attack', name: '撞击', intent: 'attack', damage: 5, weight: 70 },
      { id: 'defend', name: '收缩', intent: 'defend', block: 4, weight: 30 }
    ]
  },
  {
    type: 'slime_medium',
    name: '中型史莱姆',
    maxHp: [28, 32],
    moves: [
      { id: 'attack', name: '猛击', intent: 'attack', damage: 8, weight: 60 },
      { id: 'defend', name: '凝固', intent: 'defend', block: 6, weight: 40 }
    ]
  },
  {
    type: 'cultist',
    name: '邪教徒',
    maxHp: [48, 54],
    moves: [
      { id: 'attack', name: '暗刃', intent: 'attack', damage: 6, weight: 50 },
      { id: 'buff', name: '仪式', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 3 }], weight: 50 }
    ]
  },
  {
    type: 'jawWorm',
    name: '颚虫',
    maxHp: [40, 44],
    moves: [
      { id: 'attack', name: '撕咬', intent: 'attack', damage: 11, weight: 45 },
      { id: 'defend', name: '卷缩', intent: 'defend', block: 6, weight: 30 },
      { id: 'buff', name: '咆哮', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 3 }], block: 5, weight: 25 }
    ]
  },
  {
    type: 'louse',
    name: '虱子',
    maxHp: [10, 15],
    moves: [
      { id: 'attack', name: '啃咬', intent: 'attack', damage: 6, weight: 75 },
      { id: 'buff', name: '膨胀', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 3 }], weight: 25 }
    ]
  },
  {
    type: 'fungiBeast',
    name: '真菌兽',
    maxHp: [22, 28],
    moves: [
      { id: 'attack', name: '孢子', intent: 'attack', damage: 6, weight: 60 },
      { id: 'debuff', name: '迷惑', intent: 'debuff', debuffs: [{ type: 'weak' as StatusType, stacks: 2 }], weight: 40 }
    ]
  },
  {
    type: 'gremlin',
    name: '哥布林',
    maxHp: [12, 16],
    moves: [
      { id: 'attack', name: '匕首', intent: 'attack', damage: 4, weight: 70 },
      { id: 'defend', name: '躲闪', intent: 'defend', block: 4, weight: 30 }
    ]
  },
  {
    type: 'gremlinFat',
    name: '胖哥布林',
    maxHp: [20, 24],
    moves: [
      { id: 'attack', name: '重击', intent: 'attack', damage: 8, weight: 60 },
      { id: 'buff', name: '鼓舞', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 2 }], weight: 40 }
    ]
  },
  {
    type: 'looter',
    name: '掠夺者',
    maxHp: [34, 40],
    moves: [
      { id: 'attack', name: '偷窃', intent: 'attack', damage: 8, weight: 50 },
      { id: 'defend', name: '烟雾弹', intent: 'defend', block: 8, weight: 50 }
    ],
    isElite: true
  },
  {
    type: 'gremlinNob',
    name: '哥布林首领',
    maxHp: [82, 86],
    moves: [
      { id: 'attack', name: '猛冲', intent: 'attack', damage: 14, weight: 35 },
      { id: 'attack2', name: '狂暴', intent: 'attack', damage: 16, hits: 2, weight: 35 },
      { id: 'buff', name: '怒吼', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 2 }], weight: 30 }
    ],
    isElite: true
  },
  {
    type: 'lagavulin',
    name: '拉格瓦林',
    maxHp: [109, 111],
    moves: [
      { id: 'attack', name: '重击', intent: 'attack', damage: 18, weight: 40 },
      { id: 'defend', name: '护甲', intent: 'defend', block: 20, weight: 30 },
      { id: 'debuff', name: '虹吸', intent: 'debuff', debuffs: [{ type: 'strength' as StatusType, stacks: -1 }], damage: 6, weight: 30 }
    ],
    isElite: true
  },
  {
    type: 'slimeBoss',
    name: '史莱姆王',
    maxHp: [140, 140],
    moves: [
      { id: 'attack', name: '碾压', intent: 'attack', damage: 35, weight: 40 },
      { id: 'attack2', name: '分裂', intent: 'attack', damage: 8, hits: 4, weight: 30 },
      { id: 'buff', name: '融合', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 3 }], block: 10, weight: 30 }
    ],
    isBoss: true
  },
  {
    type: 'hexaghost',
    name: '六火亡魂',
    maxHp: [250, 250],
    moves: [
      { id: 'attack', name: '灼烧', intent: 'attack', damage: 6, hits: 6, weight: 40 },
      { id: 'attack2', name: '地狱火', intent: 'attack', damage: 45, weight: 30 },
      { id: 'buff', name: '充能', intent: 'buff', buffs: [{ type: 'strength' as StatusType, stacks: 2 }], weight: 30 }
    ],
    isBoss: true
  },
  {
    type: 'guardian',
    name: '守护者',
    maxHp: [240, 240],
    moves: [
      { id: 'attack', name: '铁拳', intent: 'attack', damage: 32, weight: 35 },
      { id: 'defend', name: '防御模式', intent: 'defend', block: 30, weight: 35 },
      { id: 'attack2', name: '激光', intent: 'attack', damage: 9, hits: 4, weight: 30 }
    ],
    isBoss: true
  }
];

export function getEnemyTemplate(type: string): EnemyTemplate | undefined {
  return ENEMY_TEMPLATES.find(e => e.type === type);
}

export function createEnemy(type: string): Enemy | null {
  const template = getEnemyTemplate(type);
  if (!template) return null;

  const [minHp, maxHp] = template.maxHp;
  const hp = Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp;

  return {
    id: generateId(),
    type: template.type,
    name: template.name,
    maxHp: hp,
    currentHp: hp,
    block: 0,
    statusEffects: [],
    intent: { type: 'unknown', moveId: '' },
    moves: template.moves,
    moveHistory: [],
    isElite: template.isElite,
    isBoss: template.isBoss
  };
}

export function getRandomEnemy(isElite = false, isBoss = false): string {
  const enemies = ENEMY_TEMPLATES.filter(e => {
    if (isBoss) return e.isBoss;
    if (isElite) return e.isElite;
    return !e.isElite && !e.isBoss;
  });
  
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  return enemy.type;
}
