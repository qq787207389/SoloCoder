<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h1 class="font-serif text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        发现美味食谱
      </h1>
      <p class="text-gray-500">探索数千道精选美食，开启你的烹饪之旅</p>
    </div>

    <div class="bg-white rounded-2xl p-4 shadow-md mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索菜名或食材..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-400 focus:bg-white focus:outline-none transition-all"
            @input="handleSearch"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="selectedCategory"
            class="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-400 focus:bg-white focus:outline-none transition-all cursor-pointer"
            @change="handleCategoryChange"
          >
            <option value="">全部分类</option>
            <option v-for="cat in recipeStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
          <select
            v-model="selectedDifficulty"
            class="px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-400 focus:bg-white focus:outline-none transition-all cursor-pointer"
            @change="handleDifficultyChange"
          >
            <option value="">全部难度</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="cat in recipeStore.categories"
        :key="cat.id"
        @click="toggleCategory(cat.id)"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="selectedCategory === cat.id 
          ? 'bg-primary-500 text-white' 
          : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <div v-if="recipeStore.loading && recipeStore.recipes.length === 0" class="masonry-grid">
      <div v-for="i in 6" :key="i" class="masonry-item">
        <div class="card">
          <div class="img-placeholder w-full aspect-[4/3]"></div>
          <div class="p-4 space-y-3">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="masonry-grid">
      <RecipeCard
        v-for="recipe in recipeStore.recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>

    <div v-if="recipeStore.error" class="text-center py-12">
      <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">{{ recipeStore.error }}</p>
      <button @click="retryLoad" class="btn-primary">
        重新加载
      </button>
    </div>

    <div v-if="!recipeStore.loading && recipeStore.recipes.length === 0 && !recipeStore.error" class="text-center py-12">
      <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">没有找到匹配的食谱</p>
    </div>

    <div v-if="recipeStore.hasMore && !recipeStore.loading" class="text-center py-8">
      <button @click="loadMore" class="btn-secondary">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search, AlertCircle } from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipe'
import RecipeCard from '@/components/RecipeCard.vue'
import type { RecipeCategory, DifficultyLevel } from '@/types'

const recipeStore = useRecipeStore()
const searchQuery = ref('')
const selectedCategory = ref<RecipeCategory | ''>('')
const selectedDifficulty = ref<DifficultyLevel | ''>('')

let searchTimeout: number | null = null

function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    recipeStore.setSearch(searchQuery.value)
  }, 300)
}

function handleCategoryChange() {
  recipeStore.setCategory(selectedCategory.value || null)
}

function handleDifficultyChange() {
  recipeStore.setDifficulty(selectedDifficulty.value || null)
}

function toggleCategory(catId: RecipeCategory) {
  if (selectedCategory.value === catId) {
    selectedCategory.value = ''
    recipeStore.setCategory(null)
  } else {
    selectedCategory.value = catId
    recipeStore.setCategory(catId)
  }
}

function loadMore() {
  recipeStore.fetchRecipes(recipeStore.currentPage + 1, true)
}

function retryLoad() {
  recipeStore.fetchRecipes(1)
}

onMounted(() => {
  recipeStore.fetchCategories()
  recipeStore.fetchRecipes(1)
})
</script>
