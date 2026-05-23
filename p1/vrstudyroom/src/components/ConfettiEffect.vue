<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const confettiPieces = ref<Array<{
  id: number
  left: number
  color: string
  delay: number
  duration: number
  size: number
}>>([])

const colors = ['#7D9D8D', '#E8A598', '#D4C4B0', '#F4E4C1', '#B8D4BE']

function generateConfetti() {
  confettiPieces.value = []
  for (let i = 0; i < 50; i++) {
    confettiPieces.value.push({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8
    })
  }
}

watch(() => appStore.showConfetti, (show) => {
  if (show) {
    generateConfetti()
  }
})

onMounted(() => {
  if (appStore.showConfetti) {
    generateConfetti()
  }
})
</script>

<template>
  <div v-if="appStore.showConfetti" class="fixed inset-0 pointer-events-none overflow-hidden z-50">
    <div
      v-for="piece in confettiPieces"
      :key="piece.id"
      class="absolute"
      :style="{
        left: piece.left + '%',
        width: piece.size + 'px',
        height: piece.size + 'px',
        backgroundColor: piece.color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`
      }"
    />
  </div>
</template>
