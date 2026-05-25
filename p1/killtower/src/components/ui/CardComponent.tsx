import { motion } from 'framer-motion';
import type { Card } from '../../game/types';
import { cn } from '../../lib/utils';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  size?: 'small' | 'normal' | 'large';
  showBack?: boolean;
}

const getCardColor = (type: string) => {
  switch (type) {
    case 'attack': return 'from-red-900 to-red-700 border-red-500';
    case 'skill': return 'from-blue-900 to-blue-700 border-blue-500';
    case 'power': return 'from-purple-900 to-purple-700 border-purple-500';
    default: return 'from-gray-900 to-gray-700 border-gray-500';
  }
};

const getCardTypeLabel = (type: string) => {
  switch (type) {
    case 'attack': return '攻击';
    case 'skill': return '技能';
    case 'power': return '能力';
    default: return '未知';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'rare': return 'shadow-[0_0_15px_rgba(255,215,0,0.6)]';
    case 'uncommon': return 'shadow-[0_0_10px_rgba(100,200,255,0.5)]';
    default: return '';
  }
};

export function CardComponent({
  card,
  onClick,
  isSelected = false,
  isPlayable = true,
  size = 'normal',
  showBack = false
}: CardComponentProps) {
  const sizeClasses = {
    small: 'w-24 h-36 text-xs',
    normal: 'w-32 h-48 text-sm',
    large: 'w-40 h-60 text-base'
  };

  if (showBack) {
    return (
      <motion.div
        className={cn(
          sizeClasses[size],
          'rounded-lg bg-gradient-to-br from-gray-800 to-gray-900',
          'border-2 border-gray-600 flex items-center justify-center'
        )}
        whileHover={{ scale: 1.05 }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        'rounded-lg bg-gradient-to-br cursor-pointer relative overflow-hidden',
        'border-2 transition-all duration-200',
        getCardColor(card.type),
        getRarityGlow(card.rarity),
        isSelected ? 'ring-4 ring-yellow-400 scale-110 z-10' : '',
        isPlayable ? 'hover:scale-105 hover:-translate-y-2' : 'opacity-60 cursor-not-allowed'
      )}
      onClick={isPlayable ? onClick : undefined}
      layout
      initial={{ opacity: 0, y: 50, rotate: -10 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      
      <div className="relative z-10 h-full flex flex-col p-2">
        <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 flex items-center justify-center font-bold text-white shadow-lg">
          {card.cost}
        </div>

        <div className="flex-1 flex items-center justify-center mt-4">
          <div className="text-4xl">
            {card.type === 'attack' && '⚔️'}
            {card.type === 'skill' && '🛡️'}
            {card.type === 'power' && '✨'}
          </div>
        </div>

        <div className="text-center font-bold text-white mb-1 drop-shadow-lg">
          {card.name}
          {card.isUpgraded && <span className="text-green-400 ml-1">+</span>}
        </div>

        <div className="text-xs text-center text-gray-300 mb-1">
          {getCardTypeLabel(card.type)}
        </div>

        <div className="text-xs text-center text-gray-200 bg-black/40 rounded p-1">
          {card.isUpgraded && card.upgradedDescription 
            ? card.upgradedDescription 
            : card.description}
        </div>
      </div>
    </motion.div>
  );
}
