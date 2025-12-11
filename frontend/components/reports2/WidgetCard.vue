<template>
  <div
    :class="[
      'border rounded-lg shadow-sm bg-white dark:bg-gray-800 cursor-pointer transition-all',
      selected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:shadow-md'
    ]"
    @click="$emit('select')"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      <div class="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
        {{ widget.title }}
      </div>
      <button
        class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-2 py-1"
        @click.stop="$emit('delete')"
      >
        Delete
      </button>
    </div>

    <!-- Content -->
    <div class="p-3">
      <!-- Loading state -->
      <div v-if="loading" class="animate-pulse h-32 bg-gray-100 dark:bg-gray-700 rounded" />
      
      <!-- Error state -->
      <div v-else-if="error" class="text-xs text-red-500 dark:text-red-400 p-4 text-center">
        {{ error }}
      </div>
      
      <!-- Empty state -->
      <div
        v-else-if="!widget.dimensions.length && !widget.metrics.length"
        class="text-sm text-gray-400 dark:text-gray-500 text-center py-8"
      >
        Drag dimensions and metrics from the left to get started.
      </div>
      
      <!-- Visualization -->
      <component
        v-else-if="data"
        :is="visualizationComponent"
        :result="data"
        :config="widget"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { WidgetConfig } from '~/types/reporting'
import { useWidgetQuery } from '~/composables/useReporting'
import TableWidget from './visualizations/TableWidget.vue'
import BarChartWidget from './visualizations/BarChartWidget.vue'
import LineChartWidget from './visualizations/LineChartWidget.vue'
import PieChartWidget from './visualizations/PieChartWidget.vue'
import ScorecardWidget from './visualizations/ScorecardWidget.vue'

const props = defineProps<{
  widget: WidgetConfig
  selected: boolean
}>()

defineEmits<{
  select: []
  delete: []
}>()

const widgetRef = toRef(props, 'widget')
const { data, loading, error } = useWidgetQuery(widgetRef)

const visualizationComponent = computed(() => {
  switch (props.widget.type) {
    case 'bar':
      return BarChartWidget
    case 'line':
      return LineChartWidget
    case 'pie':
      return PieChartWidget
    case 'scorecard':
      return ScorecardWidget
    case 'table':
    default:
      return TableWidget
  }
})
</script>
