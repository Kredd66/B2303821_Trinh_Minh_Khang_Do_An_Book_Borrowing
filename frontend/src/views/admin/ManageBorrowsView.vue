<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-5">Quản lý phiếu mượn</h1>

    <!-- Filter & Search -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div class="flex gap-1.5 flex-wrap">
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
      <div class="relative w-full sm:w-64 flex-shrink-0">
        <input v-model="searchKeyword" @keyup.enter="fetchData(1)"
          type="text" placeholder="Tìm tên, email, MSSV..."
          class="input-field !py-1.5 !pl-9 !text-sm" />
        <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse h-32"></div>
    </div>

    <div v-else-if="records.length === 0" class="card text-center py-14">
      <p class="text-gray-400 text-sm">Không có phiếu mượn nào</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="record in records" :key="record._id" class="card">
        <!-- User info -->
        <div class="flex items-start justify-between mb-3 pb-3 border-b border-gray-50">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-gray-900">{{ record.user?.name }}</p>
              <!-- Nhãn xin gia hạn nếu có item nào đang chờ -->
              <span v-if="hasRenewalRequest(record)"
                class="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Xin gia hạn
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ record.user?.email }}
              <span v-if="record.user?.studentId"> · MSSV: {{ record.user.studentId }}</span>
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              Ngày gửi: {{ formatDate(record.createdAt) }}
              <span v-if="record.dueDate"> · Hạn trả:
                <span :class="isLate(record) ? 'text-red-500 font-medium' : ''">
                  {{ formatDate(record.dueDate) }}
                  <span v-if="isLate(record)"> (trễ {{ lateDays(record) }} ngày)</span>
                </span>
              </span>
            </p>
            <p v-if="record.fine > 0" class="text-xs font-medium text-red-600 mt-1">
              Tổng phí phạt: {{ record.fine.toLocaleString('vi-VN') }}đ
            </p>
          </div>
          <StatusBadge :status="record.status" />
        </div>

        <!-- Books with per-item status + selection checkboxes -->
        <div class="space-y-2 mb-3">
          <label
            v-for="item in record.items" :key="item.bookId"
            class="flex items-center gap-3 rounded-lg p-2 transition-colors cursor-pointer"
            :class="[
              item.itemStatus === 'borrowing' ? 'bg-gray-50 hover:bg-blue-50/40' : 'bg-white opacity-60',
              isSelected(record._id, item.bookId) ? '!bg-blue-50 ring-1 ring-blue-200' : ''
            ]"
          >
            <!-- Checkbox — chỉ hiện khi item đang borrowing -->
            <input
              v-if="item.itemStatus === 'borrowing' && ['approved', 'overdue', 'partial_returned'].includes(record.status)"
              type="checkbox"
              :checked="isSelected(record._id, item.bookId)"
              @change="toggleSelect(record._id, item.bookId)"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
              @click.stop
            />
            <div v-else class="w-4 h-4 flex-shrink-0"></div>

            <img :src="item.coverImage || 'https://placehold.co/36x50/E6F1FB/378ADD?text=?'"
              class="w-8 h-10 object-cover rounded flex-shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.author }}</p>
              <p v-if="item.itemDueDate && item.itemStatus === 'borrowing'"
                class="text-[11px] mt-0.5"
                :class="new Date(item.itemDueDate) < new Date() ? 'text-red-500' : 'text-gray-400'">
                Hạn: {{ formatDate(item.itemDueDate) }}
                <span v-if="item.renewalCount > 0" class="ml-1 text-indigo-500">(+7 ngày)</span>
              </p>
            </div>
            <!-- Item status badge -->
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
              <StatusBadge :status="item.itemStatus" />
              <span v-if="item.renewalRequested" class="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                Chờ gia hạn
              </span>
            </div>
          </label>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 flex-wrap pt-1 border-t border-gray-50">
          <!-- Duyệt (pending) -->
          <button v-if="record.status === 'pending'"
            @click="handleApprove(record._id)" :disabled="approving === record._id"
            class="btn-primary !py-1.5 !px-4">
            {{ approving === record._id ? 'Đang duyệt...' : 'Duyệt phiếu' }}
          </button>

          <!-- Xác nhận trả -->
          <button v-if="['approved', 'overdue', 'partial_returned'].includes(record.status)"
            @click="handleReturn(record)" :disabled="returning === record._id"
            class="btn-secondary !py-1.5 !px-4">
            {{ returning === record._id ? 'Đang xử lý...' : getReturnLabel(record) }}
          </button>

          <!-- Duyệt gia hạn -->
          <button v-if="hasRenewalRequest(record)"
            @click="handleApproveRenewal(record)" :disabled="approvingRenewal === record._id"
            class="text-xs px-4 py-1.5 rounded-md font-medium transition-colors border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50">
            {{ approvingRenewal === record._id ? 'Đang duyệt...' : getRenewalLabel(record) }}
          </button>

          <!-- Báo mất sách -->
          <button v-if="['approved', 'overdue', 'partial_returned'].includes(record.status)"
            @click="handleLost(record)" :disabled="losing === record._id"
            class="btn-danger !py-1.5 !px-4">
            {{ losing === record._id ? 'Đang xử lý...' : getLostLabel(record) }}
          </button>
        </div>

        <!-- Hint khi có checkbox được chọn -->
        <p v-if="selectedBooks[record._id]?.length > 0" class="text-[11px] text-blue-600 mt-2">
          Đã chọn {{ selectedBooks[record._id].length }} / {{ record.items.filter(i => i.itemStatus === 'borrowing').length }} cuốn để thao tác
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
const approving    = ref(null)
const returning    = ref(null)
const losing       = ref(null)
const approvingRenewal = ref(null)
const filterStatus = ref('pending')
const searchKeyword = ref('')

