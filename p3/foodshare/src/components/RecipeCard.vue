<template>
  <router-link 
    :to="`/recipe/${recipe.id}`"
    class="card masonry-item block group"
  >
    <div class="relative overflow-hidden">
      <div 
        v-if="!imageLoaded" 
        class="img-placeholder w-full aspect-[4/3]"
      ></div>
      <img
        :src="recipe.coverImage"
        :alt="recipe.title"
        class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110"
        :class="{ 'opacity-0': !imageLoaded, 'opacity-100 animate-fade-in': imageLoaded }"
        @load="imageLoaded = true"
        loading="lazy"
      />
      <div class="absolute top-3 right-3">
        <span :class="difficultyBadgeClass" class="badge">
          {{ difficultyText }}
        </span>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="font-serif font-bold text-lg text-gray-800 mb-2 line-clamp-1">
        {{ recipe.title }}
      </h3>
      <p class="text-gray-500 text-sm mb-3 line-clamp-2">
        {{ recipe.description }}
      </p>
      
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center space-x-1">
          <Clock class="w-4 h-4 text-gray-400" />
          <span class="text-gray-500">{{ recipe.cookTime }}分钟</span>
        </div>
        <div class="flex items-center space-x-1">
          <Heart 
            class="w-4 h-4" 
            :class="recipe.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'"
          />
          <span class="text-gray-500">{{ recipe.likes }}</span>
        </div>
      </div>

      <div class="flex items-center mt-3 pt-3 border-t border-gray-100">
        <img 
          :src="recipe.author.avatar" 
          :alt="recipe.author.name"
          class="w-6 h-6 rounded-full object-cover mr-2"
        />
        <span class="text-sm text-gray-600">{{ recipe.author.name }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, Heart } from 'lucide-vue-next'
import type { Recipe } from '@/types'

const props = defineProps<{
  recipe: Recipe
}>()

const imageLoaded = ref(false)

const difficultyText = computed(() => {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[props.recipe.difficulty] || '中等'
})

const difficultyBadgeClass = computed(() => {
  const map: Record<string, string> = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard'
  }
  return map[props.recipe.difficulty] || 'badge-medium'
})
</script>
