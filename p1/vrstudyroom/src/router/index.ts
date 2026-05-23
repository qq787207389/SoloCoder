import { createRouter, createWebHistory } from 'vue-router'
import StudyRoom from '@/pages/StudyRoom.vue'
import FocusMode from '@/pages/FocusMode.vue'
import StudyReport from '@/pages/StudyReport.vue'

const routes = [
  {
    path: '/',
    name: 'study-room',
    component: StudyRoom,
  },
  {
    path: '/focus',
    name: 'focus-mode',
    component: FocusMode,
  },
  {
    path: '/report',
    name: 'study-report',
    component: StudyReport,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
