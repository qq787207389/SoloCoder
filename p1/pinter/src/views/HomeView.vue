<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBoardStore } from '@/stores/board'
import { useCardStore } from '@/stores/card'
import { Heart, Eye, Plus, TrendingUp, Sparkles, Users, ArrowRight, Image as ImageIcon } from 'lucide-vue-next'
import MasonryCard from '@/components/MasonryCard.vue'
import BoardCard from '@/components/BoardCard.vue'

const router = useRouter()
const userStore = useUserStore()
const boardStore = useBoardStore()
const cardStore = useCardStore()

const isLoading = ref(true)
const showUploadModal = ref(false)

const hotTags = [
  { name: '设计', count: 1234 },
  { name: '风景', count: 987 },
  { name: '摄影', count: 856 },
  { name: '插画', count: 743 },
  { name: 'UI', count: 652 },
  { name: '建筑', count: 543 },
  { name: '美食', count: 432 },
  { name: '旅行', count: 398 }
]

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

function getRecentCards() {
  return Array.from(cardStore.cards.values()).slice(0, 12)
}

function getUserBoards() {
  return boardStore.getBoardsByOwner(userStore.currentUser?.id || '').slice(0, 4)
}

function getFollowingUpdates() {
  if (!userStore.currentUser) return []
  return boardStore.getFollowingBoards(userStore.currentUser.following).slice(0, 6)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-8 md:p-12 mb-10 text-white overflow-hidden relative">
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full mb-6">
            <Sparkles class="w-4 h-4" />
            <span class="text-sm font-medium">发现创意灵感</span>
          </div>
          
          <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            欢迎回来，{{ userStore.currentUser?.username }}！
          </h1>
          <p class="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
            收集精彩灵感，创建属于你的画板集，与全球创意人士一起协作创作。
          </p>
          
          <div class="flex flex-wrap gap-4">
            <button
              @click="$router.push('/create-board')"
              class="group flex items-center space-x-2 px-7 py-3.5 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus class="w-5 h-5" />
              <span>创建画板</span>
            </button>
            <button
              @click="$router.push('/explore')"
              class="group flex items-center space-x-2 px-7 py-3.5 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <Sparkles class="w-5 h-5" />
              <span>发现灵感</span>
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4 mb-5">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">热门趋势</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">发现流行标签</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in hotTags.slice(0, 6)"
              :key="tag.name"
              class="px-3.5 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4 mb-5">
            <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">我的统计</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">创作数据概览</p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span class="text-gray-600 dark:text-gray-400 font-medium">画板数量</span>
              <span class="font-bold text-gray-900 dark:text-white text-lg">{{ getUserBoards().length }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span class="text-gray-600 dark:text-gray-400 font-medium">关注用户</span>
              <span class="font-bold text-gray-900 dark:text-white text-lg">{{ userStore.currentUser?.following.length || 0 }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span class="text-gray-600 dark:text-gray-400 font-medium">粉丝数量</span>
              <span class="font-bold text-gray-900 dark:text-white text-lg">{{ userStore.currentUser?.followers.length || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4 mb-5">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl flex items-center justify-center">
              <Eye class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">快速访问</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">常用功能入口</p>
            </div>
          </div>
          <div class="space-y-2">
            <button
              @click="$router.push('/profile')"
              class="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <span class="font-medium">我的收藏</span>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              @click="$router.push('/explore')"
              class="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <span class="font-medium">探索更多</span>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              @click="$router.push('/settings')"
              class="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <span class="font-medium">账号设置</span>
              <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>

      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
              <ImageIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">我的画板</h2>
          </div>
          <button
            @click="$router.push('/profile')"
            class="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-semibold group"
          >
            <span>查看全部</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <BoardCard
            v-for="board in getUserBoards()"
            :key="board.id"
            :board="board"
          />
        </div>
      </div>

      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl flex items-center justify-center">
              <Heart class="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">最近灵感</h2>
          </div>
          <button
            @click="$router.push('/explore')"
            class="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-semibold group"
          >
            <span>查看全部</span>
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div class="masonry-grid">
          <MasonryCard
            v-for="card in getRecentCards()"
            :key="card.id"
            :card="card"
          />
        </div>
      </div>

      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center">
              <Users class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">关注动态</h2>
          </div>
        </div>
        <div v-if="getFollowingUpdates().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <BoardCard
            v-for="board in getFollowingUpdates()"
            :key="board.id"
            :board="board"
            :show-owner="true"
          />
        </div>
        <div v-else class="text-center py-16 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700">
          <div class="w-16 h-16 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Users class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">还没有关注任何人</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm mb-5">发现有趣的创意用户，获取最新灵感动态</p>
          <button
            @click="$router.push('/explore')"
            class="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <span>去发现创意用户</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
