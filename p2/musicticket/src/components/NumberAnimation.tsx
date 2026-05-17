import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumberAnimationProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const NumberAnimation = ({ 
  value, 
  duration = 1000, 
  className = '',
  prefix = '',
  suffix = '' 
}: NumberAnimationProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = displayValue;
    const startTime = performance.now();
    const endValue = value;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startRef.current + (endValue - startRef.current) * easeOut);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayValue}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`font-bold ${className}`}
      >
        {prefix}{displayValue.toLocaleString()}{suffix}
      </motion.span>
    </AnimatePresence>
  );
};
