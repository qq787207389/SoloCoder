<script setup lang="ts">
import { computed, watch } from 'vue';
import { Pause, Play, X, Volume2, VolumeX } from 'lucide-vue-next';
import { useTimer } from '@/composables/useTimer';
import { formatTime } from '@/utils/storage';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  seconds: number;
  show?: boolean;
}>();

const emit = defineEmits<{
  (e: 'end'): void;
  (e: 'close'): void;
}>();

const settingsStore = useSettingsStore();
const timer = useTimer();

const progress = computed(() => {
  if (timer.totalSeconds.value === 0) return 0;
  return ((timer.totalSeconds.value - timer.remainingSeconds.value) / timer.totalSeconds.value) * 100;
});

const isTimeUp = computed(() => timer.remainingSeconds.value === 0 && timer.isRunning.value === false);

const formattedTime = computed(() => formatTime(timer.remainingSeconds.value));

const playSound = () => {
  if (settingsStore.settings.soundEnabled) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } catch {
      // 忽略音频错误
    }
  }
};

timer.onEnd(() => {
  playSound();
  emit('end');
});

watch(() => props.show, (newVal) => {
  if (newVal && props.seconds > 0) {
    timer.start(props.seconds);
  }
});

watch(() => props.seconds, (newVal) => {
  if (props.show && newVal > 0) {
    timer.start(newVal);
  }
});

const togglePause = () => {
  if (timer.isPaused.value) {
    timer.resume();
  } else {
    timer.pause();
  }
};

const closeTimer = () => {
  timer.stop();
  emit('close');
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <div class="text-center">
        <div class="relative w-48 h-48 mx-auto mb-8">
          <svg class="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke-width="8"
              stroke="#1f2937"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke-width="8"
              :stroke="isTimeUp ? '#10b981' : '#3b82f6'"
              fill="none"
              stroke-dasharray="553"
              :stroke-dashoffset="553 - (progress / 100) * 553"
              stroke-linecap="round"
              class="transition-all duration-100"
              :style="{ filter: isTimeUp ? 'drop-shadow(0 0 12px #10b981)' : '' }"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span
              class="text-5xl font-bold font-mono transition-all duration-200"
              :class="isTimeUp ? 'text-emerald-400 animate-pulse' : 'text-white'"
            >
              {{ formattedTime }}
            </span>
            <span class="text-gray-400 text-sm mt-2">休息中</span>
          </div>
        </div>

        <div v-if="isTimeUp" class="mb-6">
          <p class="text-emerald-400 text-xl font-semibold animate-bounce">
            💪 休息结束！准备下一组
          </p>
        </div>

        <div class="flex justify-center gap-4">
          <button
            v-if="!isTimeUp"
            @click="togglePause"
            class="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
          >
            <Pause v-if="!timer.isPaused" class="w-6 h-6 text-white" />
            <Play v-else class="w-6 h-6 text-white" />
          </button>
          <button
            @click="closeTimer"
            class="w-14 h-14 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-200"
          >
            <X class="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
