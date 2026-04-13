import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  // Public
  { path: '/login',    name: 'Login',    component: () => import('../views/auth/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/auth/RegisterView.vue') },

  // Reader
  {
    path: '/',
    component: () => import('../views/reader/BookListView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: () => import('../views/reader/BookDetailView.vue'),
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/reader/CartView.vue'),
    meta: { requiresAuth: true, role: 'reader' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/reader/BorrowHistoryView.vue'),
    meta: { requiresAuth: true, role: 'reader' },
  },

  // Admin
  {
    path: '/admin/books',
    name: 'AdminBooks',
    component: () => import('../views/admin/ManageBooksView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/borrows',
    name: 'AdminBorrows',
    component: () => import('../views/admin/ManageBorrowsView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }
  if (to.meta.role === 'admin' && !auth.isAdmin) {
    return next('/')
  }
  if (to.meta.role === 'reader' && !auth.isReader) {
    return next('/')
  }
  if ((to.name === 'Login' || to.name === 'Register') && auth.isAuthenticated) {
    return next(auth.isAdmin ? '/admin/books' : '/')
  }

  next()
})

export default router