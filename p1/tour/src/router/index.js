import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('@/views/Routes.vue')
  },
  {
    path: '/routes/:id',
    name: 'RouteDetail',
    component: () => import('@/views/RouteDetail.vue')
  },
  {
    path: '/hotels',
    name: 'Hotels',
    component: () => import('@/views/Hotels.vue')
  },
  {
    path: '/hotels/:id',
    name: 'HotelDetail',
    component: () => import('@/views/HotelDetail.vue')
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: () => import('@/views/Tickets.vue')
  },
  {
    path: '/guides',
    name: 'Guides',
    component: () => import('@/views/Guides.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('user')
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router