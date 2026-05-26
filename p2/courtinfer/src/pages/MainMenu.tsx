import { motion } from 'framer-motion';
import { Scale, Play, BookOpen, Settings } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

export default function MainMenu() {
  const navigate = useNavigate();
  const startNewCase = useGameStore(state => state.startNewCase);
  
  const handleStartNewCase = () => {
    startNewCase();
    navigate('/investigation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center mb-16"
      >
        <motion.div
          animate={{ rotate: [0, -2, 2, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <Scale className="w-24 h-24 text-amber-400 mx-auto" strokeWidth={1.5} />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-amber-400 mb-4 tracking-wider"
          style={{ fontFamily: 'serif', textShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}
        >
          法庭推理
        </h1>
        <p className="text-xl text-slate-400 tracking-wide">
          真相就在证据之中
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 space-y-4 w-80"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartNewCase}
          className="w-full py-4 px-8 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 font-bold text-lg rounded-lg flex items-center justify-center gap-3 hover:from-amber-500 hover:to-amber-400 transition-all"
        >
          <Play className="w-6 h-6" />
          开始新案件
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-8 bg-slate-800/50 border border-slate-600 text-slate-300 font-semibold text-lg rounded-lg flex items-center justify-center gap-3 hover:bg-slate-700/50 hover:border-slate-500 transition-all"
        >
          <BookOpen className="w-5 h-5" />
          案件档案
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-8 bg-slate-800/50 border border-slate-600 text-slate-300 font-semibold text-lg rounded-lg flex items-center justify-center gap-3 hover:bg-slate-700/50 hover:border-slate-500 transition-all"
        >
          <Settings className="w-5 h-5" />
          设置
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 text-slate-500 text-sm"
      >
        调查 · 质证 · 辩论 · 真相
      </motion.div>
    </div>
  );
}
