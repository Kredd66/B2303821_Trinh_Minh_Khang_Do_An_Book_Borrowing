<template>
  <span :class="badgeClass" class="text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, required: true } })

const map = {
  pending:          { label: 'Chờ duyệt',       class: 'bg-amber-50  text-amber-800'  },
  approved:         { label: 'Đang mượn',        class: 'bg-blue-50   text-blue-800'   },
  partial_returned: { label: 'Trả một phần',     class: 'bg-indigo-50 text-indigo-700' },
  returned:         { label: 'Đã trả',           class: 'bg-green-50  text-green-800'  },
  overdue:          { label: 'Quá hạn',          class: 'bg-red-50    text-red-700'    },
  lost:             { label: 'Mất sách',         class: 'bg-gray-100  text-gray-700'   },
  // Item-level
  borrowing:        { label: 'Đang mượn',        class: 'bg-blue-50   text-blue-700'   },
}

const badgeClass = computed(() => map[props.status]?.class || 'bg-gray-100 text-gray-600')
const label      = computed(() => map[props.status]?.label  || props.status)
</script>