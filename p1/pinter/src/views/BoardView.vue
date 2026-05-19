<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { useCardStore } from '@/stores/card'
import { useUserStore } from '@/stores/user'
import { Plus, Share2, Users, Settings, Lock, Eye, Edit3, Trash2 } from 'lucide-vue-next'
import MasonryCard from '@/components/MasonryCard.vue'

const route = useRoute()
const boardStore = useBoardStore()
const cardStore = useCardStore()
const userStore = useUserStore()

const boardId = computed(() => route.params.id as string)
const board = computed(() => boardStore.getBoardById(boardId.value))
const cards = computed(() => cardStore.getCardsByBoard(boardId.value))
const owner = computed(() => userStore.getUserById(board.value?.ownerId || ''))

const showShareModal = ref(false)
const showSettingsModal = ref(false)

function getVisibilityIcon() {
  switch (board.value?.visibility) {
    case 'private':
      return Lock
    case 'collaborative':
      return Users
    default:
      return Eye
  }
}

function getVisibilityText() {
  switch (board.value?.visibility) {
    case 'private':
      return '私密画板'
    case 'collaborative':
      return '协作画板'
    default:
      return '公开画板'
  }
}
</script>

<template>
  <div v-if="board" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="relative h-64 overflow-hidden">
      <img
        :src="board.cover"
        :alt="board.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <div class="flex items-center space-x-3 mb-2">
              <span class="flex items-center space-x-1 text-white/80 text-sm">
                <component :is="getVisibilityIcon()" class="w-4 h-4" />
                <span>{{ getVisibilityText() }}</span>
              </span>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ board.title }}</h1>
            <p class="text-white/80">{{ board.description }}</p>
            <div class="flex items-center space-x-4 mt-4">
              <div v-if="owner" class="flex items-center space-x-2">
                <img
                  :src="owner.avatar"
                  :alt="owner.username"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="text-white font-medium">{{ owner.username }}</span>
              </div>
              <span class="text-white/60">{{ board.cardIds.length }} 张图片</span>
              <span class="text-white/60">{{ board.collaborators.length + 1 }} 位协作者</span>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button
              class="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Share2 class="w-4 h-4" />
              <span>分享</span>
            </button>
            <button
              class="flex items-center space-x-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus class="w-4 h-4" />
              <span>添加图片</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-wrap gap-2 mb-8">
        <span
          v-for="tag in board.tags"
          :key="tag"
          class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
        >
          #{{ tag }}
        </span>
      </div>

      <div v-if="cards.length > 0" class="masonry-grid">
        <MasonryCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
        />
      </div>

      <div v-else class="text-center py-20">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">画板还是空的</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">添加第一张图片，开始你的灵感收集之旅</p>
        <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          上传图片
        </button>
      </div>
    </div>
  </div>
</template>
