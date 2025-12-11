<template>
  <div class="relative inline-block">
    <button
      class="btn-secondary text-sm flex items-center gap-2"
      @click="open = !open"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add Chart
    </button>
    
    <div
      v-if="open"
      class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
    >
      <button
        v-for="type in widgetTypes"
        :key="type.type"
        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
        @click="selectType(type.type)"
      >
        <span class="mr-2">{{ type.icon }}</span>
        {{ type.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReportWidgetType } from '~/types/reporting'

const emit = defineEmits<{
  selectType: [type: ReportWidgetType]
}>()

const open = ref(false)

const widgetTypes = [
  { type: 'table' as ReportWidgetType, label: 'Table', icon: '📊' },
  { type: 'bar' as ReportWidgetType, label: 'Bar Chart', icon: '📊' },
  { type: 'line' as ReportWidgetType, label: 'Line Chart', icon: '📈' },
  { type: 'pie' as ReportWidgetType, label: 'Pie Chart', icon: '🥧' },
  { type: 'scorecard' as ReportWidgetType, label: 'Scorecard', icon: '🎯' }
]

const selectType = (type: ReportWidgetType) => {
  emit('selectType', type)
  open.value = false
}
</script>
