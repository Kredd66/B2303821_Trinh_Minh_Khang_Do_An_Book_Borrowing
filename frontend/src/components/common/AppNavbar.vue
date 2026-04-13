<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 font-bold text-primary-600 text-lg">
          📚 LibraryApp
        </RouterLink>

        <!-- Nav links -->
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
            Danh sách sách
          </RouterLink>

          <!-- Reader links -->
          <template v-if="auth.isReader">
            <RouterLink to="/cart" class="relative text-sm text-gray-600 hover:text-primary-600">
              Giỏ mượn
              <span
                v-if="cartCount > 0"
                class="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >{{ cartCount }}</span>
            </RouterLink>
            <RouterLink to="/history" class="text-sm text-gray-600 hover:text-primary-600">
              Lịch sử
            </RouterLink>
          </template>

          <!-- Admin links -->
          <template v-if="auth.isAdmin">
            <RouterLink to="/admin/books" class="text-sm text-gray-600 hover:text-primary-600">
              Quản lý sách
            </RouterLink>
            <RouterLink to="/admin/borrows" class="text-sm text-gray-600 hover:text-primary-600">
              Quản lý mượn
            </RouterLink>
          </template>

          <!-- Auth -->
          <template v-if="auth.isAuthenticated">
            <span class="text-sm text-gray-500">{{ auth.user.name }}</span>
            <button @click="handleLogout" class="btn-secondary text-sm py-1.5 px-3">
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-primary text-sm py-1.5 px-3">
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

const auth   = useAuthStore()
const router = useRouter()
const { cartCount } = useCart()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>