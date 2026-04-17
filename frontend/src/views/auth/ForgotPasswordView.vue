<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="card w-full max-w-md p-8 shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-[#0C447C] mb-2">Quên Mật Khẩu</h2>
        <p class="text-gray-500 text-sm">Nhập email đã đăng ký tài khoản của bạn để nhận liên kết đặt lại mật khẩu an toàn.</p>
      </div>

      <div v-if="mailSent" class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100 text-sm">
        <div class="font-bold flex items-center gap-2 mb-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Đã gửi Email thành công!
        </div>
        Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác/spam) của bạn để lấy liên kết thay đổi mật khẩu. Trình duyệt này có thể đóng lại.
      </div>

      <form v-else @submit.prevent="handleForgot" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email đăng ký <span class="text-red-500">*</span></label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="input-field"
            placeholder="vd: sinhvien@student.ctu.edu.vn"
            :disabled="loading"
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading || !email"
          class="btn-primary w-full py-2.5 flex justify-center items-center gap-2 mt-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Đang gửi yêu cầu...' : 'Gửi liên kết xác nhận' }}
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-gray-100 text-center text-sm">
        <span class="text-gray-500">Nhớ mật khẩu? </span>
        <RouterLink to="/login" class="text-[#0C447C] font-semibold hover:underline">Quay lại Đăng nhập</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '../../api/authApi'
import { useToast } from 'vue-toastification'

const toast = useToast()
const email = ref('')
const loading = ref(false)
const mailSent = ref(false)

const handleForgot = async () => {
  if (!email.value) return;
  loading.value = true;
  try {
    await authApi.forgotPassword(email.value)
    mailSent.value = true
    toast.success('Hệ thống đã điều phối thư thành công!')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể tạo yêu cầu quên mật khẩu lúc này')
  } finally {
    loading.value = false;
  }
}
</script>
