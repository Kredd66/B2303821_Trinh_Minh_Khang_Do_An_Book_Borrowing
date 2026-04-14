<template>
  <div class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden flex flex-col group">
    <!-- Cover -->
    <RouterLink :to="`/books/${book._id}`" class="block relative">
      <img
        :src="book.coverImage || `https://placehold.co/300x420/E6F1FB/378ADD?text=${encodeURIComponent(book.title.slice(0,10))}`"
        :alt="book.title"
        class="w-full h-36 object-cover group-hover:opacity-95 transition-opacity"
      />
      <span :class="[
        'absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full',
        book.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      ]">
        {{ book.stock > 0 ? `Còn ${book.stock}` : 'Hết' }}
      </span>
    </RouterLink>

    <!-- Info -->
    <div class="p-3 flex flex-col flex-1">
      <span style="color:#185FA5;" class="text-[10px] font-medium uppercase tracking-wide mb-1">
        {{ book.category?.name }}
      </span>
      <RouterLink :to="`/books/${book._id}`">
        <h3 class="text-xs font-medium text-gray-800 leading-snug line-clamp-2 hover:text-[#0C447C] transition-colors mb-1">
          {{ book.title }}
        </h3>
      </RouterLink>
      <p class="text-[10px] text-gray-400 mb-3">{{ book.author }}</p>

      <div class="mt-auto">
        <button
          v-if="auth.isAuthenticated && auth.isReader"
          @click="handleAddCart"
          :disabled="book.stock === 0 || isInCart(book._id)"
          :class="[
            'w-full text-xs py-1.5 rounded-lg font-medium transition-colors',
            isInCart(book._id)
              ? 'bg-[#E6F1FB] text-[#185FA5] cursor-default'
              : book.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#0C447C] hover:bg-[#185FA5] text-white'
          ]"
        >
          {{ isInCart(book._id) ? 'Đã thêm' : book.stock === 0 ? 'Hết sách' : '+ Mượn' }}
        </button>
        <RouterLink
          v-else-if="!auth.isAuthenticated"
          to="/login"
          class="block w-full text-center text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
        >
          Đăng nhập để mượn
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth.store'
import { useCart } from '../../composables/useCart'
import { useToast } from 'vue-toastification'

const props = defineProps({ book: { type: Object, required: true } })
const auth  = useAuthStore()
const toast = useToast()
const { isInCart, addToCart } = useCart()

const handleAddCart = () => {
  const added = addToCart(props.book)
  if (added) toast.success(`Đã thêm "${props.book.title}" vào giỏ`)
  else toast.info('Sách đã có trong giỏ rồi')
}
</script>