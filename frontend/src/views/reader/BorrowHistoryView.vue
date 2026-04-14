<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-5">Lịch sử mượn sách</h1>

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

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="records.length === 0" class="card text-center py-14">
      <p class="text-gray-400 text-sm">Chưa có phiếu mượn nào</p>
    </div>

    <!-- Records -->
    <div v-else class="space-y-3">
      <div v-for="record in records" :key="record._id" class="card">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs font-medium text-gray-700">
              Mã phiếu: #{{ record._id.slice(-6).toUpperCase() }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              Ngày gửi: {{ formatDate(record.createdAt) }}
            </p>
            <p v-if="record.dueDate" class="text-xs mt-0.5" :class="isOverdue(record.dueDate) && record.status === 'approved' ? 'text-red-500' : 'text-gray-400'">
              Hạn trả: {{ formatDate(record.dueDate) }}
              <span v-if="isOverdue(record.dueDate) && record.status === 'approved'" class="font-medium"> (Quá hạn)</span>
            </p>
            <p v-if="record.returnDate" class="text-xs text-green-600 mt-0.5">
              Đã trả: {{ formatDate(record.returnDate) }}
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <!-- Books -->
        <div class="space-y-2">
          <div
            v-for="item in record.items"
            :key="item.bookId"
            class="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5"
          >
            <img
              :src="item.coverImage || `https://placehold.co/40x55/E6F1FB/378ADD?text=?`"
              class="w-8 h-11 object-cover rounded flex-shrink-0"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.author }}</p>
            </div>
          </div>
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
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppPagination from '../../components/common/AppPagination.vue'

const records      = ref([])
const pagination   = ref({ page: 1, totalPages: 1 })
const loading      = ref(false)
const filterStatus = ref('')

const statusOptions = [
  { label: 'Tất cả',    value: '' },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đang mượn', value: 'approved' },
  { label: 'Đã trả',    value: 'returned' },
  { label: 'Quá hạn',   value: 'overdue' },
]

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')
const isOverdue  = (d) => new Date(d) < new Date()

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 10 }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await borrowApi.getMy(params)
    records.value    = res.data.data.records
    pagination.value = res.data.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>