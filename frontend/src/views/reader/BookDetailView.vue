<template>
  <div class="max-w-4xl mx-auto">

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#0C447C] border-t-transparent"></div>
    </div>

    <template v-else-if="book">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <RouterLink to="/" class="hover:text-[#185FA5] transition-colors">Danh sách sách</RouterLink>
        <span>/</span>
        <span style="color:#185FA5;">{{ book.category?.name }}</span>
        <span>/</span>
        <span class="text-gray-600 truncate max-w-xs">{{ book.title }}</span>
      </div>

      <!-- Main card -->
      <div class="card !p-0 overflow-hidden mb-4">
        <div class="flex flex-col sm:flex-row">

          <!-- Cover -->
          <div class="sm:w-56 flex-shrink-0 bg-[#E6F1FB] flex flex-col items-center justify-center p-8 gap-4">
            <img
              :src="book.coverImage || `https://placehold.co/280x400/E6F1FB/378ADD?text=${encodeURIComponent(book.title.slice(0,12))}`"
              :alt="book.title"
              class="w-40 rounded-lg border border-white/60 shadow-sm object-cover"
              style="aspect-ratio: 2/3"
            />
            <!-- Stock badge -->
            <div :class="[
              'w-full text-center text-xs font-medium py-2 rounded-lg',
              book.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            ]">
              {{ book.stock > 0 ? `Còn ${book.stock} / ${book.totalCopies} cuốn` : 'Hiện đã hết sách' }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 p-6 flex flex-col">

            <!-- Category -->
            <span style="color:#185FA5;" class="text-xs font-medium uppercase tracking-wider mb-2">
              {{ book.category?.name }}
            </span>

            <!-- Title -->
            <h1 class="text-xl font-medium text-gray-900 leading-snug mb-1">
              {{ book.title }}
            </h1>

            <!-- Author -->
            <p class="text-sm text-gray-500 mb-4">
              Tác giả: <span class="text-gray-700 font-medium">{{ book.author }}</span>
            </p>

            <!-- Divider -->
            <div class="border-t border-gray-100 mb-4"></div>

            <!-- Metadata grid -->
            <div class="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
              <div v-if="book.isbn">
                <p class="text-xs text-gray-400 mb-0.5">ISBN</p>
                <p class="text-sm text-gray-700 font-medium">{{ book.isbn }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Thể loại</p>
                <p class="text-sm text-gray-700 font-medium">{{ book.category?.name }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Tổng số bản</p>
                <p class="text-sm text-gray-700 font-medium">{{ book.totalCopies }} cuốn</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Hiện có thể mượn</p>
                <p class="text-sm font-medium" :class="book.stock > 0 ? 'text-green-600' : 'text-red-500'">
                  {{ book.stock }} cuốn
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Thời hạn mượn</p>
                <p class="text-sm text-gray-700 font-medium">14 ngày</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Ngày cập nhật</p>
                <p class="text-sm text-gray-700 font-medium">
                  {{ new Date(book.updatedAt).toLocaleDateString('vi-VN') }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-auto flex gap-3 flex-wrap">
              <button
                v-if="auth.isReader"
                @click="handleAddCart"
                :disabled="book.stock === 0 || isInCart(book._id)"
                :class="[
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isInCart(book._id)
                    ? 'bg-[#E6F1FB] text-[#185FA5] cursor-default'
                    : book.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#0C447C] hover:bg-[#185FA5] text-white'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {{ isInCart(book._id) ? 'Đã có trong giỏ' : book.stock === 0 ? 'Hết sách' : 'Thêm vào giỏ mượn' }}
              </button>

              <RouterLink
                v-if="isInCart(book._id)"
                to="/cart"
                class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-[#0C447C] text-[#0C447C] hover:bg-[#E6F1FB] transition-colors"
              >
                Xem giỏ mượn
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </RouterLink>

              <RouterLink
                v-if="!auth.isAuthenticated"
                to="/login"
                class="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#0C447C] text-white hover:bg-[#185FA5] transition-colors"
              >
                Đăng nhập để mượn
              </RouterLink>

              <RouterLink
                to="/"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Quay lại
              </RouterLink>
            </div>

          </div>
        </div>
      </div>

      <!-- Tabs: Mô tả / Chi tiết -->
      <div class="card !p-0 overflow-hidden mb-4">
        <!-- Tab header -->
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-[#0C447C] text-[#0C447C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >{{ tab.label }}</button>
        </div>

        <!-- Tab: Mô tả -->
        <div v-if="activeTab === 'description'" class="p-6">
          <div v-if="book.description" class="prose-sm text-gray-600 leading-relaxed text-sm whitespace-pre-line">
            {{ book.description }}
          </div>
          <div v-else class="text-center py-8">
            <svg class="w-10 h-10 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-gray-400 text-sm">Chưa có mô tả cho cuốn sách này</p>
          </div>
        </div>

        <!-- Tab: Chi tiết sản phẩm -->
        <div v-if="activeTab === 'details'" class="p-6">
          <table class="w-full text-sm">
            <tbody>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 w-40 text-xs">Tên sách</td>
                <td class="py-3 text-gray-800 font-medium">{{ book.title }}</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Tác giả</td>
                <td class="py-3 text-gray-800">{{ book.author }}</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Thể loại</td>
                <td class="py-3">
                  <span style="background:#E6F1FB;color:#0C447C;" class="text-xs font-medium px-2.5 py-1 rounded-full">
                    {{ book.category?.name }}
                  </span>
                </td>
              </tr>
              <tr v-if="book.isbn" class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">ISBN</td>
                <td class="py-3 text-gray-800 font-mono text-xs">{{ book.isbn }}</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Tổng số bản</td>
                <td class="py-3 text-gray-800">{{ book.totalCopies }} cuốn</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Đang có sẵn</td>
                <td class="py-3">
                  <span :class="book.stock > 0 ? 'text-green-600' : 'text-red-500'" class="font-medium">
                    {{ book.stock }} cuốn
                  </span>
                </td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Đang được mượn</td>
                <td class="py-3 text-gray-800">{{ book.totalCopies - book.stock }} cuốn</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Thời hạn mượn</td>
                <td class="py-3 text-gray-800">14 ngày kể từ ngày được duyệt</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Phí phạt trễ hạn</td>
                <td class="py-3 text-gray-800">2.000đ / ngày</td>
              </tr>
              <tr class="border-b border-gray-50">
                <td class="py-3 text-gray-400 text-xs">Trạng thái</td>
                <td class="py-3">
                  <span :class="[
                    'text-xs font-medium px-2.5 py-1 rounded-full',
                    book.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  ]">
                    {{ book.stock > 0 ? 'Có thể mượn' : 'Tạm hết' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="py-3 text-gray-400 text-xs">Cập nhật lần cuối</td>
                <td class="py-3 text-gray-800">
                  {{ new Date(book.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sách cùng thể loại -->
      <div v-if="relatedBooks.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-medium text-gray-900">Sách cùng thể loại</h2>
          <RouterLink
            :to="`/?category=${book.category?._id}`"
            style="color:#185FA5;"
            class="text-xs hover:underline"
          >Xem tất cả</RouterLink>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RouterLink
            v-for="related in relatedBooks"
            :key="related._id"
            :to="`/books/${related._id}`"
            class="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden flex flex-col group"
          >
            <img
              :src="related.coverImage || `https://placehold.co/300x420/E6F1FB/378ADD?text=${encodeURIComponent(related.title.slice(0,10))}`"
              :alt="related.title"
              class="w-full h-32 object-cover group-hover:opacity-95 transition-opacity"
            />
            <div class="p-3">
              <p class="text-xs font-medium text-gray-800 line-clamp-2 leading-snug mb-1">{{ related.title }}</p>
              <p class="text-[10px] text-gray-400">{{ related.author }}</p>
              <div class="mt-2">
                <span :class="[
                  'text-[10px] font-medium px-2 py-0.5 rounded-full',
                  related.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
                ]">
                  {{ related.stock > 0 ? `Còn ${related.stock}` : 'Hết' }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

    </template>

    <!-- Not found -->
    <div v-else class="card text-center py-16">
      <p class="text-gray-400 text-sm mb-3">Không tìm thấy sách</p>
      <RouterLink to="/" class="btn-primary inline-block">Quay lại danh sách</RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { bookApi } from '../../api/bookApi'
import { useAuthStore } from '../../stores/auth.store'
import { useCart } from '../../composables/useCart'
import { useToast } from 'vue-toastification'

const route   = useRoute()
const auth    = useAuthStore()
const toast   = useToast()
const { isInCart, addToCart } = useCart()

const book         = ref(null)
const relatedBooks = ref([])
const loading      = ref(true)
const activeTab    = ref('description')

const tabs = [
  { key: 'description', label: 'Mô tả sách' },
  { key: 'details',     label: 'Chi tiết sản phẩm' },
]

const fetchBook = async (id) => {
  loading.value  = true
  activeTab.value = 'description'
  try {
    const res  = await bookApi.getById(id)
    book.value = res.data.data

    // Lấy sách cùng thể loại (loại trừ cuốn đang xem)
    if (book.value.category?._id) {
      const relRes = await bookApi.getAll({
        category: book.value.category._id,
        limit: 5,
      })
      relatedBooks.value = relRes.data.data.books.filter(
        (b) => b._id !== book.value._id
      ).slice(0, 4)
    }
  } catch {
    book.value = null
  } finally {
    loading.value = false
  }
}

const handleAddCart = () => {
  const added = addToCart(book.value)
  if (added) toast.success(`Đã thêm "${book.value.title}" vào giỏ mượn`)
}

// Re-fetch khi chuyển sang sách liên quan
watch(() => route.params.id, (id) => { if (id) fetchBook(id) })
onMounted(() => fetchBook(route.params.id))
</script>