<template>
  <div>
    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        type="text"
        placeholder="Tìm theo tên sách, tác giả..."
        class="input-field flex-1"
      />
      <select v-model="selectedCategory" @change="fetchData(1)" class="input-field sm:w-48">
        <option value="">Tất cả thể loại</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="bookStore.loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div v-for="i in 12" :key="i" class="bg-gray-200 animate-pulse rounded-xl h-72"></div>
    </div>

    <!-- Books Grid -->
    <template v-else>
      <div v-if="bookStore.books.length === 0" class="text-center py-16 text-gray-400">
        Không tìm thấy sách nào
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <BookCard v-for="book in bookStore.books" :key="book._id" :book="book" />
      </div>

      <AppPagination
        v-if="bookStore.pagination.totalPages > 1"
        :current-page="bookStore.pagination.page"
        :total-pages="bookStore.pagination.totalPages"
        @change="fetchData"
      />
    </template>
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
let debounceTimer      = null

const fetchData = (page = 1) => {
  bookStore.fetchBooks({
    page,
    limit: 12,
    search:   searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
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