import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

const AnimatedNumber = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-5xl md:text-7xl font-bold text-gradient"
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <span className="text-gray-400 text-sm mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
};

export const Countdown = () => {
  const { countdown, updateCountdown } = useStore();

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8">
      <AnimatedNumber value={countdown.days} label="Days" />
      <span className="text-5xl md:text-7xl font-bold text-festival-pink animate-pulse">:</span>
      <AnimatedNumber value={countdown.hours} label="Hours" />
      <span className="text-5xl md:text-7xl font-bold text-festival-pink animate-pulse">:</span>
      <AnimatedNumber value={countdown.minutes} label="Minutes" />
      <span className="text-5xl md:text-7xl font-bold text-festival-pink animate-pulse">:</span>
      <AnimatedNumber value={countdown.seconds} label="Seconds" />
    </div>
  );
};
