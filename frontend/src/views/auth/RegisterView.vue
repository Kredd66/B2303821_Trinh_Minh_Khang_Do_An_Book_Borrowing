<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-sm">

      <div class="flex flex-col items-center mb-8">
        <div style="background:#0C447C;" class="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="#B5D4F4" stroke-width="2" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <h1 class="text-xl font-medium text-gray-900">LibraryApp</h1>
        <p class="text-sm text-gray-500 mt-1">Tạo tài khoản để bắt đầu mượn sách</p>
      </div>

      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-5">Đăng ký tài khoản</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Họ và tên *</label>
            <input v-model="form.name" type="text" class="input-field" placeholder="Nguyễn Văn A" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Mã số sinh viên</label>
            <input v-model="form.studentId" type="text" class="input-field" placeholder="2151012345" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="example@student.edu.vn" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu *</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="Tối thiểu 6 ký tự" />
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full !py-2.5 mt-1">
            {{ loading ? 'Đang đăng ký...' : 'Tạo tài khoản' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-500 mt-4">
          Đã có tài khoản?
          <RouterLink to="/login" style="color:#185FA5;" class="font-medium hover:underline">Đăng nhập</RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import { useToast } from 'vue-toastification'

const auth    = useAuthStore()
const router  = useRouter()
const toast   = useToast()
const loading = ref(false)
const form    = reactive({ name: '', email: '', password: '', studentId: '' })
const errors  = reactive({ name: '', email: '', password: '' })

const validate = () => {
  errors.name     = !form.name              ? 'Vui lòng nhập họ tên' : ''
  errors.email    = !form.email             ? 'Vui lòng nhập email' : ''
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