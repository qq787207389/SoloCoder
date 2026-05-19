<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCardStore } from '@/stores/card'
import { useBoardStore } from '@/stores/board'
import { Search as SearchIcon, Grid, Image, Tag, X, Clock, TrendingUp } from 'lucide-vue-next'
import MasonryCard from '@/components/MasonryCard.vue'
import BoardCard from '@/components/BoardCard.vue'

const route = useRoute()
const cardStore = useCardStore()
const boardStore = useBoardStore()

const searchQuery = ref('')
const searchType = ref<'all' | 'cards' | 'boards'>('all')
const searchHistory = ref<string[]>([])
const hotTags = ['设计', 'UI', '风景', '摄影', '插画', '建筑', '美食', '旅行']

onMounted(() => {
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
  }
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return { cards: [], boards: [] }
  }

  const query = searchQuery.value.toLowerCase()
  
  const cards = Array.from(cardStore.cards.values()).filter(
    card =>
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.tags.some(tag => tag.toLowerCase().includes(query))
  )

  const boards = Array.from(boardStore.boards.values()).filter(
    board =>
      board.title.toLowerCase().includes(query) ||
      board.description.toLowerCase().includes(query) ||
      board.tags.some(tag => tag.toLowerCase().includes(query))
  )

  return { cards, boards }
})

function searchByTag(tag: string) {
  searchQuery.value = tag
}

function clearSearch() {
  searchQuery.value = ''
}

function removeFromHistory(index: number) {
  searchHistory.value.splice(index, 1)
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <div class="relative mb-4">
        <SearchIcon class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索图片、画板、标签..."
          class="w-full pl-14 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center space-x-4">
        <button
          @click="searchType = 'all'"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            searchType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          全部
        </button>
        <button
          @click="searchType = 'cards'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            searchType === 'cards'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          <Image class="w-4 h-4" />
          <span>图片</span>
        </button>
        <button
          @click="searchType = 'boards'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            searchType === 'boards'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          <Grid class="w-4 h-4" />
          <span>画板</span>
        </button>
      </div>
    </div>

    <div v-if="!searchQuery.trim()" class="space-y-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center space-x-2 mb-4">
          <TrendingUp class="w-5 h-5 text-orange-500" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">热门标签</h2>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="tag in hotTags"
            :key="tag"
            @click="searchByTag(tag)"
            class="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-all"
          >
            <Tag class="w-4 h-4" />
            <span class="font-medium">{{ tag }}</span>
          </button>
        </div>
      </div>

      <div v-if="searchHistory.length > 0" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <Clock class="w-5 h-5 text-gray-500" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">搜索历史</h2>
          </div>
          <button
            @click="searchHistory = []"
            class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            清空
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(history, index) in searchHistory"
            :key="index"
            @click="searchByTag(history)"
            class="group flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span class="text-sm">{{ history }}</span>
            <X
              class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="removeFromHistory(index)"
            />
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          搜索结果: "{{ searchQuery }}"
          <span class="text-gray-500 dark:text-gray-400 font-normal ml-2">
            ({{ searchResults.cards.length + searchResults.boards.length }} 个结果)
          </span>
        </h2>
      </div>

      <div v-if="(searchType === 'all' || searchType === 'cards') && searchResults.cards.length > 0" class="mb-12">
        <h3 class="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
          <Image class="w-4 h-4" />
          <span>图片 ({{ searchResults.cards.length }})</span>
        </h3>
        <div class="masonry-grid">
          <MasonryCard
            v-for="card in searchResults.cards"
            :key="card.id"
            :card="card"
          />
        </div>
      </div>

      <div v-if="(searchType === 'all' || searchType === 'boards') && searchResults.boards.length > 0">
        <h3 class="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
          <Grid class="w-4 h-4" />
          <span>画板 ({{ searchResults.boards.length }})</span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <BoardCard
            v-for="board in searchResults.boards"
            :key="board.id"
            :board="board"
          />
        </div>
      </div>

      <div
        v-if="
          searchResults.cards.length === 0 &&
          searchResults.boards.length === 0
        "
        class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl"
      >
        <SearchIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          未找到相关结果
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          尝试使用其他关键词搜索，或浏览热门标签
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="tag in hotTags.slice(0, 5)"
            :key="tag"
            @click="searchByTag(tag)"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            #{{ tag }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
