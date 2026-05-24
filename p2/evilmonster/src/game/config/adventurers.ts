import { AdventurerConfig, AdventurerClass } from '../../types/game';

export const ADVENTURER_CONFIGS: Record<AdventurerClass, AdventurerConfig> = {
  warrior: {
    name: '战士',
    maxHealth: 150,
    attack: 15,
    speed: 1,
    color: '#4488ff',
    lootPriority: 'monster',
  },
  mage: {
    name: '法师',
    maxHealth: 80,
    attack: 25,
    speed: 1.2,
    color: '#ff44ff',
    lootPriority: 'treasure',
  },
  thief: {
    name: '盗贼',
    maxHealth: 60,
    attack: 12,
    speed: 2.5,
    color: '#44ff44',
    lootPriority: 'treasure',
  },
};
