<template>
  <div v-if="loading" class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
  </div>

  <div v-else-if="book" class="max-w-3xl mx-auto">
    <div class="card flex flex-col sm:flex-row gap-8">
      <img
        :src="book.coverImage || 'https://placehold.co/400x560?text=No+Cover'"
        :alt="book.title"
        class="w-48 h-64 object-cover rounded-lg flex-shrink-0 mx-auto sm:mx-0"
      />
      <div class="flex-1">
        <span class="text-sm text-primary-600 font-medium">{{ book.category?.name }}</span>
        <h1 class="text-2xl font-bold text-gray-800 mt-1">{{ book.title }}</h1>
        <p class="text-gray-500 mt-1">Tác giả: {{ book.author }}</p>
        <p v-if="book.isbn" class="text-gray-400 text-sm mt-1">ISBN: {{ book.isbn }}</p>

        <div class="mt-4">
          <span :class="[
            'text-sm font-medium px-3 py-1 rounded-full',
            book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          ]">
            {{ book.stock > 0 ? `Còn ${book.stock} cuốn trong kho` : 'Hiện hết sách' }}
          </span>
        </div>

        <p class="text-gray-600 text-sm leading-relaxed mt-4">{{ book.description }}</p>

        <div class="mt-6 flex gap-3">
          <button @click="handleAddCart" v-if="auth.isReader"
            :disabled="book.stock === 0 || isInCart(book._id)"
            class="btn-primary disabled:opacity-50">
            {{ isInCart(book._id) ? 'Đã có trong giỏ' : '+ Thêm vào giỏ mượn' }}
          </button>
          <RouterLink to="/" class="btn-secondary">Quay lại</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { bookApi } from '../../api/bookApi'
import { useAuthStore } from '../../stores/auth.store'
import { useCart } from '../../composables/useCart'
import { useToast } from 'vue-toastification'

const route   = useRoute()
const auth    = useAuthStore()
const toast   = useToast()
const { isInCart, addToCart } = useCart()

const book    = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await bookApi.getById(route.params.id)
    book.value = res.data.data
  } finally {
    loading.value = false
  }
})

const handleAddCart = () => {
  const added = addToCart(book.value)
  if (added) toast.success('Đã thêm vào giỏ mượn!')
}
</script>