<template>
  <div class="flex items-center justify-center gap-2 mt-8">
    <button
      @click="$emit('change', currentPage - 1)"
      :disabled="currentPage <= 1"
      class="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
    >
      Trước
    </button>

    <template v-for="page in pages" :key="page">
      <button
        @click="$emit('change', page)"
        :class="[
          'py-1.5 px-3 rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="$emit('change', currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40"
    >
      Sau
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true },
})
defineEmits(['change'])

const pages = computed(() => {
  const range = []
  for (let i = 1; i <= props.totalPages; i++) range.push(i)
  return range
})
</script>