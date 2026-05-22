import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Recipe } from '../types';
import { getFromStorage, setToStorage } from '../utils/storage';

const STORAGE_KEY = 'foodshare_user';
const CREATED_RECIPES_KEY = 'foodshare_created_recipes';
const FAVORITES_KEY = 'foodshare_favorites';

export const useUserStore = defineStore('user', () => {
  const user = ref<User>(getFromStorage<User>(STORAGE_KEY, {
    id: 'current-user',
    name: '美食爱好者',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    favorites: getFromStorage<string[]>(FAVORITES_KEY, []),
  }));

  const createdRecipes = ref<Recipe[]>(getFromStorage<Recipe[]>(CREATED_RECIPES_KEY, []));
  const loading = ref(false);

  function saveUser() {
    setToStorage(STORAGE_KEY, user.value);
  }

  function saveCreatedRecipes() {
    setToStorage(CREATED_RECIPES_KEY, createdRecipes.value);
  }

  function saveFavorites() {
    setToStorage(FAVORITES_KEY, user.value.favorites);
  }

  function updateName(name: string) {
    user.value.name = name;
    saveUser();
  }

  function updateAvatar(avatar: string) {
    user.value.avatar = avatar;
    saveUser();
  }

  function addCreatedRecipe(recipe: Recipe) {
    createdRecipes.value.unshift(recipe);
    saveCreatedRecipes();
  }

  function removeCreatedRecipe(recipeId: string) {
    createdRecipes.value = createdRecipes.value.filter(r => r.id !== recipeId);
    saveCreatedRecipes();
  }

  function addFavorite(recipeId: string) {
    if (!user.value.favorites.includes(recipeId)) {
      user.value.favorites.push(recipeId);
      saveFavorites();
    }
  }

  function removeFavorite(recipeId: string) {
    user.value.favorites = user.value.favorites.filter(id => id !== recipeId);
    saveFavorites();
  }

  function isFavorite(recipeId: string): boolean {
    return user.value.favorites.includes(recipeId);
  }

  function toggleFavorite(recipeId: string) {
    if (isFavorite(recipeId)) {
      removeFavorite(recipeId);
    } else {
      addFavorite(recipeId);
    }
  }

  return {
    user,
    createdRecipes,
    loading,
    updateName,
    updateAvatar,
    addCreatedRecipe,
    removeCreatedRecipe,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
});
