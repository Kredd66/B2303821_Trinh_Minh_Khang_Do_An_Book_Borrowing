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
            <div class="relative">
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                class="input-field pr-10" 
                placeholder="Tối thiểu 6 ký tự" 
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
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
const showPassword = ref(false)
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