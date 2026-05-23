<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}>();

const size = computed(() => props.size || 160);
const strokeWidth = computed(() => props.strokeWidth || 12);
const color = computed(() => props.color || '#10b981');
const bgColor = computed(() => props.bgColor || '#1f2937');

const radius = computed(() => (size.value - strokeWidth.value) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (props.progress / 100) * circumference.value);

const displayProgress = computed(() => Math.min(100, Math.max(0, props.progress)));
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="size" :height="size" class="transform -rotate-90">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke="bgColor"
        fill="none"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke="color"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
        :style="{ filter: `drop-shadow(0 0 8px ${color})` }"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-4xl font-bold text-white">{{ displayProgress }}%</span>
      <span class="text-sm text-gray-400 mt-1">完成度</span>
    </div>
  </div>
</template>
