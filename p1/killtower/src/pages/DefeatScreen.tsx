import { motion } from 'framer-motion';
import { Skull, RotateCcw, Home } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export function DefeatScreen() {
  const { resetGame, setPhase, floor } = useGameStore();

  const handleRetry = () => {
    resetGame();
    setPhase('characterSelect');
  };

  const handleMainMenu = () => {
    resetGame();
    setPhase('menu');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-red-950 via-gray-950 to-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <Skull className="w-32 h-32 text-red-500 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-red-500 mb-4">你倒下了...</h1>
        <p className="text-2xl text-gray-400 mb-8">在第 {floor} 层被击败</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex gap-6 mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl text-white font-bold text-xl shadow-lg shadow-red-500/30 transition-all"
        >
          <RotateCcw className="w-7 h-7" />
          再试一次
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMainMenu}
          className="flex items-center gap-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold text-xl transition-all"
        >
          <Home className="w-7 h-7" />
          返回主菜单
        </motion.button>
      </motion.div>
    </div>
  );
}
