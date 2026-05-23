import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ExercisesView from '@/views/ExercisesView.vue'
import PlansView from '@/views/PlansView.vue'
import WorkoutView from '@/views/WorkoutView.vue'
import StatsView from '@/views/StatsView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/exercises',
    name: 'exercises',
    component: ExercisesView,
  },
  {
    path: '/plans',
    name: 'plans',
    component: PlansView,
  },
  {
    path: '/workout',
    name: 'workout',
    component: WorkoutView,
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
