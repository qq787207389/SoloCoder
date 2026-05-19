<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useCardStore } from '@/stores/card'
import { Grid, List, Filter } from 'lucide-vue-next'
import MasonryCard from '@/components/MasonryCard.vue'
import BoardCard from '@/components/BoardCard.vue'

type ViewMode = 'cards' | 'boards'

const boardStore = useBoardStore()
const cardStore = useCardStore()

const viewMode = ref<ViewMode>('cards')
const selectedCategory = ref('all')
const sortBy = ref('latest')

const categories = [
  { id: 'all', name: '全部' },
  { id: 'design', name: '设计' },
  { id: 'photography', name: '摄影' },
  { id: 'illustration', name: '插画' },
  { id: 'architecture', name: '建筑' },
  { id: 'nature', name: '自然' }
]

const allCards = computed(() => Array.from(cardStore.cards.values()))
const allBoards = computed(() => boardStore.publicBoards)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">发现灵感</h1>
      <p class="text-gray-600 dark:text-gray-400">探索来自全球创意人士的精彩作品</p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div class="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
        <button
          @click="viewMode = 'cards'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'cards'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <Grid class="w-4 h-4" />
          <span>图片</span>
        </button>
        <button
          @click="viewMode = 'boards'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            viewMode === 'boards'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <List class="w-4 h-4" />
          <span>画板</span>
        </button>
      </div>

      <div class="flex items-center space-x-4">
        <select
          v-model="selectedCategory"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="sortBy"
          class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">最新发布</option>
          <option value="popular">最受欢迎</option>
          <option value="trending">热门趋势</option>
        </select>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-8">
      <span
        v-for="tag in ['设计', 'UI', '插画', '摄影', '风景', '建筑', '美食', '旅行', '时尚', '艺术']"
        :key="tag"
        class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
      >
        #{{ tag }}
      </span>
    </div>

    <div v-if="viewMode === 'cards'" class="masonry-grid">
      <MasonryCard
        v-for="card in allCards"
        :key="card.id"
        :card="card"
      />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <BoardCard
        v-for="board in allBoards"
        :key="board.id"
        :board="board"
        :show-owner="true"
      />
    </div>
  </div>
</template>
