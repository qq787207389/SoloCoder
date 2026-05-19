<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import { useCardStore } from '@/stores/card'
import Navbar from '@/components/Navbar.vue'

const userStore = useUserStore()
const boardStore = useBoardStore()
const cardStore = useCardStore()

onMounted(() => {
  userStore.initMockUsers()
  boardStore.initMockBoards()
  cardStore.initMockCards()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <main class="pt-16">
      <router-view />
    </main>
  </div>
</template>
