<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
    <!-- Cover -->
    <RouterLink :to="`/books/${book._id}`">
      <img
        :src="book.coverImage || 'https://placehold.co/400x560?text=No+Cover'"
        :alt="book.title"
        class="w-full h-52 object-cover"
      />
    </RouterLink>

    <!-- Info -->
    <div class="p-4 flex flex-col flex-1">
      <span class="text-xs text-primary-600 font-medium mb-1">
        {{ book.category?.name }}
      </span>
      <RouterLink :to="`/books/${book._id}`">
        <h3 class="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-primary-600">
          {{ book.title }}
        </h3>
      </RouterLink>
      <p class="text-xs text-gray-500 mt-1">{{ book.author }}</p>

      <div class="mt-auto pt-3 flex items-center justify-between">
        <span :class="[
          'text-xs font-medium px-2 py-0.5 rounded-full',
          book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        ]">
          {{ book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết sách' }}
        </span>

        <button
          v-if="auth.isReader"
          @click="handleAddCart"
          :disabled="book.stock === 0 || isInCart(book._id)"
          class="text-xs btn-primary py-1 px-3 disabled:opacity-50"
        >
          {{ isInCart(book._id) ? 'Đã thêm' : '+ Mượn' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth.store'
import { useCart } from '../../composables/useCart'
import { useToast } from 'vue-toastification'

const props = defineProps({
  book: { type: Object, required: true },
})

const auth  = useAuthStore()
const toast = useToast()
const { isInCart, addToCart } = useCart()

const handleAddCart = () => {
  const added = addToCart(props.book)
  if (added) toast.success(`Đã thêm "${props.book.title}" vào giỏ`)
  else toast.info('Sách đã có trong giỏ')
}
</script>