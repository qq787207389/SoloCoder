import { SpellConfig, SpellType } from '../../types/game';

export const SPELL_CONFIGS: Record<SpellType, SpellConfig> = {
  fireball: {
    name: '火球术',
    damage: 50,
    cooldown: 8,
    manaCost: 30,
    range: 3,
    color: '#ff6600',
  },
  lightning: {
    name: '闪电链',
    damage: 35,
    cooldown: 12,
    manaCost: 40,
    range: 5,
    color: '#ffff00',
  },
  heal: {
    name: '群体治疗',
    damage: -40,
    cooldown: 15,
    manaCost: 50,
    range: 4,
    color: '#00ff88',
  },
};
