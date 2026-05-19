<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useUserStore } from '@/stores/user'
import { Search, Sun, Moon, Plus, User, Bell, Settings, LogOut, Palette, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { theme, toggleTheme } = useTheme()
const userStore = useUserStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const showNotifications = ref(false)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    searchQuery.value = ''
  }
}

function navigateTo(path: string) {
  router.push(path)
  showUserMenu.value = false
}

const mockNotifications = [
  { id: 1, content: '用户2 点赞了你的图片', time: '5分钟前', read: false },
  { id: 2, content: '用户3 评论了你的画板', time: '1小时前', read: false },
  { id: 3, content: '你有新的协作邀请', time: '2小时前', read: true }
]
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Palette class="w-6 h-6 text-white" />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                画板集 Pro
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">灵感收集与协作平台</span>
            </div>
          </router-link>

          <div class="hidden md:flex items-center space-x-1">
            <router-link
              to="/"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                route.path === '/'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              首页
            </router-link>
            <router-link
              to="/explore"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                route.path === '/explore'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              发现
            </router-link>
          </div>
        </div>

        <div class="flex-1 max-w-lg mx-8">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索图片、画板、标签、用户..."
              class="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 transition-all duration-200"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button
            @click="navigateTo('/create-board')"
            class="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">创建画板</span>
          </button>

          <button
            @click="toggleTheme"
            class="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <Sun v-if="theme === 'dark'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <Bell class="w-5 h-5" />
              <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">通知中心</h3>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div
                  v-for="notification in mockNotifications"
                  :key="notification.id"
                  :class="[
                    'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
                    !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                  ]"
                >
                  <p class="text-sm text-gray-900 dark:text-white">{{ notification.content }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              <div class="relative">
                <img
                  :src="userStore.currentUser?.avatar"
                  :alt="userStore.currentUser?.username"
                  class="w-9 h-9 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                />
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div class="hidden sm:flex flex-col items-start">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ userStore.currentUser?.username }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">创意达人</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div class="flex items-center space-x-3">
                  <img
                    :src="userStore.currentUser?.avatar"
                    :alt="userStore.currentUser?.username"
                    class="w-12 h-12 rounded-2xl object-cover"
                  />
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ userStore.currentUser?.username }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ userStore.currentUser?.email }}
                    </p>
                  </div>
                </div>
              </div>

              <button
                @click="navigateTo('/profile')"
                class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User class="w-4 h-4" />
                <span>个人主页</span>
              </button>

              <button
                @click="navigateTo('/settings')"
                class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings class="w-4 h-4" />
                <span>账号设置</span>
              </button>

              <div class="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                <button class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <LogOut class="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
