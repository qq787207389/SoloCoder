import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { EnemyDisplay } from './EnemyDisplay';
import { HandArea } from './HandArea';
import { EnergyDisplay } from './EnergyDisplay';
import { HealthBar } from '../ui/HealthBar';
import { StatusEffects } from '../ui/StatusEffects';
import { CardComponent } from '../ui/CardComponent';
import { SkipForward, Layers, Trash2 } from 'lucide-react';

export function BattleScene() {
  const { battle, endTurn, selectCard, selectEnemy, playerHp, playerMaxHp } = useGameStore();

  if (!battle) return null;

  const isPlayerTurn = battle.phase === 'player';

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-gray-950 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDJ2LTJoMzB2MnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700">
            <span className="text-gray-400 text-sm">回合</span>
            <span className="text-white font-bold ml-2 text-xl">{battle.turn}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-700 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span className="text-white font-bold">{battle.drawPile.length}</span>
          </div>
          <div className="bg-gray-900/80 rounded-lg px-3 py-2 border border-gray-700 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-gray-400" />
            <span className="text-white font-bold">{battle.discardPile.length}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8">
        <div className="flex justify-center gap-16 flex-wrap">
          {battle.enemies.map(enemy => (
            <EnemyDisplay key={enemy.id} enemy={enemy} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-48 left-8 z-20">
        <div className="flex flex-col items-center">
          <motion.div
            className="text-6xl mb-2"
            animate={{
              scale: battle.phase === 'enemy' ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: battle.phase === 'enemy' ? Infinity : 0 }}
          >
            🧝
          </motion.div>
          <div className="w-40 mb-2">
            <HealthBar
              currentHp={battle.player.currentHp}
              maxHp={battle.player.maxHp}
              block={battle.player.block}
            />
          </div>
          <StatusEffects effects={battle.player.statusEffects} size="small" />
        </div>
      </div>

      <div className="absolute bottom-48 right-8 z-20">
        <EnergyDisplay current={battle.player.energy} max={battle.player.maxEnergy} />
      </div>

      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20">
        <HandArea cards={battle.hand} isPlayerTurn={isPlayerTurn} />
      </div>

      <AnimatePresence>
        {battle.selectedCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-40 right-48 z-30"
          >
            <div className="text-yellow-400 text-sm mb-2 text-center font-bold">选择目标</div>
            <CardComponent card={battle.selectedCard} size="small" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 right-4 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            endTurn();
            selectCard(null);
            selectEnemy(null);
          }}
          disabled={!isPlayerTurn}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-all ${
            isPlayerTurn
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <SkipForward className="w-6 h-6" />
          {isPlayerTurn ? '结束回合' : '敌人回合...'}
        </motion.button>
      </div>

      <div className="absolute bottom-4 left-4 w-72 h-32 overflow-hidden z-10">
        <div className="bg-gray-900/60 rounded-lg p-2 h-full overflow-y-auto border border-gray-700">
          {battle.battleLog.slice(-5).map((log, index) => (
            <div key={index} className="text-xs text-gray-300 py-0.5">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
