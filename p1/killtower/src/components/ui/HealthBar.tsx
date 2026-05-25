import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  block: number;
  isEnemy?: boolean;
  size?: 'small' | 'normal' | 'large';
}

export function HealthBar({ currentHp, maxHp, block, isEnemy = false, size = 'normal' }: HealthBarProps) {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  const hpColor = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
  
  const sizeClasses = {
    small: 'h-3 text-xs',
    normal: 'h-5 text-sm',
    large: 'h-8 text-base'
  };

  return (
    <div className="w-full">
      <div className={`relative ${sizeClasses[size]} bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600`}>
        <motion.div
          className={`absolute inset-y-0 left-0 ${hpColor} transition-all duration-300`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-lg">
          {currentHp} / {maxHp}
        </div>
      </div>
      
      {block > 0 && (
        <motion.div
          className="flex items-center justify-center gap-1 mt-1 text-blue-300 font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={block}
        >
          <Shield className="w-4 h-4" />
          <span>{block}</span>
        </motion.div>
      )}
    </div>
  );
}
