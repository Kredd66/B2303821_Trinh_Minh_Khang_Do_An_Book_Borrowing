<template>
  <span :class="badgeClass" class="text-xs font-medium px-2.5 py-0.5 rounded-full">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const map = {
  pending:  { label: 'Chờ duyệt',  class: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Đang mượn',  class: 'bg-blue-100 text-blue-700' },
  returned: { label: 'Đã trả',     class: 'bg-green-100 text-green-700' },
  overdue:  { label: 'Quá hạn',    class: 'bg-red-100 text-red-600' },
}

const badgeClass = computed(() => map[props.status]?.class || 'bg-gray-100 text-gray-600')
const label      = computed(() => map[props.status]?.label  || props.status)
</script>