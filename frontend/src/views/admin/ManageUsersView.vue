<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-xl font-medium text-gray-900">Quản lý độc giả</h1>
        <p class="text-sm text-gray-500 mt-1">Quản lý danh sách sinh viên mượn sách trên hệ thống</p>
      </div>

      <!-- Search Input -->
      <div class="relative w-full sm:w-72 flex-shrink-0">
        <input 
          v-model="searchKeyword" 
          @keyup.enter="fetchData(1)"
          type="text" 
          placeholder="Tìm tên, email, MSSV..." 
          class="input-field !py-2 !pl-10 !text-sm"
        />
        <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-gray-500">Độc giả</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Thông tin liên hệ</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Ngày tham gia</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-gray-500">Trạng thái</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading">
              <td colspan="5" class="px-5 py-12 text-center text-gray-500">
                <div class="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                Đang tải dữ liệu...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-gray-500">Không tìm thấy độc giả nào.</td>
            </tr>
            <tr v-else v-for="user in users" :key="user._id" class="hover:bg-gray-50/50 transition-colors" :class="!user.isActive ? 'bg-red-50/30' : ''">
              <td class="px-5 py-3">
                <p class="font-medium text-gray-900">{{ user.name }}</p>
                <div v-if="user.studentId" class="inline-flex items-center gap-1 mt-0.5 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                  {{ user.studentId }}
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="text-gray-600">{{ user.email }}</p>
                <p v-if="user.phone" class="text-xs text-gray-400 mt-0.5">{{ user.phone }}</p>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                {{ new Date(user.createdAt).toLocaleDateString('vi-VN') }}
              </td>
              <td class="px-4 py-3 text-center">
                <span v-if="user.isActive" class="inline-flex items-center gap-1 text-[10px] uppercase font-medium tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Hoạt động
                </span>
                <span v-else class="inline-flex items-center gap-1 text-[10px] uppercase font-medium tracking-wider bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Bị khóa
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2 justify-center">
                  <button 
                    @click="handleToggleStatus(user)" 
                    class="p-1.5 rounded-lg transition-colors border"
                    :class="user.isActive ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'"
                    :title="user.isActive ? 'Khóa tài khoản' : 'Mở khóa'"
                  >
                    <svg v-if="user.isActive" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <AppPagination
      v-if="pagination.totalPages > 1"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      @change="fetchData"
      class="mt-6"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '../../api/authApi'
import { useToast } from 'vue-toastification'
import AppPagination from '../../components/common/AppPagination.vue'

const toast = useToast()
const users = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const searchKeyword = ref('')
const loading = ref(false)

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 15 }
    if (searchKeyword.value) params.search = searchKeyword.value.trim()
    
    const res = await authApi.getAllUsers(params)
    users.value = res.data.data.users
    pagination.value = res.data.data.pagination
  } catch (err) {
    toast.error('Không thể lấy danh sách người dùng')
  } finally {
    loading.value = false
  }
}

const handleToggleStatus = async (user) => {
  const actionText = user.isActive ? 'KHÓA' : 'MỞ KHÓA'
  if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của ${user.name}?`)) return
  
  try {
    const res = await authApi.toggleUserStatus(user._id)
    toast.success(res.data.message)
    await fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || `Không thể ${actionText} tài khoản`)
  }
}

onMounted(() => {
  fetchData()
})
</script>
