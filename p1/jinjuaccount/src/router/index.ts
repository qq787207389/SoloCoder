import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Settings from '@/views/Settings.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/components/TransactionList.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
