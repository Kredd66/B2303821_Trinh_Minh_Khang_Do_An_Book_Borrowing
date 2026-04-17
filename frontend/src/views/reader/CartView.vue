<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-6">Giỏ sách mượn</h1>

    <!-- Cảnh báo quá hạn -->
    <div v-if="hasOverdue" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
      <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <p class="text-sm font-medium text-red-700">Bạn đang có sách quá hạn</p>
        <p class="text-xs text-red-500 mt-0.5">
          Vui lòng mang sách đến trả trước khi gửi yêu cầu mượn mới.
          <RouterLink to="/history" class="underline font-medium">Xem lịch sử</RouterLink>
        </p>
      </div>
    </div>

    <!-- Cảnh báo đạt giới hạn -->
    <div v-if="nearLimit" class="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <p class="text-sm text-amber-700">
        Bạn đang mượn <strong>{{ currentBorrowCount }}</strong> / 5 cuốn cho phép.
      </p>
    </div>

    <!-- Empty -->
    <div v-if="items.length === 0" class="card text-center py-14">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <p class="text-gray-400 text-sm mb-3">Giỏ sách đang trống</p>
      <RouterLink to="/" class="btn-primary inline-block">Tìm sách để mượn</RouterLink>
    </div>

    <template v-else>
      <!-- Items -->
      <div class="space-y-2.5 mb-5">
        <div v-for="item in items" :key="item.bookId" class="card flex items-center gap-3 !p-3">
          <img
            :src="item.coverImage || `https://placehold.co/60x80/E6F1FB/378ADD?text=?`"
            class="w-10 h-14 object-cover rounded-md flex-shrink-0 border border-gray-100"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ item.author }}</p>
          </div>
          <button
            @click="removeFromCart(item.bookId)"
            class="flex-shrink-0 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
          >Xóa</button>
        </div>
      </div>

      <!-- Summary -->
      <div class="card">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Số sách muốn mượn</span>
            <span class="font-medium text-gray-900">{{ items.length }} cuốn</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Đang mượn / giới hạn</span>
            <span :class="currentBorrowCount >= 4 ? 'text-amber-600 font-medium' : 'font-medium text-gray-900'">
              {{ currentBorrowCount }} / 5 cuốn
            </span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Thời hạn mượn</span>
            <span class="font-medium text-gray-900">14 ngày</span>
          </div>
          <div class="border-t border-gray-100 pt-2">
            <p class="text-xs text-gray-400">Hạn trả được tính từ ngày Admin duyệt phiếu</p>
          </div>
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading || items.length === 0"
          class="btn-primary w-full !py-2.5"
        >
          {{ loading ? 'Đang gửi...' : 'Gửi yêu cầu mượn' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../../composables/useCart'
import { borrowApi } from '../../api/borrowApi'
import { useToast } from 'vue-toastification'

const { items, removeFromCart, clearCart } = useCart()
const router  = useRouter()
const toast   = useToast()
const loading = ref(false)

const myBorrows        = ref([])
const hasOverdue       = ref(false)
const currentBorrowCount = ref(0)

const nearLimit = computed(() => currentBorrowCount.value >= 4)

onMounted(async () => {
  try {
    const res = await borrowApi.getMy({ limit: 50 })
    myBorrows.value = res.data.data.records

    hasOverdue.value = myBorrows.value.some((r) => r.status === 'overdue')
    currentBorrowCount.value = myBorrows.value
      .filter((r) => ['pending', 'approved', 'overdue', 'partial_returned'].includes(r.status))
      .reduce((sum, r) => sum + r.items.filter(i => i.itemStatus === 'borrowing').length, 0)
  } catch {
    // Nếu chưa đăng nhập thì bỏ qua
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await borrowApi.create({ items: items.value })
    clearCart()
    toast.success('Gửi yêu cầu mượn thành công!')
    router.push('/history')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại')
  } finally {
    loading.value = false
  }
}
</script>