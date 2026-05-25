import { motion } from 'framer-motion';
import type { Enemy } from '../../game/types';
import { HealthBar } from '../ui/HealthBar';
import { IntentDisplay } from '../ui/IntentDisplay';
import { StatusEffects } from '../ui/StatusEffects';
import { useGameStore } from '../../store/useGameStore';

interface EnemyDisplayProps {
  enemy: Enemy;
}

const enemyEmojis: Record<string, string> = {
  slime_small: '🟢',
  slime_medium: '🟩',
  cultist: '🧙',
  jawWorm: '🐛',
  louse: '🪲',
  fungiBeast: '🍄',
  gremlin: '👺',
  gremlinFat: '👹',
  looter: '🦹',
  gremlinNob: '👾',
  lagavulin: '🐙',
  slimeBoss: '👑',
  hexaghost: '🔥',
  guardian: '🤖'
};

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
  const { battle, playCard, selectEnemy } = useGameStore();
  const isSelected = battle?.selectedEnemy === enemy.id;
  const selectedCard = battle?.selectedCard;

  const handleClick = () => {
    if (selectedCard && selectedCard.target === 'single') {
      playCard(selectedCard.id, enemy.id);
      selectEnemy(null);
    } else {
      selectEnemy(isSelected ? null : enemy.id);
    }
  };

  return (
    <motion.div
      className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 ${
        isSelected ? 'scale-110' : 'hover:scale-105'
      }`}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      animate={enemy.currentHp <= 0 ? { opacity: 0, scale: 0 } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2">
        <IntentDisplay intent={enemy.intent} />
      </div>

      <motion.div
        className={`text-6xl md:text-8xl ${
          enemy.isElite ? 'drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]' : ''
        } ${enemy.isBoss ? 'drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]' : ''}`}
        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0 }}
      >
        {enemyEmojis[enemy.type] || '👾'}
      </motion.div>

      <div className="text-center font-bold text-white mb-2 drop-shadow-lg">
        {enemy.name}
        {enemy.isElite && <span className="text-orange-400 ml-1">★</span>}
        {enemy.isBoss && <span className="text-red-400 ml-1">👑</span>}
      </div>

      <div className="w-32 md:w-40 mb-2">
        <HealthBar
          currentHp={enemy.currentHp}
          maxHp={enemy.maxHp}
          block={enemy.block}
          isEnemy
        />
      </div>

      <StatusEffects effects={enemy.statusEffects} size="small" />
    </motion.div>
  );
}
