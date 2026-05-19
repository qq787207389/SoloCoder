import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MovieDetailView from '@/views/MovieDetailView.vue'
import SearchView from '@/views/SearchView.vue'
import PlaylistView from '@/views/PlaylistView.vue'
import SharePlaylistView from '@/views/SharePlaylistView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { keepAlive: true }
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetailView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: PlaylistView
  },
  {
    path: '/share/:id',
    name: 'SharePlaylist',
    component: SharePlaylistView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
