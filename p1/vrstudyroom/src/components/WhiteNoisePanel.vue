<script setup lang="ts">
import { CloudRain, BookOpen, Flame, Coffee, Volume2, VolumeX } from 'lucide-vue-next'
import { useNoiseStore } from '@/stores/noise'
import type { NoiseId } from '@/types'

const noiseStore = useNoiseStore()

const iconMap: Record<NoiseId, any> = {
  rain: CloudRain,
  library: BookOpen,
  fire: Flame,
  cafe: Coffee
}

function getIconComponent(id: NoiseId) {
  return iconMap[id]
}
</script>

<template>
  <div class="bg-card rounded-xl p-5 shadow-sm border border-border">
    <div class="flex items-center gap-2 mb-4">
      <Volume2 class="w-5 h-5 text-primary" />
      <h2 class="text-lg font-medium text-foreground">白噪音</h2>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-4">
      <button
        v-for="noise in noiseStore.noises"
        :key="noise.id"
        @click="noiseStore.toggleNoise(noise.id)"
        class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200"
        :class="noise.active 
          ? 'bg-primary/10 border-primary text-primary' 
          : 'bg-muted/50 border-border text-muted-foreground hover:border-accent hover:text-foreground'"
      >
        <component :is="getIconComponent(noise.id)" class="w-6 h-6" />
        <span class="text-sm font-medium">{{ noise.name }}</span>
      </button>
    </div>

    <div class="space-y-3">
      <div 
        v-for="noise in noiseStore.noises.filter(n => n.active)" 
        :key="'volume-' + noise.id"
        class="flex items-center gap-3"
      >
        <component :is="getIconComponent(noise.id)" class="w-4 h-4 text-primary" />
        <span class="text-sm text-foreground flex-1">{{ noise.name }}</span>
        <input 
          type="range"
          :value="noise.volume"
          @input="(e) => noiseStore.setVolume(noise.id, parseFloat((e.target as HTMLInputElement).value))"
          min="0"
          max="1"
          step="0.1"
          class="w-24 custom-range"
        />
        <span class="text-xs text-muted-foreground w-8">{{ Math.round(noise.volume * 100) }}%</span>
      </div>
    </div>

    <div 
      v-if="noiseStore.noises.some(n => n.active)"
      class="mt-4 pt-4 border-t border-border"
    >
      <div class="flex items-center gap-3">
        <VolumeX class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm text-foreground flex-1">总音量</span>
        <input 
          type="range"
          :value="noiseStore.globalVolume"
          @input="(e) => noiseStore.setGlobalVolume(parseFloat((e.target as HTMLInputElement).value))"
          min="0"
          max="1"
          step="0.1"
          class="w-24 custom-range"
        />
        <span class="text-xs text-muted-foreground w-8">{{ Math.round(noiseStore.globalVolume * 100) }}%</span>
      </div>
    </div>

    <div v-if="!noiseStore.noises.some(n => n.active)" class="text-center py-4 text-muted-foreground">
      <p class="text-sm">点击上方图标开启白噪音</p>
    </div>
  </div>
</template>
