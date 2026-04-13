<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Quản lý phiếu mượn</h1>

    <!-- Filter -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button
        v-for="opt in statusOptions" :key="opt.value"
        @click="filterStatus = opt.value; fetchData(1)"
        :class="[
          'text-sm px-3 py-1.5 rounded-full border transition-colors',
          filterStatus === opt.value
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        ]"
      >{{ opt.label }}</button>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-400">Đang tải...</div>

    <div v-else class="space-y-4">
      <div v-for="record in records" :key="record._id" class="card">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-medium text-gray-800">{{ record.user?.name }}</p>
            <p class="text-xs text-gray-400">{{ record.user?.email }} • MSSV: {{ record.user?.studentId || 'N/A' }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              Ngày gửi: {{ new Date(record.createdAt).toLocaleDateString('vi-VN') }}
            </p>
            <p v-if="record.dueDate" class="text-xs text-gray-400">
              Hạn trả: {{ new Date(record.dueDate).toLocaleDateString('vi-VN') }}
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <!-- Sách trong phiếu -->
        <div class="space-y-2 mb-4">
          <div v-for="item in record.items" :key="item.bookId"
            class="flex items-center gap-2 bg-gray-50 rounded p-2 text-sm">
            <img :src="item.coverImage || 'https://placehold.co/32x44?text=?'"
              class="w-7 h-10 object-cover rounded" />
            <div>
              <p class="font-medium text-gray-800">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.author }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            v-if="record.status === 'pending'"
            @click="handleApprove(record._id)"
            class="btn-primary text-sm py-1.5 px-4"
          >Duyệt</button>

          <button
            v-if="['approved', 'overdue'].includes(record.status)"
            @click="handleReturn(record._id)"
            class="btn-secondary text-sm py-1.5 px-4"
          >Xác nhận trả</button>
        </div>
      </div>

      <div v-if="records.length === 0" class="card text-center py-12 text-gray-400">
        Không có phiếu mượn nào
      </div>
    </div>

    <AppPagination
      v-if="pagination.totalPages > 1"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      @change="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { borrowApi } from '../../api/borrowApi'
import { useToast } from 'vue-toastification'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppPagination from '../../components/common/AppPagination.vue'

const toast        = useToast()
const records      = ref([])
const pagination   = ref({ page: 1, totalPages: 1 })
const loading      = ref(false)
const filterStatus = ref('pending')

const statusOptions = [
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đang mượn', value: 'approved' },
  { label: 'Quá hạn',   value: 'overdue' },
  { label: 'Đã trả',    value: 'returned' },
  { label: 'Tất cả',    value: '' },
]

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 10 }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await borrowApi.getAll(params)
    records.value    = res.data.data.records
    pagination.value = res.data.data.pagination
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    await borrowApi.approve(id)
    toast.success('Đã duyệt phiếu mượn!')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể duyệt phiếu')
  }
}

const handleReturn = async (id) => {
  if (!confirm('Xác nhận sinh viên đã trả sách?')) return
  try {
    await borrowApi.return(id)
    toast.success('Xác nhận trả sách thành công!')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xác nhận trả')
  }
}

onMounted(() => fetchData())
</script>