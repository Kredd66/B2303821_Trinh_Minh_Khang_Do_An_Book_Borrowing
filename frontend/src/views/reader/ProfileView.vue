<template>
  <div class="max-w-2xl mx-auto py-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 class="text-base font-medium text-gray-900">Thông tin chung</h2>
        <p class="text-sm text-gray-500 mt-1">Cập nhật thông tin liên hệ của bạn</p>
      </div>

      <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email (không thể thay đổi)</label>
          <input type="text" :value="auth.user?.email" class="input-field bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên *</label>
          <input v-model="profileForm.name" type="text" class="input-field" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Mã số sinh viên</label>
            <input v-model="profileForm.studentId" type="text" class="input-field" placeholder="Ví dụ: B2303821" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
            <input v-model="profileForm.phone" type="text" class="input-field" placeholder="Ví dụ: 0912345678" />
          </div>
        </div>

        <div class="pt-4">
          <button type="submit" :disabled="savingProfile" class="btn-primary px-6">
            {{ savingProfile ? 'Đang lưu...' : 'Lưu thông tin' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Đổi mật khẩu -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 class="text-base font-medium text-gray-900">Đổi mật khẩu</h2>
        <p class="text-sm text-gray-500 mt-1">Đảm bảo tài khoản của bạn được an toàn với mật khẩu dài tối thiểu 6 ký tự</p>
      </div>

      <form @submit.prevent="handleChangePassword" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu hiện tại *</label>
          <input v-model="passwordForm.oldPassword" type="password" class="input-field" required minlength="6" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới *</label>
          <input v-model="passwordForm.newPassword" type="password" class="input-field" required minlength="6" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nhập lại mật khẩu mới *</label>
          <input v-model="passwordForm.confirmPassword" type="password" class="input-field" required minlength="6" />
        </div>

        <div class="pt-4">
          <button type="submit" :disabled="savingPassword" class="btn-primary bg-amber-600 hover:bg-amber-700 ring-amber-500 px-6">
            {{ savingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import { authApi } from '../../api/authApi'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const toast = useToast()

const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({
  name: '',
  studentId: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const res = await authApi.getMe()
    const userData = res.data.data
    profileForm.name = userData.name || ''
    profileForm.studentId = userData.studentId || ''
    profileForm.phone = userData.phone || ''
  } catch (err) {
    toast.error('Không thể lấy thông tin người dùng')
  }
})

const handleUpdateProfile = async () => {
  savingProfile.value = true
  try {
    const res = await authApi.updateProfile(profileForm)
    auth.user.name = res.data.data.name // Cập nhật nhẹ store để navbar thay đổi
    toast.success('Cập nhật thông tin thành công')
  } catch (err) {
    let msg = err.response?.data?.message || 'Lỗi cập nhật'
    if (err.response?.data?.errors) {
      msg = err.response.data.errors[0].message
    }
    toast.error(msg)
  } finally {
    savingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    return toast.error('Mật khẩu mới không khớp')
  }

  savingPassword.value = true
  try {
    await authApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    toast.success('Đổi mật khẩu thành công')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi khi đổi mật khẩu')
  } finally {
    savingPassword.value = false
  }
}
</script>
