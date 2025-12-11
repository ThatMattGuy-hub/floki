<template>
  <div
    :draggable="true"
    class="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs cursor-grab active:cursor-grabbing transition-colors"
    :title="field.description || field.id"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <span class="text-[10px]">{{ icon }}</span>
    <span class="truncate flex-1 text-gray-900 dark:text-gray-100">{{ field.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DataField } from '~/types/reporting'

const props = defineProps<{
  field: DataField
}>()

const icon = computed(() => {
  switch (props.field.type) {
    case 'number':
      return '#'
    case 'date':
      return '📅'
    case 'enum':
      return '🏷️'
    case 'relation':
      return '🔗'
    default:
      return 'ABC'
  }
})

const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify(props.field))
    event.dataTransfer.setData('text/plain', props.field.id)
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Clean up if needed
}
</script>
