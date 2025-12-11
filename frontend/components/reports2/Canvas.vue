<template>
  <div class="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-full">
    <!-- Empty state -->
    <div
      v-if="report.widgets.length === 0"
      class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800"
    >
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium mb-2">Add your first chart</h3>
      <p class="mb-4">Drag dimensions and metrics from the left, or click below to add a chart</p>
      <AddWidgetButton @select-type="handleAddWidget" />
    </div>

    <!-- Widgets grid -->
    <template v-else>
      <div class="flex justify-end">
        <AddWidgetButton @select-type="handleAddWidget" />
      </div>
      
      <div class="grid grid-cols-12 gap-4">
        <div
          v-for="widget in report.widgets"
          :key="widget.id"
          :class="`col-span-${widget.layout.colSpan || 6}`"
        >
          <WidgetCard
            :widget="widget"
            :selected="widget.id === selectedWidgetId"
            @select="$emit('selectWidget', widget.id)"
            @delete="handleDeleteWidget(widget.id)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReportConfig, WidgetConfig, ReportWidgetType } from '~/types/reporting'
import AddWidgetButton from './AddWidgetButton.vue'
import WidgetCard from './WidgetCard.vue'

const props = defineProps<{
  report: ReportConfig
  selectedWidgetId: string | null
}>()

const emit = defineEmits<{
  selectWidget: [id: string | null]
  widgetsChange: [widgets: WidgetConfig[]]
}>()

const handleAddWidget = (type: ReportWidgetType) => {
  const newWidget: WidgetConfig = {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: `New ${type} widget`,
    dataSourceId: 'tasks',
    dimensions: [],
    metrics: [],
    filters: [],
    sorts: [],
    layout: {
      row: props.report.widgets.length,
      col: 0,
      colSpan: 6
    }
  }
  
  const updatedWidgets = [...props.report.widgets, newWidget]
  emit('widgetsChange', updatedWidgets)
  emit('selectWidget', newWidget.id)
}

const handleDeleteWidget = (id: string) => {
  if (!confirm('Are you sure you want to delete this widget?')) return
  
  const updatedWidgets = props.report.widgets.filter(w => w.id !== id)
  emit('widgetsChange', updatedWidgets)
  
  if (props.selectedWidgetId === id) {
    emit('selectWidget', null)
  }
}
</script>
