import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Anmelden' },
    },
    {
      path: '/patterns',
      name: 'patterns',
      component: () => import('@/views/PatternListView.vue'),
    },
    {
      path: '/patterns/:id',
      name: 'pattern-detail',
      component: () => import('@/views/PatternDetailView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
