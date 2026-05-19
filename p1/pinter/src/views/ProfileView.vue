<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import { useCardStore } from '@/stores/card'
import { Users, Grid, Heart, Settings, Edit3 } from 'lucide-vue-next'
import BoardCard from '@/components/BoardCard.vue'
import MasonryCard from '@/components/MasonryCard.vue'

const route = useRoute()
const userStore = useUserStore()
const boardStore = useBoardStore()
const cardStore = useCardStore()

const userId = computed(() => (route.params.id as string) || userStore.currentUser?.id)
const profileUser = computed(() => userStore.getUserById(userId.value))
const userBoards = computed(() => boardStore.getBoardsByOwner(userId.value))
const likedCards = computed(() => cardStore.getLikedCards(userId.value))

const activeTab = computed(() => route.query.tab || 'boards')

const isOwnProfile = computed(() => userId.value === userStore.currentUser?.id)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="profileUser" class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
      <div class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
        <img
          :src="profileUser.avatar"
          :alt="profileUser.username"
          class="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
        />
        
        <div class="flex-1 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-4 mb-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ profileUser.username }}</h1>
            <button
              v-if="isOwnProfile"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Edit3 class="w-5 h-5" />
            </button>
          </div>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ profileUser.bio || '这个人很懒，什么都没写' }}</p>
          
          <div class="flex items-center justify-center md:justify-start space-x-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ userBoards.length }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">画板</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ profileUser.followers.length }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">粉丝</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ profileUser.following.length }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">关注</div>
            </div>
          </div>
        </div>

        <div class="flex flex-col space-y-3">
          <button
            v-if="!isOwnProfile"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            关注
          </button>
          <button
            v-if="isOwnProfile"
            @click="$router.push('/settings')"
            class="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings class="w-4 h-4" />
            <span>设置</span>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
      <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
          @click="$router.push({ query: { tab: 'boards' } })"
          :class="[
            'flex items-center space-x-2 px-6 py-4 font-medium transition-colors',
            activeTab === 'boards'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <Grid class="w-4 h-4" />
          <span>画板</span>
        </button>
        <button
          @click="$router.push({ query: { tab: 'likes' } })"
          :class="[
            'flex items-center space-x-2 px-6 py-4 font-medium transition-colors',
            activeTab === 'likes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <Heart class="w-4 h-4" />
          <span>喜欢</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'boards'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <BoardCard
        v-for="board in userBoards"
        :key="board.id"
        :board="board"
      />
    </div>

    <div v-else-if="activeTab === 'likes'" class="masonry-grid">
      <MasonryCard
        v-for="card in likedCards"
        :key="card.id"
        :card="card"
      />
    </div>
  </div>
</template>
