<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { useUserStore } from '@/stores/user'
import { Image, Eye, Lock, Users, X } from 'lucide-vue-next'

const router = useRouter()
const boardStore = useBoardStore()
const userStore = useUserStore()

const title = ref('')
const description = ref('')
const visibility = ref<'public' | 'private' | 'collaborative'>('public')
const tags = ref<string[]>([])
const newTag = ref('')
const coverImage = ref('https://picsum.photos/seed/new-board/800/400')

const visibilityOptions = [
  { value: 'public', label: '公开', icon: Eye, description: '所有人都可以看到' },
  { value: 'private', label: '私密', icon: Lock, description: '只有你可以看到' },
  { value: 'collaborative', label: '协作', icon: Users, description: '你和协作者可以编辑' }
]

function addTag() {
  if (newTag.value.trim() && !tags.value.includes(newTag.value.trim())) {
    tags.value.push(newTag.value.trim())
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag)
}

async function createBoard() {
  if (!title.value.trim()) return
  
  const board = await boardStore.createBoard({
    title: title.value,
    description: description.value,
    cover: coverImage.value,
    visibility: visibility.value,
    ownerId: userStore.currentUser?.id || '',
    collaborators: [],
    cardIds: [],
    tags: tags.value,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  router.push(`/board/${board.id}`)
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="p-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">创建新画板</h1>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            封面图片
          </label>
          <div class="relative h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              :src="coverImage"
              alt="封面预览"
              class="w-full h-full object-cover"
            />
            <button class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Image class="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            画板标题 *
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="给你的画板起个名字"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            描述
          </label>
          <textarea
            v-model="description"
            placeholder="描述一下这个画板..."
            rows="3"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            可见性
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              v-for="option in visibilityOptions"
              :key="option.value"
              @click="visibility = option.value as any"
              :class="[
                'p-4 rounded-lg border-2 text-left transition-all',
                visibility === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <component
                :is="option.icon"
                :class="[
                  'w-6 h-6 mb-2',
                  visibility === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                ]"
              />
              <div
                :class="[
                  'font-medium mb-1',
                  visibility === option.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                ]"
              >
                {{ option.label }}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</p>
            </button>
          </div>
        </div>

        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签
          </label>
          <div class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="tag in tags"
              :key="tag"
              class="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full"
            >
              <span>#{{ tag }}</span>
              <button @click="removeTag(tag)" class="hover:text-blue-800 dark:hover:text-blue-300">
                <X class="w-4 h-4" />
              </button>
            </span>
          </div>
          <div class="flex space-x-2">
            <input
              v-model="newTag"
              type="text"
              placeholder="添加标签..."
              class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              @keyup.enter="addTag"
            />
            <button
              @click="addTag"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              添加
            </button>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-4">
          <button
            @click="$router.back()"
            class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="createBoard"
            :disabled="!title.trim()"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            创建画板
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
