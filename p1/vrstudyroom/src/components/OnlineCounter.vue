<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<template>
  <div class="flex items-center gap-2 text-muted-foreground">
    <Users class="w-4 h-4 animate-breathe" />
    <span class="text-sm">
      <span class="font-medium text-foreground">{{ appStore.onlineCount }}</span>
      人正在自习
    </span>
  </div>
</template>
