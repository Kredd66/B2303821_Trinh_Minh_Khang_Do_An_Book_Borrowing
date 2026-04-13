<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Lịch sử mượn sách</h1>

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

    <div v-else-if="records.length === 0" class="card text-center py-12 text-gray-400">
      Chưa có phiếu mượn nào
    </div>

    <div v-else class="space-y-4">
      <div v-for="record in records" :key="record._id" class="card">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs text-gray-400">Mã phiếu: {{ record._id.slice(-8).toUpperCase() }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              Ngày gửi: {{ new Date(record.createdAt).toLocaleDateString('vi-VN') }}
            </p>
            <p v-if="record.dueDate" class="text-xs text-gray-400">
              Hạn trả: {{ new Date(record.dueDate).toLocaleDateString('vi-VN') }}
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <div class="space-y-2">
          <div v-for="item in record.items" :key="item.bookId"
            class="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
            <img :src="item.coverImage || 'https://placehold.co/40x55?text=?'"
              class="w-8 h-11 object-cover rounded" />
            <div>
              <p class="text-sm font-medium text-gray-800">{{ item.title }}</p>
              <p class="text-xs text-gray-500">{{ item.author }}</p>
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