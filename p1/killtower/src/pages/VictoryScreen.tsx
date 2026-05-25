import { motion } from 'framer-motion';
import { Trophy, Star, Home } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export function VictoryScreen() {
  const { resetGame, setPhase, gold, deck, relics } = useGameStore();

  const handleMainMenu = () => {
    resetGame();
    setPhase('menu');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-yellow-900 via-amber-950 to-gray-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              opacity: 0
            }}
            animate={{ 
              y: -100,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <Trophy className="w-40 h-40 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-4">
          胜利！
        </h1>
        <p className="text-2xl text-amber-300 mb-8">你成功征服了杀戮之塔！</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex gap-8 mb-12"
      >
        <div className="bg-gray-900/80 rounded-xl p-6 border border-yellow-500/50 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{deck.length}</div>
          <div className="text-gray-400">卡牌数量</div>
        </div>
        <div className="bg-gray-900/80 rounded-xl p-6 border border-yellow-500/50 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{relics.length}</div>
          <div className="text-gray-400">遗物数量</div>
        </div>
        <div className="bg-gray-900/80 rounded-xl p-6 border border-yellow-500/50 text-center">
          <Star className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{gold}</div>
          <div className="text-gray-400">金币</div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMainMenu}
        className="relative z-10 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl text-white font-bold text-xl shadow-lg shadow-yellow-500/30 transition-all"
      >
        <Home className="w-7 h-7" />
        返回主菜单
      </motion.button>
    </div>
  );
}
