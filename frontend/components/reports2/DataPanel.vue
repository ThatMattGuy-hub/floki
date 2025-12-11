<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
        Data
      </h2>
    </div>

    <!-- Data Sources -->
    <div class="px-4 py-3 space-y-2 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="source in dataSources"
        :key="source.id"
        :class="[
          'w-full text-left text-sm px-3 py-2 rounded transition-colors',
          source.id === activeSourceId
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        ]"
        @click="activeSourceId = source.id"
      >
        {{ source.label }}
      </button>
    </div>

    <!-- Search -->
    <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <input
        v-model="search"
        class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        placeholder="Search fields…"
      />
    </div>

    <!-- Fields -->
    <div class="flex-1 overflow-y-auto p-3 space-y-4">
      <FieldGroup title="Dimensions" :fields="dimensions" />
      <FieldGroup title="Metrics" :fields="metrics" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataField, DataSource } from '~/types/reporting'
import { useReporting } from '~/composables/useReporting'
import FieldGroup from './FieldGroup.vue'

const props = defineProps<{
  selectedDataSourceId: string | null
}>()

const { getDataSourceFields } = useReporting()

const dataSources: DataSource[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'projects', label: 'Projects' },
  { id: 'products', label: 'Products' },
  { id: 'agencies', label: 'Agencies' },
  { id: 'users', label: 'Users' },
  { id: 'audit_logs', label: 'Audit Logs' }
]

const activeSourceId = ref<string>(props.selectedDataSourceId || 'tasks')
const search = ref('')
const fields = ref<DataField[]>([])

// Load fields when source changes
watch(activeSourceId, async (newSourceId) => {
  fields.value = await getDataSourceFields(newSourceId)
}, { immediate: true })

const filteredFields = computed(() => {
  if (!search.value) return fields.value
  const query = search.value.toLowerCase()
  return fields.value.filter(f => 
    f.label.toLowerCase().includes(query) || 
    f.id.toLowerCase().includes(query)
  )
})

const dimensions = computed(() => filteredFields.value.filter(f => !f.isMetric))
const metrics = computed(() => filteredFields.value.filter(f => f.isMetric))
</script>
