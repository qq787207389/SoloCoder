
import { EnemyType } from '../types';

export const ENEMY_TYPES: Record&lt;string, EnemyType&gt; = {
  basic: {
    name: 'Zombie',
    color: 0x44ff44,
    size: 20,
    speed: 80,
    health: 30,
    damage: 10,
    exp: 5,
    behavior: 'chase'
  },
  fast: {
    name: 'Runner',
    color: 0xffff44,
    size: 16,
    speed: 150,
    health: 15,
    damage: 8,
    exp: 8,
    behavior: 'chase'
  },
  shooter: {
    name: 'Shooter',
    color: 0xff4444,
    size: 24,
    speed: 50,
    health: 40,
    damage: 15,
    exp: 15,
    behavior: 'shoot'
  },
  tank: {
    name: 'Tank',
    color: 0x4444ff,
    size: 32,
    speed: 40,
    health: 100,
    damage: 20,
    exp: 25,
    behavior: 'chase'
  },
  splitter: {
    name: 'Splitter',
    color: 0xff44ff,
    size: 28,
    speed: 70,
    health: 50,
    damage: 12,
    exp: 20,
    behavior: 'split'
  }
};
