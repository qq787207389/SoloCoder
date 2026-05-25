import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, ArrowUp } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export function CampfireScreen() {
  const { setPhase, heal, playerHp, playerMaxHp } = useGameStore();
  const [healed, setHealed] = useState(false);

  const handleRest = () => {
    if (!healed) {
      heal(Math.floor(playerMaxHp * 0.3));
      setHealed(true);
    }
  };

  const handleLeave = () => {
    setPhase('map');
  };

  const healAmount = Math.floor(playerMaxHp * 0.3);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-orange-950 via-red-950 to-gray-950 flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative mb-8"
      >
        <Flame className="w-32 h-32 text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
      </motion.div>

      <h1 className="text-4xl font-bold text-white mb-8">篝火营地</h1>

      <div className="bg-gray-900/60 rounded-xl px-6 py-3 mb-8 border border-orange-500/30">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-400" />
          <span className="text-white font-bold text-xl">{playerHp} / {playerMaxHp}</span>
        </div>
      </div>

      {!healed ? (
        <div className="flex gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRest}
            className="flex flex-col items-center gap-3 px-10 py-6 bg-gradient-to-b from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 rounded-2xl text-white font-bold shadow-lg shadow-green-500/30 transition-all"
          >
            <Heart className="w-12 h-12" />
            <span className="text-xl">休息</span>
            <span className="text-sm text-green-300">恢复 {healAmount} 生命值</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-3 px-10 py-6 bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/30 transition-all opacity-50"
            disabled
          >
            <ArrowUp className="w-12 h-12" />
            <span className="text-xl">升级</span>
            <span className="text-sm text-blue-300">升级一张卡牌</span>
          </motion.button>
        </div>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLeave}
          className="flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold text-xl transition-all"
        >
          继续前进
        </motion.button>
      )}
    </div>
  );
}
