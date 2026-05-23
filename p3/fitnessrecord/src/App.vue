<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import BottomNav from '@/components/layout/BottomNav.vue';

const route = useRoute();

const showBottomNav = computed(() => {
  return route.path !== '/workout';
});
</script>

<template>
  <div class="min-h-screen bg-gray-950">
    <router-view />
    <BottomNav v-if="showBottomNav" />
  </div>
</template>