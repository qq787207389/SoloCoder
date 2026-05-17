import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BooksView from '@/views/BooksView.vue'
import NotesView from '@/views/NotesView.vue'
import GraphView from '@/views/GraphView.vue'
import CalendarView from '@/views/CalendarView.vue'
import BookDetailView from '@/views/BookDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/books', name: 'books', component: BooksView },
    { path: '/books/:id', name: 'book-detail', component: BookDetailView },
    { path: '/notes', name: 'notes', component: NotesView },
    { path: '/graph', name: 'graph', component: GraphView },
    { path: '/calendar', name: 'calendar', component: CalendarView }
  ]
})

export default router
