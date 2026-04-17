<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-5">Lịch sử mượn sách</h1>

    <!-- Filter -->
    <div class="flex gap-1.5 mb-5 flex-wrap">
      <button v-for="opt in statusOptions" :key="opt.value"
        @click="filterStatus = opt.value; fetchData(1)"
        :class="[
          'text-xs px-3 py-1.5 rounded-full border transition-colors',
          filterStatus === opt.value
            ? 'bg-[#0C447C] text-white border-[#0C447C]'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        ]">{{ opt.label }}</button>
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
            <p class="text-xs text-gray-400 mt-0.5">Ngày gửi: {{ formatDate(record.createdAt) }}</p>
            <p v-if="record.dueDate" class="text-xs mt-0.5"
              :class="isOverdue(record.dueDate) && record.status === 'approved' ? 'text-red-500' : 'text-gray-400'">
              Hạn trả gốc: {{ formatDate(record.dueDate) }}
              <span v-if="isOverdue(record.dueDate) && record.status === 'approved'" class="font-medium"> (Quá hạn)</span>
            </p>
            <p v-if="record.fine > 0" class="text-xs text-red-600 font-medium mt-0.5">
              Phí phạt: {{ record.fine.toLocaleString('vi-VN') }}đ
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <!-- Books với trạng thái từng cuốn -->
        <div class="space-y-2">
          <label
            v-for="item in record.items" :key="item.bookId"
            class="flex items-center gap-3 rounded-lg p-2.5 transition-colors"
            :class="[
              item.itemStatus === 'borrowing' && canRenew(item) ? 'bg-gray-50 hover:bg-blue-50/40 cursor-pointer' : 'bg-gray-50/50',
              isItemSelected(record._id, item.bookId) ? '!bg-blue-50 ring-1 ring-blue-200' : ''
            ]"
          >
            <!-- Checkbox để chọn gia hạn (chỉ khi eligible) -->
            <input
              v-if="record.status === 'approved' && item.itemStatus === 'borrowing' && canRenew(item)"
              type="checkbox"
              :checked="isItemSelected(record._id, item.bookId)"
              @change="toggleItemSelect(record._id, item.bookId)"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
              @click.stop
            />
            <div v-else class="w-4 h-4 flex-shrink-0"></div>

            <img :src="item.coverImage || 'https://placehold.co/40x55/E6F1FB/378ADD?text=?'"
              class="w-8 h-11 object-cover rounded flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.author }}</p>
              <!-- Per-item due date -->
              <p v-if="item.itemDueDate && item.itemStatus === 'borrowing'"
                class="text-[11px] mt-0.5"
                :class="new Date(item.itemDueDate) < new Date() ? 'text-red-500' : 'text-gray-400'">
                Hạn trả: {{ formatDate(item.itemDueDate) }}
                <span v-if="item.renewalCount > 0" class="ml-1 text-indigo-500">(đã gia hạn)</span>
              </p>
              <p v-if="item.itemReturnDate" class="text-[11px] text-green-600 mt-0.5">
                Đã trả: {{ formatDate(item.itemReturnDate) }}
              </p>
            </div>
            <!-- Item badges -->
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <StatusBadge :status="item.itemStatus || (record.status === 'pending' ? 'pending' : 'borrowing')" />
              <span v-if="item.renewalRequested" class="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                Chờ gia hạn
              </span>
            </div>
          </label>
        </div>

        <!-- Actions -->
        <div v-if="hasActions(record)" class="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
          <!-- Hủy yêu cầu (pending) -->
          <button v-if="record.status === 'pending'"
            @click="handleCancel(record._id)" :disabled="canceling === record._id"
            class="text-xs px-4 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            {{ canceling === record._id ? 'Đang hủy...' : 'Hủy yêu cầu' }}
          </button>

          <!-- Xin gia hạn -->
          <button
            v-if="hasRenewableItems(record)"
            @click="handleRequestRenewal(record)"
            :disabled="requestingRef === record._id"
            class="text-xs px-4 py-1.5 rounded-lg border border-[#0C447C] text-[#0C447C] hover:bg-blue-50 transition-colors disabled:opacity-50">
            {{ requestingRef === record._id ? 'Đang gửi...' : getRenewalBtnLabel(record) }}
          </button>
        </div>

        <!-- Hint chọn sách -->
        <p v-if="selectedItems[record._id]?.length > 0" class="text-[11px] text-blue-600 mt-2">
          Đã chọn {{ selectedItems[record._id].length }} cuốn để xin gia hạn
        </p>
      </div>
    </div>

    <AppPagination v-if="pagination.totalPages > 1"
      :current-page="pagination.page" :total-pages="pagination.totalPages"
      @change="fetchData" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { borrowApi } from '../../api/borrowApi'
