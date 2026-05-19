<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Card } from '@/types'
import { Heart, MessageCircle, MoreHorizontal, Download } from 'lucide-vue-next'
import { useCardStore } from '@/stores/card'
import { useUserStore } from '@/stores/user'

interface Props {
  card: Card
}

const props = defineProps<Props>()

const router = useRouter()
const cardStore = useCardStore()
const userStore = useUserStore()

const isLiked = ref(props.card.likes.includes(userStore.currentUser?.id || ''))
const isHovered = ref(false)
const isImageLoaded = ref(false)

function toggleLike(e: Event) {
  e.stopPropagation()
  if (!userStore.currentUser) return
  
  isLiked.value = !isLiked.value
  cardStore.toggleLike(props.card.id, userStore.currentUser.id)
}

function goToCard() {
  router.push(`/card/${props.card.id}`)
}

function goToBoard() {
  router.push(`/board/${props.card.boardId}`)
}
</script>

<template>
  <div
    class="masonry-item group"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      @click="goToCard"
    >
      <div class="relative">
        <img
          :src="card.imageUrl"
          :alt="card.title"
          class="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          :class="[isImageLoaded ? 'loaded' : '', 'lazy-image']"
          @load="isImageLoaded = true"
        />
        
        <div
          :class="[
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          ]"
        />

        <div
          :class="[
            'absolute top-3 right-3 flex space-x-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          ]"
        >
          <button
            class="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            @click.stop="toggleLike"
          >
            <Heart
              class="w-4 h-4 transition-colors"
              :class="isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'"
            />
          </button>
          <button
            class="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            @click.stop
          >
            <Download class="w-4 h-4 text-gray-700" />
          </button>
          <button
            class="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            @click.stop
          >
            <MoreHorizontal class="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div class="p-4">
        <h3 class="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
          {{ card.title }}
        </h3>
        
        <div class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="tag in card.tags.slice(0, 3)"
            :key="tag"
            class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
          >
            #{{ tag }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 text-gray-500 dark:text-gray-400 text-sm">
            <span class="flex items-center space-x-1">
              <Heart class="w-4 h-4" :class="card.likes.length > 0 ? 'fill-red-500 text-red-500' : ''" />
              <span>{{ card.likes.length }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <MessageCircle class="w-4 h-4" />
              <span>{{ card.commentIds.length }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
