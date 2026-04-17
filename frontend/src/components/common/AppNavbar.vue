<template>
  <nav style="background:#0C447C;" class="sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14 gap-4">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 flex-shrink-0">
          <div style="background:#185FA5;" class="w-8 h-8 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="#B5D4F4" stroke-width="2" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span class="text-white font-medium text-sm">LibraryApp</span>
        </RouterLink>

        <!-- Center links -->
        <div class="flex items-center gap-1 flex-1 justify-center">
          <RouterLink
            to="/"
            class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
            :class="{ '!text-white bg-white/10': $route.path === '/' }"
          >
            Danh mục sách
          </RouterLink>

          <template v-if="auth.isReader">
            <RouterLink
              to="/history"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path === '/history' }"
            >
              Lịch sử
            </RouterLink>
          </template>

          <template v-if="auth.isAdmin">
            <RouterLink
              to="/admin/dashboard"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path === '/admin/dashboard' }"
            >
              Tổng quan
            </RouterLink>
            <RouterLink
              to="/admin/books"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path.startsWith('/admin/books') }"
            >
              Sách
            </RouterLink>
            <RouterLink
              to="/admin/borrows"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path.startsWith('/admin/borrows') }"
            >
              Quản lý mượn
            </RouterLink>
            <RouterLink
              to="/admin/categories"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path.startsWith('/admin/categories') }"
            >
              Thể loại
            </RouterLink>
            <RouterLink
              to="/admin/users"
              class="text-[#B5D4F4] hover:text-white hover:bg-white/10 text-sm px-3 py-1.5 rounded-md transition-colors"
              :class="{ '!text-white bg-white/10': $route.path.startsWith('/admin/users') }"
            >
              Độc giả
            </RouterLink>
          </template>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Cart button (reader only) -->
          <RouterLink
            v-if="auth.isReader"
            to="/cart"
            class="relative flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Giỏ mượn
            <span
              v-if="cartCount > 0"
              class="bg-red-500 text-white text-[10px] font-medium rounded-full px-1.5 py-px min-w-[18px] text-center leading-none"
            >{{ cartCount }}</span>
          </RouterLink>

          <!-- Notification Bell (only when logged in) -->
          <NotificationBell v-if="auth.isAuthenticated" />

          <!-- User info & logout -->
          <template v-if="auth.isAuthenticated">
            <RouterLink
              to="/profile"
              style="background:#185FA5;"
              class="text-[#B5D4F4] text-xs px-3 py-1.5 rounded-md hidden sm:block hover:text-white hover:bg-[#124d87] transition-colors"
              title="Cập nhật hồ sơ"
            >{{ auth.user.name }}</RouterLink>
            <button
              @click="handleLogout"
              class="text-[#B5D4F4] hover:text-white text-xs px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-primary !py-1.5 !text-xs">
              Đăng nhập
            </RouterLink>
          </template>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth.store'
import { useCart } from '../../composables/useCart'
import { useRouter } from 'vue-router'
import NotificationBell from './NotificationBell.vue'

const auth   = useAuthStore()
const router = useRouter()
const { cartCount } = useCart()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>