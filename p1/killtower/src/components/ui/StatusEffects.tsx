import { motion } from 'framer-motion';
import type { StatusEffect } from '../../game/types';

interface StatusEffectsProps {
  effects: StatusEffect[];
  size?: 'small' | 'normal';
}

const statusIcons: Record<string, string> = {
  weak: '😵',
  vulnerable: '💔',
  strength: '💪',
  dexterity: '🏃',
  poison: '☠️',
  regen: '💚',
  thorns: '🌹',
  artifact: '🛡️',
  intangible: '👻'
};

const statusNames: Record<string, string> = {
  weak: '虚弱',
  vulnerable: '易伤',
  strength: '力量',
  dexterity: '敏捷',
  poison: '中毒',
  regen: '再生',
  thorns: '荆棘',
  artifact: '神器',
  intangible: '无形'
};

export function StatusEffects({ effects, size = 'normal' }: StatusEffectsProps) {
  if (effects.filter(e => e.stacks > 0).length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {effects.filter(e => e.stacks > 0).map((effect, index) => (
        <motion.div
          key={`${effect.type}-${index}`}
          className={`relative flex items-center justify-center rounded-full bg-gray-800 border-2 border-gray-600 ${
            size === 'small' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
          }`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500 }}
          title={`${statusNames[effect.type] || effect.type}: ${effect.stacks}`}
        >
          <span>{statusIcons[effect.type] || '❓'}</span>
          <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold border border-gray-600">
            {effect.stacks}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
