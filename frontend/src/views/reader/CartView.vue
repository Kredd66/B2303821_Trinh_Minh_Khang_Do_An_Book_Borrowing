<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Giỏ sách mượn</h1>

    <div v-if="items.length === 0" class="card text-center py-12 text-gray-400">
      Giỏ sách trống. <RouterLink to="/" class="text-primary-600 hover:underline">Tìm sách để mượn</RouterLink>
    </div>

    <template v-else>
      <div class="space-y-3 mb-6">
        <div
          v-for="item in items" :key="item.bookId"
          class="card flex items-center gap-4 p-4"
        >
          <img
            :src="item.coverImage || 'https://placehold.co/60x80?text=?'"
            class="w-12 h-16 object-cover rounded"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-800 text-sm">{{ item.title }}</p>
            <p class="text-gray-500 text-xs">{{ item.author }}</p>
          </div>
          <button @click="removeFromCart(item.bookId)" class="text-red-400 hover:text-red-600 text-sm">
            Xóa
          </button>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between text-sm text-gray-600 mb-4">
          <span>Tổng số sách:</span>
          <span class="font-semibold">{{ items.length }} cuốn</span>
        </div>
        <button @click="handleSubmit" :disabled="loading" class="btn-primary w-full">
          {{ loading ? 'Đang gửi...' : 'Gửi yêu cầu mượn' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../../composables/useCart'
import { borrowApi } from '../../api/borrowApi'
import { useToast } from 'vue-toastification'

const { items, removeFromCart, clearCart } = useCart()
const router  = useRouter()
const toast   = useToast()
const loading = ref(false)

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