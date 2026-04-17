<template>
  <div class="relative" ref="containerRef">
    <!-- Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-lg text-[#B5D4F4] hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
      aria-label="Thông báo"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
      >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 class="text-sm font-semibold text-gray-800">
            Thông báo
            <span v-if="unreadCount > 0" class="ml-1.5 text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
              {{ unreadCount }} chưa đọc
            </span>
          </h3>
          <div class="flex items-center gap-2">
            <button
              v-if="unreadCount > 0"
              @click="handleMarkAllRead"
              class="text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >Đọc hết</button>
            <button
              v-if="notifications.some(n => n.isRead)"
              @click="handleClearRead"
              class="text-[11px] text-gray-400 hover:text-gray-500 font-medium transition-colors"
            >Xóa đã đọc</button>
          </div>
        </div>

        <!-- List -->
        <div class="overflow-y-auto max-h-80">
          <div v-if="loading" class="flex justify-center items-center py-10">
            <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <div v-else-if="notifications.length === 0" class="py-10 text-center">
            <svg class="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="text-gray-400 text-sm">Không có thông báo nào</p>
          </div>
          <div v-else class="divide-y divide-gray-50">
            <button
              v-for="notif in notifications"
              :key="notif._id"
              @click="handleClickNotif(notif)"
              class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start"
              :class="!notif.isRead ? 'bg-blue-50/40' : ''"
            >
              <!-- Type Icon -->
              <div class="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                   :class="typeClasses(notif.type)">
                <span>{{ typeIcon(notif.type) }}</span>
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-gray-800 truncate">{{ notif.title }}</p>
                <p class="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{{ notif.message }}</p>
                <p class="text-[10px] text-gray-400 mt-1">{{ timeAgo(notif.createdAt) }}</p>
              </div>

              <!-- Unread dot -->
              <div v-if="!notif.isRead" class="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-blue-500"></div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationApi } from '../../api/notificationApi'

const router    = useRouter()
const isOpen    = ref(false)
const loading   = ref(false)
const notifications = ref([])
const unreadCount   = ref(0)
const containerRef  = ref(null)

let pollTimer = null

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) fetchNotifications()
}

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await notificationApi.getAll()
    notifications.value = res.data.data.notifications
    unreadCount.value   = res.data.data.unreadCount
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

// Poll unread count every 45 seconds
const fetchUnreadCount = async () => {
  try {
    const res = await notificationApi.getAll()
    unreadCount.value = res.data.data.unreadCount
    if (isOpen.value) notifications.value = res.data.data.notifications
  } catch { /* ignore */ }
}

const handleClickNotif = async (notif) => {
  if (!notif.isRead) {
    notif.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    notificationApi.markAsRead(notif._id).catch(() => {})
  }
  if (notif.link) {
    isOpen.value = false
    router.push(notif.link)
  }
}

const handleMarkAllRead = async () => {
  await notificationApi.markAllRead()
  notifications.value.forEach(n => n.isRead = true)
  unreadCount.value = 0
}

const handleClearRead = async () => {
  await notificationApi.clearRead()
  notifications.value = notifications.value.filter(n => !n.isRead)
}

// Close on outside click
const onOutsideClick = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

// Helpers
const typeIcon = (type) => {
  const map = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' }
  return map[type] || 'ℹ️'
}
const typeClasses = (type) => {
  const map = {
    info:    'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    danger:  'bg-red-100',
  }
  return map[type] || 'bg-gray-100'
}

function timeAgo(dateParam) {
  const date    = new Date(dateParam)
  const seconds = Math.round((new Date() - date) / 1000)
  if (seconds < 60)   return 'Vừa xong'
  const min = Math.floor(seconds / 60)
  if (min < 60)       return `${min} phút trước`
  const hr  = Math.floor(min / 60)
  if (hr < 24)        return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7)        return `${day} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchUnreadCount()
  pollTimer = setInterval(fetchUnreadCount, 45000)
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  clearInterval(pollTimer)
  document.removeEventListener('click', onOutsideClick)
})

// Expose so parent (Navbar) can refresh if needed
defineExpose({ fetchUnreadCount })
</script>
