<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Quản lý sách</h1>
      <button @click="openModal()" class="btn-primary">+ Thêm sách</button>
    </div>

    <!-- Table -->
    <div class="card overflow-x-auto p-0">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Sách</th>
            <th class="text-left px-4 py-3 text-gray-600 font-medium">Thể loại</th>
            <th class="text-center px-4 py-3 text-gray-600 font-medium">Tồn kho</th>
            <th class="text-center px-4 py-3 text-gray-600 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="book in books" :key="book._id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="book.coverImage || 'https://placehold.co/40x55?text=?'"
                  class="w-8 h-11 object-cover rounded" />
                <div>
                  <p class="font-medium text-gray-800 line-clamp-1">{{ book.title }}</p>
                  <p class="text-gray-400 text-xs">{{ book.author }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ book.category?.name }}</td>
            <td class="px-4 py-3 text-center">
              <span :class="[
                'font-semibold',
                book.stock > 0 ? 'text-green-600' : 'text-red-500'
              ]">{{ book.stock }}</span>
              <span class="text-gray-400"> / {{ book.totalCopies }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2 justify-center">
                <button @click="openModal(book)" class="text-xs btn-secondary py-1 px-2">Sửa</button>
                <button @click="handleDelete(book._id)" class="text-xs btn-danger py-1 px-2">Ẩn</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppPagination
      v-if="pagination.totalPages > 1"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      @change="fetchData"
    />

    <!-- Modal Thêm/Sửa -->
    <div v-if="showModal"
      style="min-height:100vh;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"
      class="fixed inset-0 z-50"
      @click.self="showModal = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-gray-800 mb-4">
          {{ editBook ? 'Cập nhật sách' : 'Thêm sách mới' }}
        </h2>
        <form @submit.prevent="handleSave" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Tên sách *</label>
            <input v-model="form.title" class="input-field" placeholder="Nhập tên sách" required />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Tác giả *</label>
            <input v-model="form.author" class="input-field" placeholder="Tên tác giả" required />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Thể loại *</label>
            <select v-model="form.category" class="input-field" required>
              <option value="">-- Chọn thể loại --</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Tổng số bản</label>
              <input v-model.number="form.totalCopies" type="number" min="0" class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Tồn kho</label>
              <input v-model.number="form.stock" type="number" min="0" class="input-field" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">ISBN</label>
            <input v-model="form.isbn" class="input-field" placeholder="978-..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">URL ảnh bìa</label>
            <input v-model="form.coverImage" class="input-field" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
            <textarea v-model="form.description" class="input-field" rows="3" placeholder="Mô tả ngắn về sách..."></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              {{ saving ? 'Đang lưu...' : (editBook ? 'Cập nhật' : 'Thêm sách') }}
            </button>
            <button type="button" @click="showModal = false" class="btn-secondary flex-1">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { bookApi } from '../../api/bookApi'
import { categoryApi } from '../../api/categoryApi'
import { useToast } from 'vue-toastification'
import AppPagination from '../../components/common/AppPagination.vue'

const toast      = useToast()
const books      = ref([])
const categories = ref([])
const pagination = ref({ page: 1, totalPages: 1 })
const showModal  = ref(false)
const saving     = ref(false)
const editBook   = ref(null)

const form = reactive({
  title: '', author: '', category: '', isbn: '',
  coverImage: '', description: '', stock: 0, totalCopies: 0,
})

const fetchData = async (page = 1) => {
  const res = await bookApi.getAll({ page, limit: 15 })
  books.value      = res.data.data.books
  pagination.value = res.data.data.pagination
}

const openModal = (book = null) => {
  editBook.value = book
  if (book) {
    Object.assign(form, {
      title: book.title, author: book.author,
      category: book.category?._id || book.category,
      isbn: book.isbn, coverImage: book.coverImage,
      description: book.description,
      stock: book.stock, totalCopies: book.totalCopies,
    })
  } else {
    Object.assign(form, { title: '', author: '', category: '', isbn: '', coverImage: '', description: '', stock: 0, totalCopies: 0 })
  }
  showModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editBook.value) {
      await bookApi.update(editBook.value._id, form)
      toast.success('Cập nhật sách thành công!')
    } else {
      await bookApi.create(form)
      toast.success('Thêm sách thành công!')
    }
    showModal.value = false
    fetchData(pagination.value.page)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi khi lưu sách')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Ẩn sách này khỏi danh sách?')) return
  try {
    await bookApi.delete(id)
    toast.success('Đã ẩn sách')
    fetchData(pagination.value.page)
  } catch {
    toast.error('Không thể ẩn sách')
  }
}

onMounted(async () => {
  fetchData()
  const res = await categoryApi.getAll()
  categories.value = res.data.data
})
</script>