<template>
  <div class="overflow-x-auto text-xs">
    <table v-if="result.rows.length > 0" class="min-w-full border border-gray-200 dark:border-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            v-for="column in result.columns"
            :key="column.id"
            class="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="(row, rowIndex) in result.rows"
          :key="rowIndex"
          class="hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
          >
            {{ formatCell(cell) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="text-center py-8 text-gray-400">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetResult } from '~/types/reporting'

const props = defineProps<{
  result: WidgetResult
}>()

const formatCell = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}
</script>
