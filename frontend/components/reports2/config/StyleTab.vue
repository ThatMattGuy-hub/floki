<template>
  <div class="space-y-4 text-xs">
    <!-- Show Legend -->
    <div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          :checked="style.showLegend ?? true"
          class="rounded"
          @change="updateStyle({ showLegend: ($event.target as HTMLInputElement).checked })"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">Show Legend</span>
      </label>
    </div>

    <!-- Legend Position -->
    <div v-if="style.showLegend !== false">
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Legend Position</label>
      <select
        :value="style.legendPosition || 'top'"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @change="updateStyle({ legendPosition: ($event.target as HTMLSelectElement).value as any })"
      >
        <option value="top">Top</option>
        <option value="right">Right</option>
        <option value="bottom">Bottom</option>
        <option value="left">Left</option>
      </select>
    </div>

    <!-- Color Scheme -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">Color Palette</label>
      <select
        :value="style.colorScheme || 'default'"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @change="updateStyle({ colorScheme: ($event.target as HTMLSelectElement).value })"
      >
        <option value="default">Default</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="warm">Warm</option>
        <option value="cool">Cool</option>
      </select>
    </div>

    <!-- Column Span -->
    <div>
      <label class="block mb-1 font-medium text-gray-700 dark:text-gray-300">
        Widget Width
        <span class="text-gray-400 font-normal">(Grid columns)</span>
      </label>
      <select
        :value="widget.layout.colSpan"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        @change="updateLayout({ colSpan: Number(($event.target as HTMLSelectElement).value) })"
      >
        <option :value="3">Quarter (3 cols)</option>
        <option :value="4">Third (4 cols)</option>
        <option :value="6">Half (6 cols)</option>
        <option :value="8">Two-thirds (8 cols)</option>
        <option :value="12">Full (12 cols)</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WidgetConfig, WidgetStyle, WidgetLayout } from '~/types/reporting'

const props = defineProps<{
  widget: WidgetConfig
}>()

const emit = defineEmits<{
  change: [widget: WidgetConfig]
}>()

const style = computed(() => props.widget.style || {})

const updateStyle = (patch: Partial<WidgetStyle>) => {
  emit('change', {
    ...props.widget,
    style: { ...style.value, ...patch }
  })
}

const updateLayout = (patch: Partial<WidgetLayout>) => {
  emit('change', {
    ...props.widget,
    layout: { ...props.widget.layout, ...patch }
  })
}
</script>
