<template>
  <div>
    <!-- Hero Section -->
    <div style="background:#0C447C;" class="-mx-4 px-4 pt-8 pb-10 mb-0">
      <div class="max-w-7xl mx-auto">
        <p style="color:#85B7EB;" class="text-xs font-medium mb-1 tracking-wider uppercase">
          Thư viện Trường Đại học
        </p>
        <h1 class="text-white text-2xl font-medium mb-5 leading-snug">
          Khám phá kho sách<br>của thư viện
        </h1>
        <div class="flex gap-2 max-w-xl">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Tìm theo tên sách, tác giả..."
            class="flex-1 bg-white/95 border-0 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white/50"
          />
          <button @click="fetchData(1)" class="bg-[#378ADD] hover:bg-[#185FA5] text-white text-sm px-5 py-2.5 rounded-lg transition-colors font-medium">
            Tìm kiếm
          </button>
        </div>
        <!-- Stats -->
        <div class="flex gap-6 mt-6">
          <div>
            <div style="color:#fff;" class="text-lg font-medium">{{ bookStore.pagination.total }}+</div>
            <div style="color:#85B7EB;" class="text-xs mt-0.5">Đầu sách</div>
          </div>
          <div>
            <div style="color:#fff;" class="text-lg font-medium">{{ categories.length }}</div>
            <div style="color:#85B7EB;" class="text-xs mt-0.5">Thể loại</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white border-b border-gray-100 -mx-4 px-4 sticky top-14 z-40">
      <div class="max-w-7xl mx-auto">
        <div class="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-hide">
          <button
            @click="selectedCategory = ''; fetchData(1)"
            :class="[
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors',
              selectedCategory === ''
                ? 'bg-[#0C447C] text-white border-[#0C447C]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            ]"
          >Tất cả</button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            @click="selectedCategory = cat._id; fetchData(1)"
            :class="[
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors',
              selectedCategory === cat._id
                ? 'bg-[#0C447C] text-white border-[#0C447C]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            ]"
          >{{ cat.name }}</button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto pt-5">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-medium text-gray-700">
          {{ bookStore.pagination.total }} kết quả
        </p>
        <select v-model="sortBy" @change="fetchData(1)" class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none bg-white">
          <option value="-createdAt">Mới nhất</option>
          <option value="title">Tên A-Z</option>
          <option value="-stock">Còn nhiều nhất</option>
        </select>
      </div>

      <!-- Skeleton loading -->
      <div v-if="bookStore.loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <div v-for="i in 12" :key="i" class="rounded-xl overflow-hidden border border-gray-100">
          <div class="bg-gray-200 animate-pulse h-36"></div>
          <div class="p-3 space-y-2">
            <div class="bg-gray-200 animate-pulse h-3 rounded w-1/2"></div>
            <div class="bg-gray-200 animate-pulse h-3 rounded w-full"></div>
            <div class="bg-gray-200 animate-pulse h-3 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Books grid -->
      <template v-else>
        <div v-if="bookStore.books.length === 0" class="text-center py-20">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <p class="text-gray-400 text-sm">Không tìm thấy sách nào</p>
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <BookCard v-for="book in bookStore.books" :key="book._id" :book="book" />
        </div>

        <AppPagination
          v-if="bookStore.pagination.totalPages > 1"
          :current-page="bookStore.pagination.page"
          :total-pages="bookStore.pagination.totalPages"
          @change="fetchData"
          class="mt-8"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookStore } from '../../stores/book.store'
import { categoryApi } from '../../api/categoryApi'
import BookCard from '../../components/common/BookCard.vue'
import AppPagination from '../../components/common/AppPagination.vue'

const bookStore        = useBookStore()
const categories       = ref([])
const searchQuery      = ref('')
const selectedCategory = ref('')
const sortBy           = ref('-createdAt')
let debounceTimer      = null

const fetchData = (page = 1) => {
  bookStore.fetchBooks({
    page, limit: 12,
    search:   searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    sort:     sortBy.value,
  })
}

const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchData(1), 400)
}

onMounted(async () => {
  fetchData()
  const res = await categoryApi.getAll()
  categories.value = res.data.data
})
</script>