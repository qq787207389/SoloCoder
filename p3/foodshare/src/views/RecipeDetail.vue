<template>
  <div v-if="recipe" class="animate-fade-in">
    <div class="relative rounded-3xl overflow-hidden mb-8">
      <img 
        :src="recipe.coverImage" 
        :alt="recipe.title"
        class="w-full h-64 md:h-96 object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
        <span :class="difficultyBadgeClass" class="badge mb-3">
          {{ difficultyText }}
        </span>
        <h1 class="font-serif text-3xl md:text-4xl font-bold mb-2">{{ recipe.title }}</h1>
        <p class="text-white/80 text-sm md:text-base max-w-2xl">{{ recipe.description }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div class="flex items-center space-x-4">
        <img 
          :src="recipe.author.avatar" 
          :alt="recipe.author.name"
          class="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p class="font-medium text-gray-800">{{ recipe.author.name }}</p>
          <p class="text-sm text-gray-500">{{ formatDate(recipe.createdAt) }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button 
          @click="handleLike"
          class="flex items-center space-x-2 px-4 py-2 rounded-full transition-all"
          :class="recipe.isLiked 
            ? 'bg-red-50 text-red-500' 
            : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          <Heart 
            class="w-5 h-5" 
            :class="{ 'fill-red-500': recipe.isLiked }"
          />
          <span>{{ recipe.likes }}</span>
        </button>
        <button 
          @click="handleFavorite"
          class="flex items-center space-x-2 px-4 py-2 rounded-full transition-all"
          :class="recipe.isFavorite 
            ? 'bg-primary-50 text-primary-500' 
            : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          <Bookmark 
            class="w-5 h-5" 
            :class="{ 'fill-primary-500': recipe.isFavorite }"
          />
          <span>{{ recipe.isFavorite ? '已收藏' : '收藏' }}</span>
        </button>
        <router-link 
          :to="`/cooking/${recipe.id}`"
          class="btn-primary flex items-center space-x-2"
        >
          <ChefHat class="w-5 h-5" />
          <span>开始烹饪</span>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-2xl p-4 text-center shadow-md">
        <Clock class="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <p class="text-2xl font-bold text-gray-800">{{ recipe.cookTime }}</p>
        <p class="text-sm text-gray-500">分钟</p>
      </div>
      <div class="bg-white rounded-2xl p-4 text-center shadow-md">
        <Users class="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <p class="text-2xl font-bold text-gray-800">{{ recipe.servings }}</p>
        <p class="text-sm text-gray-500">人份</p>
      </div>
      <div class="bg-white rounded-2xl p-4 text-center shadow-md">
        <ChefHat class="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <p class="text-2xl font-bold text-gray-800">{{ difficultyText }}</p>
        <p class="text-sm text-gray-500">难度</p>
      </div>
      <div class="bg-white rounded-2xl p-4 text-center shadow-md">
        <Layers class="w-8 h-8 text-primary-500 mx-auto mb-2" />
        <p class="text-2xl font-bold text-gray-800">{{ recipe.ingredients.length }}</p>
        <p class="text-sm text-gray-500">种食材</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <IngredientList 
          :ingredients="recipe.ingredients"
          :checkable="true"
          :show-add-button="true"
          @toggle="toggleIngredient"
          @add-all="addAllToShopping"
        />
      </div>
      <div>
        <StepList :steps="recipe.steps" />
      </div>
    </div>
  </div>

  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="text-center">
      <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>

  <div v-if="error" class="text-center py-20">
    <AlertCircle class="w-16 h-16 text-red-400 mx-auto mb-4" />
    <p class="text-gray-500 mb-4">{{ error }}</p>
    <router-link to="/" class="btn-primary">
      返回首页
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Heart, Bookmark, ChefHat, Clock, Users, Layers, AlertCircle } from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipe'
import { useShoppingStore } from '@/stores/shopping'
import IngredientList from '@/components/IngredientList.vue'
import StepList from '@/components/StepList.vue'
import type { Recipe } from '@/types'

const route = useRoute()
const recipeStore = useRecipeStore()
const shoppingStore = useShoppingStore()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const difficultyText = computed(() => {
  if (!recipe.value) return ''
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[recipe.value.difficulty] || '中等'
})

const difficultyBadgeClass = computed(() => {
  if (!recipe.value) return ''
  const map: Record<string, string> = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard'
  }
  return map[recipe.value.difficulty] || 'badge-medium'
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function handleLike() {
  if (!recipe.value) return
  const result = await recipeStore.likeRecipe(recipe.value.id)
  if (result && recipe.value) {
    recipe.value.likes = result.likes
    recipe.value.isLiked = result.isLiked
  }
}

async function handleFavorite() {
  if (!recipe.value) return
  const result = await recipeStore.toggleFavorite(recipe.value.id)
  if (result && recipe.value) {
    recipe.value.isFavorite = result.isFavorite
  }
}

function toggleIngredient(id: string) {
  if (!recipe.value) return
  const ingredient = recipe.value.ingredients.find(i => i.id === id)
  if (ingredient) {
    ingredient.checked = !ingredient.checked
  }
}

function addAllToShopping() {
  if (!recipe.value) return
  shoppingStore.addIngredients(recipe.value.ingredients)
}

onMounted(async () => {
  const id = route.params.id as string
  loading.value = true
  error.value = null
  
  try {
    const data = await recipeStore.fetchRecipeById(id)
    if (data) {
      recipe.value = data
    } else {
      error.value = '食谱不存在'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
})
</script>
