<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="card w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng ký tài khoản</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input v-model="form.name" type="text" class="input-field" placeholder="Nguyễn Văn A" />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mã số sinh viên</label>
          <input v-model="form.studentId" type="text" class="input-field" placeholder="2151012345" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="input-field" placeholder="example@email.com" />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input v-model="form.password" type="password" class="input-field" placeholder="Tối thiểu 6 ký tự" />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Đã có tài khoản?
        <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Đăng nhập</RouterLink>
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
const form    = reactive({ name: '', email: '', password: '', studentId: '' })
const errors  = reactive({ name: '', email: '', password: '' })

const validate = () => {
  errors.name     = !form.name     ? 'Vui lòng nhập họ tên' : ''
  errors.email    = !form.email    ? 'Vui lòng nhập email' : ''
  errors.password = form.password.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự' : ''
  return !errors.name && !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    await auth.register(form)
    toast.success('Đăng ký thành công!')
    router.push('/')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Đăng ký thất bại')
  } finally {
    loading.value = false
  }
}
</script>