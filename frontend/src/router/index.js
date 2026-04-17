import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  // Public
  { path: '/login',    name: 'Login',    component: () => import('../views/auth/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/auth/RegisterView.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/auth/ForgotPasswordView.vue') },
  { path: '/reset-password/:token', name: 'ResetPassword', component: () => import('../views/auth/ResetPasswordView.vue') },

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
  {
    path: '/reservations',
    name: 'Reservations',
    component: () => import('../views/reader/ReservationListView.vue'),
    meta: { requiresAuth: true, role: 'reader' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/reader/ProfileView.vue'),
    meta: { requiresAuth: true }, // Both admin and reader can use profile
  },

  // Admin
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
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
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('../views/admin/ManageCategoriesView.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/ManageUsersView.vue'),
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
    return next(auth.isAdmin ? '/admin/dashboard' : '/')
  }

  next()
})

export default router