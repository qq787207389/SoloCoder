import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { recipeApi } from '../api/recipes';
import type { Recipe, CategoryInfo, RecipeCategory, DifficultyLevel } from '../types';

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([]);
  const currentRecipe = ref<Recipe | null>(null);
  const categories = ref<CategoryInfo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const hasMore = ref(true);

  const selectedCategory = ref<RecipeCategory | null>(null);
  const selectedDifficulty = ref<DifficultyLevel | null>(null);
  const searchQuery = ref('');
  const currentPage = ref(1);

  const filteredRecipes = computed(() => recipes.value);

  async function fetchCategories() {
    try {
      const response = await recipeApi.getCategories();
      if (response.success) {
        categories.value = response.data;
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  async function fetchRecipes(page: number = 1, append: boolean = false) {
    loading.value = true;
    error.value = null;
    
    try {
      const params: any = { page, limit: 20 };
      if (selectedCategory.value) params.category = selectedCategory.value;
      if (selectedDifficulty.value) params.difficulty = selectedDifficulty.value;
      if (searchQuery.value) params.search = searchQuery.value;

      const response = await recipeApi.getRecipes(params);
      
      if (response.success) {
        if (append) {
          recipes.value = [...recipes.value, ...response.data.recipes];
        } else {
          recipes.value = response.data.recipes;
        }
        total.value = response.data.total;
        hasMore.value = response.data.hasMore;
        currentPage.value = page;
      }
    } catch (err) {
      error.value = '加载食谱失败，请稍后重试';
      console.error('Failed to fetch recipes:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchRecipeById(id: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await recipeApi.getRecipeById(id);
      if (response.success) {
        currentRecipe.value = response.data;
        return response.data;
      }
    } catch (err) {
      error.value = '加载食谱详情失败，请稍后重试';
      console.error('Failed to fetch recipe:', err);
    } finally {
      loading.value = false;
    }
    return null;
  }

  async function createRecipe(data: any) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await recipeApi.createRecipe(data);
      if (response.success) {
        recipes.value.unshift(response.data);
        return response.data;
      }
    } catch (err) {
      error.value = '创建食谱失败，请稍后重试';
      console.error('Failed to create recipe:', err);
    } finally {
      loading.value = false;
    }
    return null;
  }

  async function likeRecipe(id: string) {
    try {
      const response = await recipeApi.likeRecipe(id);
      if (response.success) {
        const recipe = recipes.value.find(r => r.id === id);
        if (recipe) {
          recipe.likes = response.data.likes;
          recipe.isLiked = response.data.isLiked;
        }
        if (currentRecipe.value?.id === id) {
          currentRecipe.value.likes = response.data.likes;
          currentRecipe.value.isLiked = response.data.isLiked;
        }
        return response.data;
      }
    } catch (err) {
      console.error('Failed to like recipe:', err);
    }
    return null;
  }

  async function toggleFavorite(id: string) {
    try {
      const response = await recipeApi.toggleFavorite(id);
      if (response.success) {
        const recipe = recipes.value.find(r => r.id === id);
        if (recipe) {
          recipe.isFavorite = response.data.isFavorite;
        }
        if (currentRecipe.value?.id === id) {
          currentRecipe.value.isFavorite = response.data.isFavorite;
        }
        return response.data;
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
    return null;
  }

  function setCategory(category: RecipeCategory | null) {
    selectedCategory.value = category;
    fetchRecipes(1);
  }

  function setDifficulty(difficulty: DifficultyLevel | null) {
    selectedDifficulty.value = difficulty;
    fetchRecipes(1);
  }

  function setSearch(query: string) {
    searchQuery.value = query;
    fetchRecipes(1);
  }

  function resetFilters() {
    selectedCategory.value = null;
    selectedDifficulty.value = null;
    searchQuery.value = '';
    fetchRecipes(1);
  }

  return {
    recipes,
    currentRecipe,
    categories,
    loading,
    error,
    total,
    hasMore,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    currentPage,
    filteredRecipes,
    fetchCategories,
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    likeRecipe,
    toggleFavorite,
    setCategory,
    setDifficulty,
    setSearch,
    resetFilters,
  };
});
