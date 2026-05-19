<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Board } from '@/types'
import { Lock, Users, Eye } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'

interface Props {
  board: Board
  showOwner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showOwner: false
})

const router = useRouter()
const userStore = useUserStore()

function getVisibilityIcon() {
  switch (props.board.visibility) {
    case 'private':
      return Lock
    case 'collaborative':
      return Users
    default:
      return Eye
  }
}

function getVisibilityText() {
  switch (props.board.visibility) {
    case 'private':
      return '私密'
    case 'collaborative':
      return '协作'
    default:
      return '公开'
  }
}

function goToBoard() {
  router.push(`/board/${props.board.id}`)
}

const owner = userStore.getUserById(props.board.ownerId)
</script>

<template>
  <div
    class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    @click="goToBoard"
  >
    <div class="relative h-32 overflow-hidden">
      <img
        :src="board.cover"
        :alt="board.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div class="absolute bottom-3 left-3 right-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white truncate">{{ board.title }}</h3>
          <span class="flex items-center space-x-1 text-white/80 text-xs">
            <component :is="getVisibilityIcon()" class="w-3 h-3" />
            <span>{{ getVisibilityText() }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="p-4">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {{ board.description }}
      </p>

      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in board.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
        >
          #{{ tag }}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div v-if="showOwner && owner" class="flex items-center space-x-2">
          <img
            :src="owner.avatar"
            :alt="owner.username"
            class="w-6 h-6 rounded-full object-cover"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ owner.username }}</span>
        </div>
        
        <div class="flex items-center space-x-4 text-gray-500 dark:text-gray-400 text-sm">
          <span>{{ board.cardIds.length }} 张图片</span>
          <span>{{ board.collaborators.length + 1 }} 人</span>
        </div>
      </div>
    </div>
  </div>
</template>
