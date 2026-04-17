<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-xl font-medium text-gray-900 mb-5 flex items-center gap-2">
      <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Sách đang đặt trước
    </h1>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card animate-pulse h-24"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="reservations.length === 0" class="card text-center py-14">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
      <p class="text-gray-500 font-medium mb-1">Hiện không có đăng ký đặt trước nào</p>
      <p class="text-gray-400 text-sm mb-4">Bạn có thể đặt trước những cuốn sách đang hết kho để giữ chỗ.</p>
      <RouterLink to="/" class="btn-primary inline-block">Tìm sách mới</RouterLink>
    </div>

    <!-- Reservations List -->
    <div v-else class="space-y-3">
      <div v-for="resv in reservations" :key="resv._id" class="card relative overflow-hidden">
        <!-- Badge Status -->
        <div class="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold"
          :class="[
            resv.status === 'notified' ? 'bg-amber-500 text-white' : 
            resv.status === 'waiting' ? 'bg-blue-100 text-blue-700' :
            resv.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          ]">
          {{ getStatusLabel(resv.status) }}
        </div>

        <div class="flex items-start gap-4">
          <img :src="resv.book.coverImage || 'https://placehold.co/60x85/E6F1FB/378ADD?text=?'"
            class="w-14 h-20 object-cover rounded shadow-sm flex-shrink-0" />
            
          <div class="flex-1 min-w-0 pr-20 pt-1">
            <h3 class="text-base font-medium text-gray-800 truncate">{{ resv.book.title }}</h3>
            <p class="text-sm text-gray-500">{{ resv.book.author }}</p>

            <p class="text-xs text-gray-400 mt-2 flex items-center gap-1">
              Ngày đặt: {{ new Date(resv.createdAt).toLocaleDateString('vi-VN') }}
            </p>

            <div v-if="resv.status === 'notified'" class="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md font-medium flex items-start gap-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Sách đã sẵn sàng! Bạn có đến {{ getDeadline(resv.notifiedAt) }} để tạo phiếu mượn. (Vượt quá thời gian hệ thống sẽ tự động hủy đơn).</span>
            </div>
          </div>
        </div>

        <div v-if="['waiting', 'notified'].includes(resv.status)" class="mt-4 pt-3 border-t border-gray-50 flex gap-2 justify-end">
          <button @click="handleCancel(resv._id)" :disabled="canceling === resv._id" class="text-sm text-red-500 hover:bg-red-50 px-4 py-2 rounded transition-colors disabled:opacity-50">
            {{ canceling === resv._id ? 'Đang hủy...' : 'Hủy đăng ký' }}
          </button>
          
          <button v-if="resv.status === 'notified'" @click="handleAddToCart(resv.book)" class="btn-primary !py-2 !text-sm">
            Mượn ngay lập tức
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reservationApi } from '../../api/reservationApi'
import { useCart } from '../../composables/useCart'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const toast = useToast()
const { items: cartItems, addToCart } = useCart()
const router = useRouter()

const reservations = ref([])
const loading = ref(true)
const canceling = ref(null)

const getStatusLabel = (status) => {
  const map = {
    waiting: '⏳ Đang vào hàng đợi',
    notified: '🔥 Kho đã có sách',
    fulfilled: '✅ Đã mượn thành công',
    cancelled: '❌ Đã hủy',
  }
  return map[status] || status
}

const getDeadline = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr)
  date.setDate(date.getDate() + 1) // +24 hours
  return date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' ' + date.toLocaleDateString('vi-VN')
}

const fetchReservations = async () => {
  loading.value = true
  try {
    const res = await reservationApi.getMy()
    reservations.value = res.data.data
  } catch (error) {
    toast.error('Không thể tải lịch sử Đặt trước')
  } finally {
    loading.value = false
  }
}

const handleCancel = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn hủy đơn đăng ký ưu tiên cuốn sách này?')) return
  canceling.value = id
  try {
    await reservationApi.cancel(id)
    toast.success('Hủy đăng ký thành công')
    fetchReservations()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Không thể hủy')
  } finally {
    canceling.value = null
  }
}

const handleAddToCart = (bookObj) => {
  if (cartItems.value.length >= 5) {
    toast.error('Chỉ được mượn tối đa 5 cuốn cùng lúc!')
    return
  }
  if (cartItems.value.some(i => i._id === bookObj._id)) {
    toast.warning('Sách này đã có trong giỏ mượn')
    router.push('/cart')
    return
  }
  addToCart(bookObj)
  toast.success('Đã thêm tự động vào giỏ mượn')
  router.push('/cart')
}

onMounted(() => fetchReservations())
</script>
