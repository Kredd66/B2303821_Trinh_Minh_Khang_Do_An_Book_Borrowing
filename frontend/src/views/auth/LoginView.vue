<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="card w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng nhập</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="input-field" placeholder="example@email.com" />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Chưa có tài khoản?
        <RouterLink to="/register" class="text-primary-600 font-medium hover:underline">Đăng ký</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import { useToast } from 'vue-toastification'

const auth   = useAuthStore()
const router = useRouter()
const toast  = useToast()

const loading = ref(false)
const form    = reactive({ email: '', password: '' })
const errors  = reactive({ email: '', password: '' })

const validate = () => {
  errors.email    = !form.email    ? 'Vui lòng nhập email' : ''
  errors.password = !form.password ? 'Vui lòng nhập mật khẩu' : ''
  return !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    await auth.login(form)
    toast.success('Đăng nhập thành công!')
    router.push(auth.isAdmin ? '/admin/books' : '/')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
  } finally {
    loading.value = false
  }
}
</script>