import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bookApi } from '../api/bookApi'

export const useBookStore = defineStore('book', () => {
  const books      = ref([])
  const pagination = ref({ total: 0, page: 1, totalPages: 1 })
  const loading    = ref(false)

  const fetchBooks = async (params = {}) => {
    loading.value = true
    try {
      const res = await bookApi.getAll(params)
      books.value      = res.data.data.books
      pagination.value = res.data.data.pagination
    } finally {
      loading.value = false
    }
  }

  return { books, pagination, loading, fetchBooks }
})