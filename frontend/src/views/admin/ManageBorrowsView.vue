<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-5">Quản lý phiếu mượn</h1>

    <!-- Filter -->
    <div class="flex gap-1.5 mb-5 flex-wrap">
      <button
        v-for="opt in statusOptions" :key="opt.value"
        @click="filterStatus = opt.value; fetchData(1)"
        :class="[
          'text-xs px-3 py-1.5 rounded-full border transition-colors',
          filterStatus === opt.value
            ? 'bg-[#0C447C] text-white border-[#0C447C]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        ]"
      >{{ opt.label }}</button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse h-32"></div>
    </div>

    <div v-else-if="records.length === 0" class="card text-center py-14">
      <p class="text-gray-400 text-sm">Không có phiếu mượn nào</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="record in records" :key="record._id" class="card">
        <!-- User info header -->
        <div class="flex items-start justify-between mb-3 pb-3 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ record.user?.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ record.user?.email }}
              <span v-if="record.user?.studentId"> · MSSV: {{ record.user.studentId }}</span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              Ngày gửi: {{ formatDate(record.createdAt) }}
              <span v-if="record.dueDate"> · Hạn trả: {{ formatDate(record.dueDate) }}</span>
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <!-- Books list -->
        <div class="space-y-2 mb-3">
          <div
            v-for="item in record.items"
            :key="item.bookId"
            class="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
          >
            <img
              :src="item.coverImage || `https://placehold.co/36x50/E6F1FB/378ADD?text=?`"
              class="w-8 h-10 object-cover rounded flex-shrink-0"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.author }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-1">
          <button
            v-if="record.status === 'pending'"
            @click="handleApprove(record._id)"
            :disabled="approving === record._id"
            class="btn-primary !py-1.5 !px-4"
          >
            {{ approving === record._id ? 'Đang duyệt...' : 'Duyệt phiếu' }}
          </button>
          <button
            v-if="['approved','overdue'].includes(record.status)"
            @click="handleReturn(record._id)"
            :disabled="returning === record._id"
            class="btn-secondary !py-1.5 !px-4"
          >
            {{ returning === record._id ? 'Đang xử lý...' : 'Xác nhận trả' }}
          </button>
        </div>
      </div>
    </div>

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
import { borrowApi } from '../../api/borrowApi'
import { useToast } from 'vue-toastification'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppPagination from '../../components/common/AppPagination.vue'

const toast        = useToast()
const records      = ref([])
const pagination   = ref({ page: 1, totalPages: 1 })
const loading      = ref(false)
const approving    = ref(null)
const returning    = ref(null)
const filterStatus = ref('pending')

const statusOptions = [
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đang mượn', value: 'approved' },
  { label: 'Quá hạn',   value: 'overdue' },
  { label: 'Đã trả',    value: 'returned' },
  { label: 'Tất cả',    value: '' },
]

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')

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
  approving.value = id
  try {
    await borrowApi.approve(id)
    toast.success('Duyệt phiếu thành công!')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể duyệt phiếu')
  } finally {
    approving.value = null
  }
}

const handleReturn = async (id) => {
  if (!confirm('Xác nhận sinh viên đã mang sách đến trả?')) return
  returning.value = id
  try {
    await borrowApi.return(id)
    toast.success('Xác nhận trả sách thành công!')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xác nhận trả')
  } finally {
    returning.value = null
  }
}

onMounted(() => fetchData())
</script>