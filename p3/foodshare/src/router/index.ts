import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import RecipeDetail from '@/views/RecipeDetail.vue'
import CreateRecipe from '@/views/CreateRecipe.vue'
import ShoppingList from '@/views/ShoppingList.vue'
import Profile from '@/views/Profile.vue'
import CookingMode from '@/views/CookingMode.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '食记 - 发现美味食谱' }
  },
  {
    path: '/recipe/:id',
    name: 'recipe-detail',
    component: RecipeDetail,
    meta: { title: '食谱详情' }
  },
  {
    path: '/create',
    name: 'create-recipe',
    component: CreateRecipe,
    meta: { title: '创建食谱' }
  },
  {
    path: '/shopping',
    name: 'shopping-list',
    component: ShoppingList,
    meta: { title: '购物清单' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: '个人中心' }
  },
  {
    path: '/cooking/:id',
    name: 'cooking-mode',
    component: CookingMode,
    meta: { title: '烹饪模式' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string || '食记'
  next()
})

export default router
