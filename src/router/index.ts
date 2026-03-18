import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/authStore'

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
      path: '/patterns/create',
      name: 'pattern-create',
      component: () => import('@/views/PatternCreateView.vue'),
      meta: { requiresAuth: true, requiresRole: ['admin'] },
    },
    {
      path: '/patterns/:id',
      name: 'pattern-detail',
      component: () => import('@/views/PatternDetailView.vue'),
    },
    {
      path: '/patterns/:id/edit',
      name: 'pattern-edit',
      component: () => import('@/views/PatternEditView.vue'),
      meta: { requiresAuth: true, requiresRole: ['editor', 'admin'] },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard: Zugriffsschutz für geschützte Routen
router.beforeEach(async (to, from) => {
  // Keine Authentifizierung erforderlich
  if (!to.meta.requiresAuth) {
    return true
  }

  const auth = useAuthStore()

  // Warten bis Auth initialisiert ist (Session aus Supabase geladen)
  if (!auth.initialized) {
    await auth.init()
  }

  // Nicht eingeloggt → zur Login-Seite
  if (!auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Rolle prüfen
  const allowedRoles = to.meta.requiresRole as string[] | undefined
  if (allowedRoles && !allowedRoles.includes(auth.profile?.role ?? '')) {
    return { name: 'home' }
  }

  return true
})

export default router
