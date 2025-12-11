<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Chart Configuration
      </div>
      <div class="flex mt-2 text-xs border-b border-gray-200 dark:border-gray-700">
        <button
          :class="[
            'px-3 py-1.5 mr-2 transition-colors',
            tab === 'data'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
          @click="tab = 'data'"
        >
          Data
        </button>
        <button
          :class="[
            'px-3 py-1.5 transition-colors',
            tab === 'style'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
          @click="tab = 'style'"
        >
          Style
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!widget" class="p-4 text-sm text-gray-400 dark:text-gray-500">
      Select a widget on the canvas to configure it.
    </div>
    
    <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
      <DataTab v-if="tab === 'data'" :widget="widget" @change="$emit('change', $event)" />
      <StyleTab v-else :widget="widget" @change="$emit('change', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WidgetConfig } from '~/types/reporting'
import DataTab from './config/DataTab.vue'
import StyleTab from './config/StyleTab.vue'

defineProps<{
  widget: WidgetConfig | null
}>()

defineEmits<{
  change: [widget: WidgetConfig]
}>()

const tab = ref<'data' | 'style'>('data')
</script>
