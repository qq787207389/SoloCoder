import { MonsterConfig, MonsterType } from '../../types/game';

export const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig> = {
  imp: {
    name: '小恶魔',
    maxHealth: 50,
    attack: 8,
    speed: 2,
    salary: 10,
    moodDecay: 2,
    cost: 50,
    color: '#ff4444',
  },
  skeleton: {
    name: '骷髅兵',
    maxHealth: 80,
    attack: 12,
    speed: 1.5,
    salary: 15,
    moodDecay: 1.5,
    cost: 80,
    color: '#dddddd',
  },
  assassin: {
    name: '暗影刺客',
    maxHealth: 40,
    attack: 20,
    speed: 3,
    salary: 25,
    moodDecay: 3,
    cost: 120,
    color: '#8844ff',
  },
};
