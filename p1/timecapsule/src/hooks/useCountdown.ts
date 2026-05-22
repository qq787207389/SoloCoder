import { useState, useEffect, useRef } from 'react';
import { getTimeRemaining } from '../utils';

export const useCountdown = (unlockTime: number) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(unlockTime));
  const [isUnlocked, setIsUnlocked] = useState(timeRemaining <= 0);
  const isUnlockedRef = useRef(isUnlocked);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlockedRef.current) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(unlockTime);
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsUnlocked(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [unlockTime]);

  return { timeRemaining, isUnlocked };
};
