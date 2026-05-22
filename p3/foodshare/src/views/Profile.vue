<template>
  <div class="animate-fade-in max-w-4xl mx-auto">
    <div class="bg-white rounded-3xl p-8 shadow-md mb-8 text-center">
      <img 
        :src="userStore.user.avatar" 
        :alt="userStore.user.name"
        class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100"
      />
      <h1 class="font-serif text-2xl font-bold text-gray-800 mb-2">{{ userStore.user.name }}</h1>
      <p class="text-gray-500">美食爱好者</p>
      
      <div class="flex justify-center gap-8 mt-6 pt-6 border-t border-gray-100">
        <div class="text-center">
          <p class="text-3xl font-bold text-primary-500">{{ favoriteRecipes.length }}</p>
          <p class="text-sm text-gray-500">收藏</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-primary-500">{{ userStore.createdRecipes.length }}</p>
          <p class="text-sm text-gray-500">自创</p>
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'favorites'"
        class="px-6 py-3 rounded-full font-medium transition-all"
        :class="activeTab === 'favorites' 
          ? 'bg-primary-500 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        <Bookmark class="w-5 h-5 inline mr-2" />
        我的收藏
      </button>
      <button
        @click="activeTab = 'created'"
        class="px-6 py-3 rounded-full font-medium transition-all"
        :class="activeTab === 'created' 
          ? 'bg-primary-500 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        <FileText class="w-5 h-5 inline mr-2" />
        自创食谱
      </button>
    </div>

    <div v-if="activeTab === 'favorites'">
      <div v-if="favoriteRecipes.length > 0" class="masonry-grid">
        <RecipeCard
          v-for="recipe in favoriteRecipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>
      <div v-else class="text-center py-20">
        <Bookmark class="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-600 mb-2">还没有收藏</h3>
        <p class="text-gray-400 mb-6">浏览食谱，收藏你喜欢的</p>
        <router-link to="/" class="btn-primary">
          浏览食谱
        </router-link>
      </div>
    </div>

    <div v-if="activeTab === 'created'">
      <div v-if="userStore.createdRecipes.length > 0" class="masonry-grid">
        <RecipeCard
          v-for="recipe in userStore.createdRecipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>
      <div v-else class="text-center py-20">
        <FileText class="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-600 mb-2">还没有自创食谱</h3>
        <p class="text-gray-400 mb-6">分享你的美食秘方</p>
        <router-link to="/create" class="btn-primary">
          创建食谱
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bookmark, FileText } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useRecipeStore } from '@/stores/recipe'
import RecipeCard from '@/components/RecipeCard.vue'
import type { Recipe } from '@/types'

const userStore = useUserStore()
const recipeStore = useRecipeStore()

const activeTab = ref<'favorites' | 'created'>('favorites')

const favoriteRecipes = computed(() => {
  return recipeStore.recipes.filter(r => userStore.isFavorite(r.id))
})

onMounted(() => {
  if (recipeStore.recipes.length === 0) {
    recipeStore.fetchRecipes(1)
  }
})
</script>
