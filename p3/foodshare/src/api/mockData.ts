import { mockRecipes, categories, ingredientSuggestions } from '../mocks/data';
import type { Recipe, CategoryInfo, RecipeListParams, CreateRecipeForm } from '../types';

interface RecipeListResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

let recipes = [...mockRecipes];
let userCreatedRecipes: Recipe[] = [];

export const mockApi = {
  getRecipes: (params?: RecipeListParams): Promise<ApiResponse<RecipeListResponse>> => {
    const category = params?.category;
    const difficulty = params?.difficulty;
    const search = params?.search;
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    let filteredRecipes = [...recipes, ...userCreatedRecipes];

    if (category) {
      filteredRecipes = filteredRecipes.filter(r => r.category === category);
    }

    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(r => r.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(r =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(searchLower))
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecipes = filteredRecipes.slice(start, end);

    return Promise.resolve({
      success: true,
      data: {
        recipes: paginatedRecipes,
        total: filteredRecipes.length,
        page,
        limit,
        hasMore: end < filteredRecipes.length
      }
    });
  },

  getRecipeById: (id: string): Promise<ApiResponse<Recipe>> => {
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return Promise.resolve({ success: false, message: '食谱不存在' } as ApiResponse<Recipe>);
    }

    return Promise.resolve({
      success: true,
      data: recipe
    });
  },

  getCategories: (): Promise<ApiResponse<CategoryInfo[]>> => {
    return Promise.resolve({
      success: true,
      data: categories
    });
  },

  createRecipe: (formData: CreateRecipeForm): Promise<ApiResponse<Recipe>> => {
    const newRecipe: Recipe = {
      id: `user-${Date.now()}`,
      ...formData,
      author: {
        id: 'current-user',
        name: '我',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      likes: 0,
      isLiked: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      isUserCreated: true
    };

    userCreatedRecipes.unshift(newRecipe);

    return Promise.resolve({
      success: true,
      data: newRecipe,
      message: '食谱创建成功'
    });
  },

  likeRecipe: (id: string): Promise<ApiResponse<{ likes: number; isLiked: boolean }>> => {
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return Promise.resolve({ success: false, message: '食谱不存在' } as ApiResponse<{ likes: number; isLiked: boolean }>);
    }

    recipe.isLiked = !recipe.isLiked;
    recipe.likes += recipe.isLiked ? 1 : -1;

    return Promise.resolve({
      success: true,
      data: {
        likes: recipe.likes,
        isLiked: recipe.isLiked
      }
    });
  },

  toggleFavorite: (id: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return Promise.resolve({ success: false, message: '食谱不存在' } as ApiResponse<{ isFavorite: boolean }>);
    }

    recipe.isFavorite = !recipe.isFavorite;

    return Promise.resolve({
      success: true,
      data: {
        isFavorite: recipe.isFavorite
      }
    });
  },

  getIngredientSuggestions: (): Promise<ApiResponse<string[]>> => {
    return Promise.resolve({
      success: true,
      data: ingredientSuggestions
    });
  },

  getUserRecipes: (): Promise<ApiResponse<Recipe[]>> => {
    return Promise.resolve({
      success: true,
      data: userCreatedRecipes
    });
  },

  getUserFavorites: (): Promise<ApiResponse<Recipe[]>> => {
    const favoriteRecipes = [...recipes, ...userCreatedRecipes].filter(r => r.isFavorite);
    return Promise.resolve({
      success: true,
      data: favoriteRecipes
    });
  }
};
