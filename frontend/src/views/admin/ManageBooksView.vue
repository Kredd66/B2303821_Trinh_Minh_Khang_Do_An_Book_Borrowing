<template>
  <div class="max-w-5xl mx-auto">

    <!-- Stats bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="bg-white rounded-xl border border-gray-100 p-4">
        <p class="text-xs text-gray-500 mb-1">Tổng đầu sách</p>
        <p class="text-2xl font-medium text-gray-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4">
        <p class="text-xs text-gray-500 mb-1">Đang được mượn</p>
        <p class="text-2xl font-medium" style="color:#185FA5">{{ stats.borrowed }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4">
        <p class="text-xs text-gray-500 mb-1">Chờ duyệt</p>
        <p class="text-2xl font-medium text-amber-600">{{ stats.pending }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4">
        <p class="text-xs text-gray-500 mb-1">Quá hạn</p>
        <p class="text-2xl font-medium text-red-600">{{ stats.overdue }}</p>
      </div>
    </div>

    <!-- Table card -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <!-- Table header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 class="text-sm font-medium text-gray-900">
          Danh sách sách
          <span class="text-gray-400 font-normal ml-1">({{ pagination.total }})</span>
        </h2>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" v-model="showHidden" @change="fetchData(1)" class="rounded text-blue-600 border-gray-300 focus:ring-blue-500">
            Hiện sách đã ẩn
          </label>
          <button @click="openModal()" class="btn-primary !py-1.5 !px-3 !text-xs">
            + Thêm sách
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-gray-500">Sách</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500">Thể loại</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-gray-500">Tồn kho</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="book in books"
              :key="book._id"
              class="hover:bg-gray-50/50 transition-colors"
              :class="!book.isActive ? 'bg-gray-50 opacity-75' : ''"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="book.coverImage || `https://placehold.co/40x56/E6F1FB/378ADD?text=?`"
                    class="w-8 h-11 object-cover rounded flex-shrink-0 border border-gray-100"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate max-w-xs">
                      {{ book.title }}
                      <span v-if="!book.isActive" class="ml-1 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Đã ẩn</span>
                    </p>
                    <p class="text-xs text-gray-400 truncate">{{ book.author }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500">{{ book.category?.name }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="book.stock > 0 ? 'text-green-600' : 'text-red-500'" class="font-medium text-sm">
                  {{ book.stock }}
                </span>
                <span class="text-gray-300 text-xs"> / {{ book.totalCopies }}</span>
              </td>
              <td class="px-4 py-3">
                <div v-if="book.isActive" class="flex gap-1.5 justify-center">
                  <button
                    @click="openModal(book)"
                    class="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >Sửa</button>
                  <button
                    @click="handleDelete(book._id)"
                    class="text-xs px-3 py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >Ẩn</button>
                </div>
                <div v-else class="flex justify-center">
                  <button
                    @click="handleRestore(book._id)"
                    class="text-xs px-3 py-1.5 border border-green-100 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                  >Hiển thị lại</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination inside card -->
      <div class="px-5 py-3 border-t border-gray-50">
        <AppPagination
          v-if="pagination.totalPages > 1"
          :current-page="pagination.page"
          :total-pages="pagination.totalPages"
          @change="fetchData"
        />
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      style="position:fixed;inset:0;z-index:50;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;padding:16px"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-base font-medium text-gray-900">
            {{ editBook ? 'Cập nhật sách' : 'Thêm sách mới' }}
          </h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSave" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Tên sách *</label>
              <input v-model="form.title" class="input-field" placeholder="Nhập tên sách" required />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Tác giả *</label>
              <input v-model="form.author" class="input-field" placeholder="Tên tác giả" required />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Thể loại *</label>
              <select v-model="form.category" class="input-field" required>
                <option value="">-- Chọn thể loại --</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Tổng số bản *</label>
              <input v-model.number="form.totalCopies" type="number" min="0" class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Tồn kho *</label>
              <input v-model.number="form.stock" type="number" min="0" class="input-field" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">ISBN</label>
              <input v-model="form.isbn" class="input-field" placeholder="978-..." />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">URL ảnh bìa</label>
              <input v-model="form.coverImage" class="input-field" placeholder="https://..." />
              <img
                v-if="form.coverImage"
                :src="form.coverImage"
                class="mt-2 w-16 h-20 object-cover rounded border border-gray-100"
                @error="form.coverImage = ''"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Mô tả</label>
              <textarea v-model="form.description" class="input-field resize-none" rows="3" placeholder="Mô tả ngắn..."></textarea>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1 !py-2.5">
              {{ saving ? 'Đang lưu...' : (editBook ? 'Cập nhật' : 'Thêm sách') }}
            </button>
            <button type="button" @click="showModal = false" class="btn-secondary flex-1 !py-2.5">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { bookApi } from '../../api/bookApi'
import { borrowApi } from '../../api/borrowApi'
import { categoryApi } from '../../api/categoryApi'
import { useToast } from 'vue-toastification'
import AppPagination from '../../components/common/AppPagination.vue'

const toast      = useToast()
const books      = ref([])
const categories = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const showHidden = ref(false)
const showModal  = ref(false)
const saving     = ref(false)
const editBook   = ref(null)

const stats = reactive({ total: 0, borrowed: 0, pending: 0, overdue: 0 })

const form = reactive({
  title: '', author: '', category: '', isbn: '',
  coverImage: '', description: '', stock: 0, totalCopies: 0,
})

const fetchData = async (page = 1) => {
  const params = { page, limit: 15 }
  if (showHidden.value) params.showHidden = true
  
  const res = await bookApi.getAll(params)
  books.value      = res.data.data.books
  pagination.value = res.data.data.pagination
  stats.total      = res.data.data.pagination.total
}

const fetchStats = async () => {
  const [borrowed, pending, overdue] = await Promise.all([
    borrowApi.getAll({ status: 'approved', limit: 1 }),
    borrowApi.getAll({ status: 'pending',  limit: 1 }),
    borrowApi.getAll({ status: 'overdue',  limit: 1 }),
  ])
  stats.borrowed = borrowed.data.data.pagination.total
  stats.pending  = pending.data.data.pagination.total
  stats.overdue  = overdue.data.data.pagination.total
}

const openModal = (book = null) => {
  editBook.value = book
  if (book) {
    Object.assign(form, {
      title: book.title, author: book.author,
      category: book.category?._id || book.category,
      isbn: book.isbn || '', coverImage: book.coverImage || '',
      description: book.description || '',
      stock: book.stock, totalCopies: book.totalCopies,
    })
  } else {
    Object.assign(form, {
      title: '', author: '', category: '', isbn: '',
      coverImage: '', description: '', stock: 0, totalCopies: 0,
    })
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

const handleRestore = async (id) => {
  if (!confirm('Khôi phục hiển thị sách này?')) return
  try {
    await bookApi.restore(id)
    toast.success('Đã hiển thị lại sách')
    fetchData(pagination.value.page)
  } catch {
    toast.error('Không thể khôi phục sách')
  }
}

onMounted(() => {
  fetchData()
  fetchStats()
  categoryApi.getAll().then((res) => { categories.value = res.data.data })
})
</script>