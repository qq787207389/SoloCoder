import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/views/ExploreView.vue')
  },
  {
    path: '/board/:id',
    name: 'Board',
    component: () => import('@/views/BoardView.vue')
  },
  {
    path: '/card/:id',
    name: 'Card',
    component: () => import('@/views/CardView.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue')
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue')
  },
  {
    path: '/create-board',
    name: 'CreateBoard',
    component: () => import('@/views/CreateBoardView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