import { useToast } from 'vue-toastification'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AppPagination from '../../components/common/AppPagination.vue'

const toast        = useToast()
const records      = ref([])
const pagination   = ref({ page: 1, totalPages: 1 })
const loading      = ref(false)
const filterStatus = ref('')
const canceling    = ref(null)
const requestingRef = ref(null)

const selectedItems = reactive({}) // { [recordId]: string[] }

const statusOptions = [
  { label: 'Tất cả',       value: ''                 },
  { label: 'Chờ duyệt',    value: 'pending'          },
  { label: 'Đang mượn',    value: 'approved'         },
  { label: 'Trả một phần', value: 'partial_returned' },
  { label: 'Đã trả',       value: 'returned'         },
  { label: 'Quá hạn',      value: 'overdue'          },
  { label: 'Mất sách',     value: 'lost'             },
]

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')
const isOverdue  = (d) => new Date(d) < new Date()

// Item có thể gia hạn: đang borrowing, chưa gia hạn đủ 1 lần, chưa có request
const canRenew = (item) => item.renewalCount < 1 && !item.renewalRequested

const hasRenewableItems = (record) =>
  ['approved', 'partial_returned'].includes(record.status) &&
  record.items.some(i => i.itemStatus === 'borrowing' && canRenew(i))

const hasActions = (record) =>
  record.status === 'pending' || hasRenewableItems(record)

// ─── Checkbox helpers ─────────────────────────────────────────
const isItemSelected = (recordId, bookId) =>
  selectedItems[recordId]?.includes(bookId.toString()) ?? false

const toggleItemSelect = (recordId, bookId) => {
  if (!selectedItems[recordId]) selectedItems[recordId] = []
  const id  = bookId.toString()
  const idx = selectedItems[recordId].indexOf(id)
  if (idx === -1) selectedItems[recordId].push(id)
  else            selectedItems[recordId].splice(idx, 1)
}

const getRenewalBtnLabel = (record) => {
  const sel = selectedItems[record._id]
  if (sel?.length) return `Xin gia hạn ${sel.length} cuốn đã chọn`
  const eligible = record.items.filter(i => i.itemStatus === 'borrowing' && canRenew(i)).length
  return `Xin gia hạn tất cả (${eligible} cuốn)`
}

// ─── Fetch ────────────────────────────────────────────────────
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 10 }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await borrowApi.getMy(params)
    records.value    = res.data.data.records
    pagination.value = res.data.data.pagination
    Object.keys(selectedItems).forEach(k => delete selectedItems[k])
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ─── Actions ─────────────────────────────────────────────────
const handleCancel = async (id) => {
  if (!confirm('Bạn chắc chắn muốn hủy yêu cầu mượn này?')) return
  canceling.value = id
  try {
    await borrowApi.cancel(id)
    toast.success('Đã hủy yêu cầu mượn')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể hủy yêu cầu')
  } finally {
    canceling.value = null
  }
}

const handleRequestRenewal = async (record) => {
  const sel = selectedItems[record._id]
  const bookIds = sel?.length ? sel : null
  const label   = bookIds ? `${bookIds.length} cuốn đã chọn` : 'tất cả sách hợp lệ'
  if (!confirm(`Xin gia hạn thêm 7 ngày cho ${label}?`)) return

  requestingRef.value = record._id
  try {
    await borrowApi.requestRenewal(record._id, { bookIds })
    toast.success('Đã gửi yêu cầu gia hạn đến thư viện')
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xin gia hạn')
  } finally {
    requestingRef.value = null
  }
}
</script>