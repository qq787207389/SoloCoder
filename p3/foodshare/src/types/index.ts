export type RecipeCategory = 
  | 'home-cooking' 
  | 'baking' 
  | 'vegetarian' 
  | 'soup' 
  | 'dessert' 
  | 'seafood' 
  | 'staple-food';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface CategoryInfo {
  id: RecipeCategory;
  name: string;
  icon: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
}

export interface CookingStep {
  id: string;
  order: number;
  description: string;
  image?: string;
  duration?: number;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: Author;
  category: RecipeCategory;
  difficulty: DifficultyLevel;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
  likes: number;
  isLiked?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  isUserCreated?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  addedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  favorites: string[];
}

export interface CreateRecipeForm {
  title: string;
  description: string;
  coverImage: string;
  category: RecipeCategory;
  difficulty: DifficultyLevel;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RecipeListParams {
  category?: RecipeCategory;
  difficulty?: DifficultyLevel;
  search?: string;
  page?: number;
  limit?: number;
}
