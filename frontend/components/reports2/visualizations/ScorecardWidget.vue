<template>
  <div class="grid grid-cols-1 gap-4">
    <div
      v-for="(row, index) in result.rows"
      :key="index"
      class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
    >
      <div class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
        {{ result.columns[0]?.label || 'Value' }}
      </div>
      <div class="text-4xl font-bold text-blue-900 dark:text-blue-100">
        {{ formatNumber(row[0]) }}
      </div>
      <div v-if="result.columns.length > 1 && row[1]" class="text-xs text-blue-700 dark:text-blue-300 mt-2">
        {{ result.columns[1].label }}: {{ formatNumber(row[1]) }}
      </div>
    </div>
    <div v-if="result.rows.length === 0" class="text-center py-8 text-gray-400">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetResult } from '~/types/reporting'

const props = defineProps<{
  result: WidgetResult
}>()

const formatNumber = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return String(value)
}
</script>
