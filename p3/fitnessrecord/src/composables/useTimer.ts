import { ref, onMounted, onUnmounted } from 'vue';

export const useTimer = () => {
  const remainingSeconds = ref(0);
  const isRunning = ref(false);
  const isPaused = ref(false);
  const totalSeconds = ref(0);
  const startTime = ref<number>(0);
  const pausedRemaining = ref(0);

  let intervalId: number | null = null;

  const start = (seconds: number) => {
    if (seconds <= 0) return;
    
    totalSeconds.value = seconds;
    remainingSeconds.value = seconds;
    startTime.value = Date.now();
    isRunning.value = true;
    isPaused.value = false;

    startInterval();
  };

  const startInterval = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = window.setInterval(() => {
      if (!isPaused.value && startTime.value > 0) {
        const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
        remainingSeconds.value = Math.max(0, totalSeconds.value - elapsed);

        if (remainingSeconds.value <= 0) {
          stop();
          onTimerEnd?.();
        }
      }
    }, 100);
  };

  const pause = () => {
    if (!isRunning.value || isPaused.value) return;
    isPaused.value = true;
    pausedRemaining.value = remainingSeconds.value;
  };

  const resume = () => {
    if (!isPaused.value) return;
    isPaused.value = false;
    totalSeconds.value = pausedRemaining.value;
    startTime.value = Date.now();
  };

  const stop = () => {
    isRunning.value = false;
    isPaused.value = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const reset = () => {
    stop();
    remainingSeconds.value = 0;
    totalSeconds.value = 0;
    startTime.value = 0;
  };

  const handleVisibilityChange = () => {
    if (!document.hidden && isRunning.value && !isPaused.value && startTime.value > 0) {
      const elapsed = Math.floor((Date.now() - startTime.value) / 1000);
      const newRemaining = Math.max(0, totalSeconds.value - elapsed);
      
      if (newRemaining !== remainingSeconds.value) {
        remainingSeconds.value = newRemaining;
        
        if (remainingSeconds.value <= 0) {
          stop();
          onTimerEnd?.();
        }
      }
    }
  };

  let onTimerEnd: (() => void) | null = null;

  const onEnd = (callback: () => void) => {
    onTimerEnd = callback;
  };

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    remainingSeconds,
    isRunning,
    isPaused,
    totalSeconds,
    start,
    pause,
    resume,
    stop,
    reset,
    onEnd
  };
};
