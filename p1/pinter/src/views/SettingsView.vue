<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useUserStore } from '@/stores/user'
import { Sun, Moon, User, Bell, Shield, Palette, Globe, Save } from 'lucide-vue-next'

const { theme, toggleTheme, fontSize, applyFontSize } = useTheme()
const userStore = useUserStore()

const username = ref(userStore.currentUser?.username || '')
const email = ref(userStore.currentUser?.email || '')
const bio = ref(userStore.currentUser?.bio || '')
const notificationsEnabled = ref(true)
const privateAccount = ref(false)

const activeSection = ref('profile')

const sections = [
  { id: 'profile', label: '个人资料', icon: User },
  { id: 'appearance', label: '外观设置', icon: Palette },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'privacy', label: '隐私安全', icon: Shield }
]

function saveSettings() {
  alert('设置已保存！')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">设置</h1>

    <div class="flex flex-col md:flex-row gap-8">
      <div class="w-full md:w-48 flex-shrink-0">
        <nav class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors',
              activeSection === section.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="section.icon" class="w-5 h-5" />
            <span class="font-medium">{{ section.label }}</span>
          </button>
        </nav>
      </div>

      <div class="flex-1">
        <div v-if="activeSection === 'profile'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">个人资料</h2>
          
          <div class="flex items-center space-x-6 mb-6">
            <img
              :src="userStore.currentUser?.avatar"
              :alt="userStore.currentUser?.username"
              class="w-20 h-20 rounded-full object-cover"
            />
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
              更换头像
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                用户名
              </label>
              <input
                v-model="username"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱地址
              </label>
              <input
                v-model="email"
                type="email"
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                个人简介
              </label>
              <textarea
                v-model="bio"
                rows="3"
                placeholder="介绍一下你自己..."
                class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div v-else-if="activeSection === 'appearance'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">外观设置</h2>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Sun class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">深色模式</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">切换浅色/深色主题</div>
                </div>
              </div>
              <button
                @click="toggleTheme"
                :class="[
                  'relative w-12 h-6 rounded-full transition-colors',
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    theme === 'dark' ? 'left-7' : 'left-1'
                  ]"
                />
              </button>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Globe class="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">字体大小</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">调整界面字体大小</div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="applyFontSize('small')"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    fontSize === 'small'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  ]"
                >
                  小
                </button>
                <button
                  @click="applyFontSize('medium')"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    fontSize === 'medium'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  ]"
                >
                  中
                </button>
                <button
                  @click="applyFontSize('large')"
                  :class="[
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    fontSize === 'large'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                  ]"
                >
                  大
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeSection === 'notifications'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">通知设置</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">浏览器通知</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">接收画板更新和评论通知</div>
              </div>
              <button
                @click="notificationsEnabled = !notificationsEnabled"
                :class="[
                  'relative w-12 h-6 rounded-full transition-colors',
                  notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    notificationsEnabled ? 'left-7' : 'left-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeSection === 'privacy'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">隐私安全</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">私密账户</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">只有你批准的用户才能查看你的画板</div>
              </div>
              <button
                @click="privateAccount = !privateAccount"
                :class="[
                  'relative w-12 h-6 rounded-full transition-colors',
                  privateAccount ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    privateAccount ? 'left-7' : 'left-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="saveSettings"
            class="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Save class="w-4 h-4" />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
