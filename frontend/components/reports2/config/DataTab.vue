<template>
  <div class="space-y-4 text-xs">
    <!-- Title -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Title</label>
      <input
        :value="widget.title"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @input="update({ title: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <!-- Data Source -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Data Source</label>
      <select
        :value="widget.dataSourceId"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @change="update({ dataSourceId: ($event.target as HTMLSelectElement).value })"
      >
        <option value="tasks">Tasks</option>
        <option value="projects">Projects</option>
        <option value="products">Products</option>
        <option value="agencies">Agencies</option>
        <option value="users">Users</option>
        <option value="audit_logs">Audit Logs</option>
      </select>
    </div>

    <!-- Dimensions Drop Zone -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">
        Dimensions
        <span class="text-gray-400 font-normal">(X-axis / Group by)</span>
      </label>
      <div
        class="min-h-[60px] border-2 border-dashed rounded px-2 py-2 transition-colors"
        :class="isDimensionDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
        @dragover.prevent="isDimensionDragOver = true"
        @dragleave="isDimensionDragOver = false"
        @drop="handleDimensionDrop"
      >
        <div v-if="widget.dimensions.length === 0" class="text-gray-400 dark:text-gray-500 text-center py-2">
          Drag a field here
        </div>
        <div v-else class="space-y-1">
          <div
            v-for="(dim, index) in widget.dimensions"
            :key="index"
            class="flex items-center justify-between py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded"
          >
            <span class="truncate text-gray-900 dark:text-gray-100">{{ dim.label || dim.fieldId }}</span>
            <button
              class="text-red-500 hover:text-red-600 ml-2"
              @click="removeDimension(index)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics Drop Zone -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">
        Metrics
        <span class="text-gray-400 font-normal">(Y-axis / Values)</span>
      </label>
      <div
        class="min-h-[60px] border-2 border-dashed rounded px-2 py-2 transition-colors"
        :class="isMetricDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
        @dragover.prevent="isMetricDragOver = true"
        @dragleave="isMetricDragOver = false"
        @drop="handleMetricDrop"
      >
        <div v-if="widget.metrics.length === 0" class="text-gray-400 dark:text-gray-500 text-center py-2">
          Drag a numeric field here
        </div>
        <div v-else class="space-y-1">
          <div
            v-for="(metric, index) in widget.metrics"
            :key="index"
            class="flex items-center justify-between gap-2 py-1 px-2 bg-gray-100 dark:bg-gray-700 rounded"
          >
            <span class="truncate flex-1 text-gray-900 dark:text-gray-100">
              {{ metric.label || metric.fieldId }}
            </span>
            <select
              :value="metric.aggregation"
              class="border rounded px-1 py-0.5 text-[11px] bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
              @change="updateMetricAggregation(index, ($event.target as HTMLSelectElement).value)"
            >
              <option value="sum">Sum</option>
              <option value="avg">Avg</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
              <option value="count">Count</option>
              <option value="count_distinct">Count Distinct</option>
            </select>
            <button
              class="text-red-500 hover:text-red-600"
              @click="removeMetric(index)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Filters</label>
      <div class="space-y-2">
        <div
          v-for="(filter, index) in widget.filters"
          :key="index"
          class="flex gap-1 items-center"
        >
          <input
            :value="filter.fieldId"
            class="flex-1 border rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            placeholder="field"
            @input="updateFilter(index, 'fieldId', ($event.target as HTMLInputElement).value)"
          />
          <select
            :value="filter.operator"
            class="border rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            @change="updateFilter(index, 'operator', ($event.target as HTMLSelectElement).value)"
          >
            <option value="equals">=</option>
            <option value="not_equals">!=</option>
            <option value="in">in</option>
            <option value="not_in">not in</option>
            <option value="greater_than">></option>
            <option value="less_than"><</option>
            <option value="contains">contains</option>
          </select>
          <input
            :value="filter.value"
            class="flex-1 border rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            placeholder="value"
            @input="updateFilter(index, 'value', ($event.target as HTMLInputElement).value)"
          />
          <button
            class="text-red-500 text-xs px-1"
            @click="removeFilter(index)"
          >
            ✕
          </button>
        </div>
        <button
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          @click="addFilter"
        >
          + Add filter
        </button>
      </div>
    </div>

    <!-- Row Limit -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Row Limit</label>
      <input
        type="number"
        min="1"
        :value="widget.limit || 100"
        class="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @input="update({ limit: Number(($event.target as HTMLInputElement).value) })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WidgetConfig, DimensionConfig, MetricConfig, FilterConfig, DataField, MetricAggregation } from '~/types/reporting'

const props = defineProps<{
  widget: WidgetConfig
}>()

const emit = defineEmits<{
  change: [widget: WidgetConfig]
}>()

const isDimensionDragOver = ref(false)
const isMetricDragOver = ref(false)

const update = (patch: Partial<WidgetConfig>) => {
  emit('change', { ...props.widget, ...patch })
}

const handleDimensionDrop = (event: DragEvent) => {
  event.preventDefault()
  isDimensionDragOver.value = false
  
  const data = event.dataTransfer?.getData('application/json')
  if (!data) return
  
  try {
    const field: DataField = JSON.parse(data)
    const newDimension: DimensionConfig = {
      fieldId: field.id,
      label: field.label
    }
    
    update({
      dimensions: [...props.widget.dimensions, newDimension]
    })
  } catch (error) {
    console.error('Failed to parse dropped field:', error)
  }
}

const handleMetricDrop = (event: DragEvent) => {
  event.preventDefault()
  isMetricDragOver.value = false
  
  const data = event.dataTransfer?.getData('application/json')
  if (!data) return
  
  try {
    const field: DataField = JSON.parse(data)
    const newMetric: MetricConfig = {
      fieldId: field.id,
      label: field.label,
      aggregation: field.type === 'number' ? 'sum' : 'count'
    }
    
    update({
      metrics: [...props.widget.metrics, newMetric]
    })
  } catch (error) {
    console.error('Failed to parse dropped field:', error)
  }
}

const removeDimension = (index: number) => {
  const dimensions = [...props.widget.dimensions]
  dimensions.splice(index, 1)
  update({ dimensions })
}

const removeMetric = (index: number) => {
  const metrics = [...props.widget.metrics]
  metrics.splice(index, 1)
  update({ metrics })
}

const updateMetricAggregation = (index: number, aggregation: string) => {
  const metrics = [...props.widget.metrics]
  metrics[index] = { ...metrics[index], aggregation: aggregation as MetricAggregation }
  update({ metrics })
}

const addFilter = () => {
  const filters = [...props.widget.filters, {
    fieldId: '',
    operator: 'equals' as const,
    value: ''
  }]
  update({ filters })
}

const removeFilter = (index: number) => {
  const filters = [...props.widget.filters]
  filters.splice(index, 1)
  update({ filters })
}

const updateFilter = (index: number, key: keyof FilterConfig, value: any) => {
  const filters = [...props.widget.filters]
  filters[index] = { ...filters[index], [key]: value }
  update({ filters })
}
</script>
