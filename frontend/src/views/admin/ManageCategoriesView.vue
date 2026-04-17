<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-medium text-gray-900">Quản lý thể loại</h1>
        <p class="text-sm text-gray-500 mt-1">Thêm, sửa, xóa thông tin thể loại sách</p>
      </div>
      <button @click="openModal()" class="btn-primary flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Thêm thể loại
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-gray-500 w-1/4">Tên thể loại</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 w-1/4">Slug</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 w-auto">Mô tả</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-gray-500 w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="categories.length === 0">
              <td colspan="4" class="px-5 py-8 text-center text-gray-500">Chưa có thể loại nào.</td>
            </tr>
            <tr v-for="cat in categories" :key="cat._id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-5 py-3 font-medium text-gray-800">{{ cat.name }}</td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ cat.slug }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs truncate max-w-xs" :title="cat.description">
                {{ cat.description || '—' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2 justify-center">
                  <button @click="openModal(cat)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="handleDelete(cat._id)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4 backdrop-blur-sm"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden" @click.stop>
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-sm font-medium text-gray-900">{{ editItem ? 'Cập nhật thể loại' : 'Thêm thể loại mới' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSave" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Tên thể loại *</label>
            <input v-model="form.name" type="text" class="input-field" placeholder="Ví dụ: Khoa học viễn tưởng" required />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Mô tả</label>
            <textarea v-model="form.description" class="input-field resize-none h-24" placeholder="Mô tả nội dung (tùy chọn)"></textarea>
          </div>
          
          <div class="pt-2 flex gap-3">
            <button type="submit" :disabled="saving" class="btn-primary flex-1 !py-2 justify-center">
              {{ saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Tạo mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { categoryApi } from '../../api/categoryApi'
import { useToast } from 'vue-toastification'

const toast = useToast()
const categories = ref([])
const showModal = ref(false)
const saving = ref(false)
const editItem = ref(null)

const form = reactive({
  name: '',
  description: ''
})

const fetchCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res.data.data
  } catch (err) {
    toast.error('Lỗi khi lấy danh sách thể loại')
  }
}

const openModal = (cat = null) => {
  editItem.value = cat
  if (cat) {
    form.name = cat.name
    form.description = cat.description || ''
  } else {
    form.name = ''
    form.description = ''
  }
  showModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editItem.value) {
      await categoryApi.update(editItem.value._id, form)
      toast.success('Cập nhật thành công')
    } else {
      await categoryApi.create(form)
      toast.success('Thêm thể loại thành công')
    }
    showModal.value = false
    fetchCategories()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?\nThao tác này cũng xóa các sách thuộc thể loại do schema không bảo vệ.')) return
  try {
    await categoryApi.delete(id)
    toast.success('Đã xóa thể loại')
    fetchCategories()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi khi xóa thể loại')
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
