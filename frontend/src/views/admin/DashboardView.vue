<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
      <p class="text-gray-500 mt-1">Hello, theo dõi hoạt động mượn sách hôm nay.</p>
    </div>

    <!-- Stats Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="i in 4" :key="i" class="card animate-pulse h-28 bg-gray-100"></div>
    </div>

    <!-- Metric Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-blue-50 focus:outline-none rounded-bl-full -z-0 opacity-50"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-gray-500 mb-1">Độc giả</p>
          <h3 class="text-3xl font-bold text-gray-800">{{ stats?.cards?.totalUsers || 0 }}</h3>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <span class="font-medium">Thành viên</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-emerald-50 focus:outline-none rounded-bl-full -z-0 opacity-50"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-gray-500 mb-1">Đầu sách</p>
          <h3 class="text-3xl font-bold text-gray-800">{{ stats?.cards?.totalBooks || 0 }}</h3>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <span class="font-medium">Đang phát hành</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-amber-50 focus:outline-none rounded-bl-full -z-0 opacity-50"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-gray-500 mb-1">Chờ duyệt</p>
          <h3 class="text-3xl font-bold text-gray-800">{{ stats?.cards?.pendingBorrows || 0 }}</h3>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span class="font-medium">Yêu cầu mượn</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <div class="absolute right-0 top-0 w-24 h-24 bg-rose-50 focus:outline-none rounded-bl-full -z-0 opacity-50"></div>
        <div class="relative z-10">
          <p class="text-sm font-medium text-gray-500 mb-1">Quá hạn</p>
          <h3 class="text-3xl font-bold text-gray-800">{{ stats?.cards?.overdueBorrows || 0 }}</h3>
        </div>
        <div class="mt-4 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span class="font-medium">Chưa trả lại</span>
        </div>
      </div>

    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Chart -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Biểu đồ mượn sách (7 ngày qua)</h2>
        
        <div v-if="loading" class="animate-pulse h-48 bg-gray-50 rounded-lg"></div>
        <div v-else class="flex items-end justify-between h-48 gap-2 mt-4 px-2 relative" style="padding-bottom: 24px;">
          <!-- Grid lines -->
          <div class="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between z-0">
            <div class="border-b border-gray-100/50 w-full h-0"></div>
            <div class="border-b border-gray-100/50 w-full h-0"></div>
            <div class="border-b border-gray-100/50 w-full h-0"></div>
            <div class="border-b border-gray-100/50 w-full h-0"></div>
            <div class="border-b border-gray-200 w-full h-0"></div>
          </div>
          
          <template v-if="stats?.chartData">
            <!-- Bars -->
            <div v-for="(val, idx) in stats.chartData.data" :key="idx" class="flex flex-col items-center flex-1 z-10 group relative h-full justify-end pb-6">
              <!-- Label overlay -->
              <div class="absolute -top-8 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {{ val }} sách
              </div>
              
              <!-- Bar -->
              <div class="w-full max-w-[40px] bg-blue-500/80 group-hover:bg-blue-600 rounded-t-sm transition-all"
                   :style="{ height: `${val === 0 ? 2 : (val / maxChartValue) * 100}%`, minHeight: '2%' }"></div>
              
              <!-- X Axis Label -->
              <div class="absolute -bottom-1 text-[10px] text-gray-400 font-medium whitespace-nowrap">
                {{ stats.chartData.labels[idx] }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-medium text-gray-900">Hoạt động gần đây</h2>
          <RouterLink to="/admin/borrows" class="text-blue-600 hover:text-blue-700 text-xs font-medium">Xem tất cả</RouterLink>
        </div>
        
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse flex gap-3"><div class="w-8 h-8 bg-gray-100 rounded-full"></div><div class="flex-1 bg-gray-50 h-8 rounded"></div></div>
        </div>
        <div v-else-if="!stats?.recentBorrows?.length" class="text-center py-8 text-gray-400 text-sm">
          Chưa có hoạt động nào
        </div>
        <div v-else class="space-y-4 relative">
          <!-- Timeline line -->
          <div class="absolute left-4 top-4 bottom-4 w-px bg-gray-100 -z-10"></div>
          
          <div v-for="(borrow, idx) in stats.recentBorrows" :key="borrow._id" class="flex gap-4">
            <div class="flex-shrink-0 mt-1 z-10">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white"
                   :class="
                     borrow.status === 'pending' ? 'bg-amber-400' :
                     borrow.status === 'approved' ? 'bg-emerald-500' :
                     borrow.status === 'returned' ? 'bg-blue-500' : 
                     borrow.status === 'lost' ? 'bg-gray-500' : 'bg-rose-500'
                   ">
                <svg v-if="borrow.status === 'pending'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <svg v-else-if="borrow.status === 'approved'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                <span class="text-blue-600">{{ borrow.user?.name || 'Khách' }}</span> 
                {{ borrow.status === 'pending' ? 'đã gửi yêu cầu mượn' : 
                   borrow.status === 'approved' ? 'được duyệt mượn' : 
                   borrow.status === 'returned' ? 'đã trả' : 'chưa trả' }}
                {{ borrow.items.length }} cuốn sách
              </p>
              <div class="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ timeAgo(borrow.createdAt) }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { adminApi } from '../../api/adminApi'
import { useToast } from 'vue-toastification'

const toast = useToast()
const stats = ref(null)
const loading = ref(true)

const maxChartValue = computed(() => {
  if (!stats.value?.chartData?.data) return 1
  return Math.max(...stats.value.chartData.data, 5) // Tối thiểu là 5 điểm để biểu đồ trông không quá trống
})

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await adminApi.getStats()
    stats.value = res.data.data
  } catch (err) {
    toast.error('Không thể lấy dữ liệu thống kê')
  } finally {
    loading.value = false
  }
}

// Hàm tính thời gian
function timeAgo(dateParam) {
  const date = new Date(dateParam)
  const now = new Date()
  const seconds = Math.round((now - date) / 1000)
  
  if (seconds < 60) return `Vừa xong`
  const min = Math.floor(seconds / 60)
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  
  return date.toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchStats()
})
</script>
