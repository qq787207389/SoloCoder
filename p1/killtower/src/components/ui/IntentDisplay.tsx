import { motion } from 'framer-motion';
import { Sword, Shield, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import type { EnemyIntent } from '../../game/types';

interface IntentDisplayProps {
  intent: EnemyIntent;
}

export function IntentDisplay({ intent }: IntentDisplayProps) {
  const renderIntent = () => {
    switch (intent.type) {
      case 'attack':
        return (
          <div className="flex items-center gap-1 text-red-400">
            <Sword className="w-5 h-5" />
            <span className="font-bold">
              {intent.damage}
              {intent.hits && intent.hits > 1 && ` x${intent.hits}`}
            </span>
          </div>
        );
      case 'defend':
        return (
          <div className="flex items-center gap-1 text-blue-400">
            <Shield className="w-5 h-5" />
            <span className="font-bold">{intent.block}</span>
          </div>
        );
      case 'buff':
        return (
          <div className="flex items-center gap-1 text-green-400">
            <ArrowUp className="w-5 h-5" />
            <span className="font-bold text-sm">强化</span>
          </div>
        );
      case 'debuff':
        return (
          <div className="flex items-center gap-1 text-purple-400">
            <ArrowDown className="w-5 h-5" />
            <span className="font-bold text-sm">削弱</span>
          </div>
        );
      case 'special':
        return (
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-sm">特殊</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-gray-400">
            <span className="font-bold">???</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="bg-gray-900/80 rounded-lg px-3 py-1 border-2 border-gray-600"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' }}
    >
      {renderIntent()}
    </motion.div>
  );
}
