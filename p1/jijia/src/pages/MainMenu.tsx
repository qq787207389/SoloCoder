
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function MainMenu() {
  const [playerName, setPlayerName] = useState('');
  const [showNewGame, setShowNewGame] = useState(false);
  const { newGame, setCurrentPage } = useGameStore();

  const handleNewGame = () => {
    if (playerName.trim()) {
      newGame(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Orbitron', sans-serif"}}
        >
          机甲竞技场
        </h1>
        <p className="text-xl text-gray-400" style={{ fontFamily: "'Rajdhani', sans-serif"}}
        >
          MECH ARENA
        </p>
        <div className="mt-2 text-sm text-cyan-500/60">
          自定义 · 策略 · 战斗
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-cyan-500/30 shadow-2xl w-full max-w-md"
      >
        {!showNewGame ? (
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewGame(true)}
            className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
          >
            🎮 新游戏
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('workshop')}
            className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
          >
            🔧 机甲车间
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('battle')}
            className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
          >
            ⚔️ 快速对战
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentPage('shop')}
            className="w-full py-4 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            🛒 部件商店
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">创建新机甲师</h2>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="输入你的名字"
            className="w-full px-4 py-3 bg-gray-700/50 border-2 border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleNewGame()}
          />
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewGame(false)}
              className="flex-1 py-3 px-6 bg-gray-600 text-white font-bold rounded-lg"
            >
              返回
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewGame}
                disabled={!playerName.trim()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                开始
              </motion.button>
          </div>
        </div>
      )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-8 text-gray-500 text-sm"
      >
        <p>按 ESC 返回主菜单 | 自定义你的机甲，称霸竞技场！</p>
      </motion.div>

      <div className="fixed bottom-4 left-4 text-gray-600 text-xs">
        v1.0.0 - 机甲自定义回合制战斗游戏
      </div>
    </div>
  );
}
