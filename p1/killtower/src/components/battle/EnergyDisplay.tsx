import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface EnergyDisplayProps {
  current: number;
  max: number;
}

export function EnergyDisplay({ current, max }: EnergyDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 border-4 border-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/50"
          animate={{
            boxShadow: current > 0 
              ? ['0 0 20px rgba(59, 130, 246, 0.5)', '0 0 40px rgba(59, 130, 246, 0.8)', '0 0 20px rgba(59, 130, 246, 0.5)']
              : 'none'
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
        </motion.div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-0.5 rounded-full border-2 border-gray-600">
          <span className="text-white font-bold text-lg">{current}/{max}</span>
        </div>
      </div>
    </div>
  );
}