// Lưu danh sách bookId được chọn theo từng record
const selectedBooks = reactive({}) // { [recordId]: string[] }

const statusOptions = [
  { label: 'Chờ duyệt',   value: 'pending'          },
  { label: 'Đang mượn',   value: 'approved'          },
  { label: 'Trả một phần', value: 'partial_returned' },
  { label: 'Quá hạn',     value: 'overdue'           },
  { label: 'Đã trả',      value: 'returned'          },
  { label: 'Mất sách',    value: 'lost'              },
  { label: 'Tất cả',      value: ''                  },
]

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')
const isLate     = (r) => r.dueDate && new Date(r.dueDate) < new Date() && !['returned'].includes(r.status)
const lateDays   = (r) => Math.ceil((new Date() - new Date(r.dueDate)) / (1000 * 60 * 60 * 24))
const hasRenewalRequest = (r) => r.items.some(i => i.renewalRequested)

// ─── Checkbox helpers ─────────────────────────────────────────
const isSelected = (recordId, bookId) =>
  selectedBooks[recordId]?.includes(bookId.toString()) ?? false

const toggleSelect = (recordId, bookId) => {
  if (!selectedBooks[recordId]) selectedBooks[recordId] = []
  const id  = bookId.toString()
  const idx = selectedBooks[recordId].indexOf(id)
  if (idx === -1) selectedBooks[recordId].push(id)
  else            selectedBooks[recordId].splice(idx, 1)
}

// Lấy bookIds để thao tác: nếu có chọn → dùng chọn, không → mặc định là tất cả borrowing
const getTargetBookIds = (record) => {
  const sel = selectedBooks[record._id]
  return sel?.length ? sel : null // null = backend trả tất cả
}

// ─── Label động theo số sách được chọn ───────────────────────
const getReturnLabel = (record) => {
  const sel = selectedBooks[record._id]
  if (sel?.length) return `Trả ${sel.length} cuốn chọn`
  const borrowing = record.items.filter(i => i.itemStatus === 'borrowing').length
  return `Trả tất cả (${borrowing} cuốn)`
}

const getLostLabel = (record) => {
  const sel = selectedBooks[record._id]
  if (sel?.length) return `Báo mất ${sel.length} cuốn`
  return 'Báo mất tất cả'
}

const getRenewalLabel = (record) => {
  const waiting = record.items.filter(i => i.renewalRequested).length
  return `Duyệt gia hạn (${waiting} cuốn)`
}

// ─── Fetch ────────────────────────────────────────────────────
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: 10 }
    if (filterStatus.value)  params.status = filterStatus.value
    if (searchKeyword.value) params.search = searchKeyword.value.trim()
    const res = await borrowApi.getAll(params)
    records.value    = res.data.data.records
    pagination.value = res.data.data.pagination
    // Reset selections
    Object.keys(selectedBooks).forEach(k => delete selectedBooks[k])
  } finally {
    loading.value = false
  }
}

// ─── Actions ─────────────────────────────────────────────────
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

const handleReturn = async (record) => {
  const bookIds = getTargetBookIds(record)
  const label   = bookIds ? `${bookIds.length} cuốn đã chọn` : 'tất cả sách đang mượn'
  if (!confirm(`Xác nhận trả ${label}?`)) return

  returning.value = record._id
  try {
    const res = await borrowApi.return(record._id, { bookIds })
    const { fineText, returnedCount, stillBorrowing } = res.data.data
    const msg = stillBorrowing > 0
      ? `Đã trả ${returnedCount} cuốn. Còn ${stillBorrowing} cuốn. ${fineText}`
      : `Trả sách thành công! ${fineText}`
    toast.success(msg)
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xác nhận trả')
  } finally {
    returning.value = null
  }
}

const handleLost = async (record) => {
  const bookIds = getTargetBookIds(record)
  const label   = bookIds ? `${bookIds.length} cuốn đã chọn` : 'tất cả sách đang mượn'
  if (!confirm(`Xác nhận báo mất ${label}? Không thể hoàn tác!`)) return

  losing.value = record._id
  try {
    const res = await borrowApi.reportLost(record._id, { bookIds })
    toast.warning(`Đã ghi nhận mất sách. ${res.data.data.fineText}`)
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xử lý')
  } finally {
    losing.value = null
  }
}

const handleApproveRenewal = async (record) => {
  if (!confirm('Duyệt gia hạn thêm 7 ngày cho các cuốn sách đang xin gia hạn?')) return
  approvingRenewal.value = record._id
  try {
    const res = await borrowApi.approveRenewal(record._id)
    toast.success(res.data.message)
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể duyệt gia hạn')
  } finally {
    approvingRenewal.value = null
  }
}

onMounted(() => fetchData())
</script>