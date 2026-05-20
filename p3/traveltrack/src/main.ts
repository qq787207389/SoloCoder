import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import App from './App.vue'

const pinia = createPinia()

const routes = [
  { path: '/', component: () => import('./views/HomeView.vue') },
  { path: '/timeline', component: () => import('./views/TimelineView.vue') },
  { path: '/wishlist', component: () => import('./views/WishlistView.vue') },
  { path: '/stats', component: () => import('./views/StatsView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

