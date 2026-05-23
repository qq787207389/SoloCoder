<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Home, Dumbbell, Calendar, BarChart3, Settings } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/exercises', icon: Dumbbell, label: '动作' },
  { path: '/plans', icon: Calendar, label: '计划' },
  { path: '/stats', icon: BarChart3, label: '统计' },
  { path: '/settings', icon: Settings, label: '设置' }
];

const isActive = (path: string) => computed(() => route.path === path);

const navigate = (path: string) => {
  router.push(path);
};
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom z-40">
    <div class="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
      <button
        v-for="item in navItems"
        :key="item.path"
        @click="navigate(item.path)"
        class="flex flex-col items-center justify-center w-full h-full py-2 px-1 transition-all duration-200"
        :class="[
          isActive(item.path)
            ? 'text-emerald-400'
            : 'text-gray-500 hover:text-gray-300'
        ]"
      >
        <component
          :is="item.icon"
          class="w-6 h-6 mb-1 transition-transform duration-200"
          :class="{ 'scale-110': isActive(item.path) }"
        />
        <span class="text-xs font-medium">{{ item.label }}</span>
        <div
          v-if="isActive(item.path)"
          class="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400"
        />
      </button>
    </div>
  </nav>
</template>
