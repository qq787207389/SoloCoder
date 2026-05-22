import { http, HttpResponse } from 'msw';
import { mockRecipes, categories, ingredientSuggestions } from './data';
import type { Recipe, RecipeListParams, CreateRecipeForm } from '../types';

let recipes = [...mockRecipes];
let userCreatedRecipes: Recipe[] = [];

export const handlers = [
  http.get('/api/recipes', ({ request }) => {
    console.log('MSW: Handling /api/recipes request', request.url);
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as RecipeListParams['category'];
    const difficulty = url.searchParams.get('difficulty') as RecipeListParams['difficulty'];
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    console.log('MSW: Params -', { category, difficulty, search, page, limit });

    let filteredRecipes = [...recipes, ...userCreatedRecipes];
    console.log('MSW: Total recipes before filter:', filteredRecipes.length);

    if (category) {
      filteredRecipes = filteredRecipes.filter(r => r.category === category);
      console.log('MSW: After category filter:', filteredRecipes.length);
    }

    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(r => r.difficulty === difficulty);
      console.log('MSW: After difficulty filter:', filteredRecipes.length);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(r =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.ingredients.some(ing => ing.name.toLowerCase().includes(searchLower))
      );
      console.log('MSW: After search filter:', filteredRecipes.length);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecipes = filteredRecipes.slice(start, end);

    console.log('MSW: Returning', paginatedRecipes.length, 'recipes');

    return HttpResponse.json({
      success: true,
      data: {
        recipes: paginatedRecipes,
        total: filteredRecipes.length,
        page,
        limit,
        hasMore: end < filteredRecipes.length
      }
    });
  }),

  http.get('/api/recipes/:id', ({ params }) => {
    const { id } = params;
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return HttpResponse.json(
        { success: false, message: '食谱不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: recipe
    });
  }),

  http.get('/api/recipes/categories', () => {
    return HttpResponse.json({
      success: true,
      data: categories
    });
  }),

  http.post('/api/recipes', async ({ request }) => {
    const formData = await request.json() as CreateRecipeForm;
    
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

    return HttpResponse.json({
      success: true,
      data: newRecipe,
      message: '食谱创建成功'
    });
  }),

  http.post('/api/recipes/:id/like', ({ params }) => {
    const { id } = params;
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return HttpResponse.json(
        { success: false, message: '食谱不存在' },
        { status: 404 }
      );
    }

    recipe.isLiked = !recipe.isLiked;
    recipe.likes += recipe.isLiked ? 1 : -1;

    return HttpResponse.json({
      success: true,
      data: {
        likes: recipe.likes,
        isLiked: recipe.isLiked
      }
    });
  }),

  http.post('/api/recipes/:id/favorite', ({ params }) => {
    const { id } = params;
    const recipe = [...recipes, ...userCreatedRecipes].find(r => r.id === id);

    if (!recipe) {
      return HttpResponse.json(
        { success: false, message: '食谱不存在' },
        { status: 404 }
      );
    }

    recipe.isFavorite = !recipe.isFavorite;

    return HttpResponse.json({
      success: true,
      data: {
        isFavorite: recipe.isFavorite
      }
    });
  }),

  http.get('/api/ingredients/suggestions', () => {
    return HttpResponse.json({
      success: true,
      data: ingredientSuggestions
    });
  }),

  http.get('/api/user/recipes', () => {
    return HttpResponse.json({
      success: true,
      data: userCreatedRecipes
    });
  }),

  http.get('/api/user/favorites', () => {
    const favoriteRecipes = [...recipes, ...userCreatedRecipes].filter(r => r.isFavorite);
    return HttpResponse.json({
      success: true,
      data: favoriteRecipes
    });
  })
];
