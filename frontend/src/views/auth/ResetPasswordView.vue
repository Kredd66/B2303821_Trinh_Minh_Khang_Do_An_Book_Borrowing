<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="card w-full max-w-md p-8 shadow-lg border border-gray-100">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-[#0C447C] mb-2">Đặt Lại Mật Khẩu</h2>
        <p class="text-gray-500 text-sm">Vui lòng nhập mật khẩu mới của bạn và ghi nhớ thật kĩ nhé.</p>
      </div>

      <div v-if="success" class="text-center">
         <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <p class="text-green-700 font-bold mb-4">Mật khẩu đã được khôi phục định dạng!</p>
        <RouterLink to="/login" class="btn-primary inline-block">Đăng nhập ngay</RouterLink>
      </div>

      <form v-else @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới <span class="text-red-500">*</span></label>
          <input 
            v-model="password" 
            type="password" 
            required minlength="6"
            class="input-field"
            placeholder="Tối thiểu 6 ký tự"
            :disabled="loading"
          >
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span class="text-red-500">*</span></label>
          <input 
            v-model="passwordConfirm" 
            type="password" 
            required minlength="6"
            class="input-field"
            placeholder="Gõ lại mật khẩu phía trên"
            :disabled="loading"
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading || password.length < 6"
          class="btn-primary w-full py-2.5 flex justify-center items-center gap-2 mt-4"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Đang xác thực...' : 'Cập nhật mật khẩu mới' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '../../api/authApi'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const route = useRoute()
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const success = ref(false)

const handleReset = async () => {
  if (password.value !== passwordConfirm.value) {
    toast.error('Nhập lại mật khẩu không khớp!');
    return;
  }

  loading.value = true;
  try {
    const token = route.params.token; // Bốc tắt token từ URL /reset-password/:token
    if(!token) throw new Error("Liên kết không hợp lệ");

    const res = await authApi.resetPassword(token, password.value)
    success.value = true
    toast.success(res.data.message)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Token hết hạn hoặc không khớp. Xin hãy yêu cầu lại link mới.')
  } finally {
    loading.value = false;
  }
}
</script>
