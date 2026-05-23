<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Trophy } from 'lucide-vue-next';

const props = defineProps<{
  exerciseName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const showConfetti = ref(false);
const particles = ref<Array<{ id: number; x: number; y: number; color: string; delay: number; size: number }>>([]);

const colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const generateConfetti = () => {
  particles.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 8
  }));
};

const handleClose = () => {
  emit('close');
};

onMounted(() => {
  showConfetti.value = true;
  generateConfetti();
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="relative">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute rounded-full animate-fall"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          animationDelay: `${particle.delay}s`
        }"
      />

      <div class="relative z-10 bg-gray-800 rounded-3xl p-8 text-center shadow-2xl border border-gray-700 animate-bounce-in">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Trophy class="w-10 h-10 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">🎉 新纪录！</h2>
        <p class="text-xl text-emerald-400 font-semibold mb-4">{{ exerciseName }}</p>
        <p class="text-gray-400 mb-6">你打破了自己的个人最佳纪录！</p>
        <button
          @click="handleClose"
          class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
        >
          太棒了！
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fall {
  animation: fall 3s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>
