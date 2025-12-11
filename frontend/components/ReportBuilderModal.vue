<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {{ report ? 'Edit Report' : 'Create New Report' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Report Basic Info -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Report Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input w-full"
                placeholder="e.g., Task Status Overview"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="input w-full"
                placeholder="Describe what this report shows..."
              ></textarea>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input v-model="form.is_template" type="checkbox" class="rounded" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Save as Template</span>
              </label>
              <label class="flex items-center gap-2">
                <input v-model="form.is_shared" type="checkbox" class="rounded" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Share Report</span>
              </label>
            </div>
          </div>

          <!-- Report Queries -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Queries</h3>
              <button type="button" @click="addQuery" class="btn-secondary text-sm">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Query
              </button>
            </div>

            <div v-if="form.queries.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              No queries added yet. Click "Add Query" to get started.
            </div>

            <div v-for="(query, index) in form.queries" :key="index" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-gray-900 dark:text-gray-100">Query {{ index + 1 }}</h4>
                <button type="button" @click="removeQuery(index)" class="text-red-600 hover:text-red-700 dark:text-red-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <!-- Data Source -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Data Source *</label>
                <select v-model="query.data_source" required class="input w-full">
                  <option value="">Select data source...</option>
                  <option value="tasks">Tasks</option>
                  <option value="projects">Projects</option>
                  <option value="products">Products</option>
                  <option value="agencies">Agencies</option>
                  <option value="users">Users</option>
                  <option value="audit_logs">Audit Logs</option>
                </select>
              </div>

              <!-- Visualization Type -->
              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Visualization Type</label>
                <select v-model="query.visualization_type" class="input w-full">
                  <option value="">Table (default)</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="stacked_bar">Stacked Bar Chart</option>
                  <option value="kpi">KPI Card</option>
                </select>
              </div>

               <!-- Filters -->
               <div>
                 <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filters</label>
                 <div v-for="(filter, filterIndex) in query.query_config.filters || []" :key="filterIndex" class="flex gap-2 mb-2 items-center">
                   <select v-model="filter.field" class="input flex-[2] min-w-[150px]" placeholder="Field">
                     <option value="">Select field...</option>
                     <option
                       v-for="field in getAvailableFields(query.data_source)"
                       :key="field.value"
                       :value="field.value"
                     >
                       {{ field.label }}
                     </option>
                   </select>
                   <select v-model="filter.operator" class="input w-24 flex-shrink-0 text-sm">
                     <option value="equals">Equals</option>
                     <option value="not_equals">Not Equals</option>
                     <option value="contains">Contains</option>
                     <option value="greater_than">Greater Than</option>
                     <option value="less_than">Less Than</option>
                     <option value="in">In</option>
                   </select>
                   <input v-model="filter.value" type="text" class="input flex-[1.5] min-w-[100px]" placeholder="Value" />
                   <button type="button" @click="removeFilter(query, filterIndex)" class="text-red-600 hover:text-red-700 flex-shrink-0 p-2" title="Remove filter">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                <button type="button" @click="addFilter(query)" class="btn-secondary text-sm mt-2">
                  Add Filter
                </button>
              </div>

               <!-- Aggregations -->
               <div>
                 <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Aggregations</label>
                 <div v-for="(agg, aggIndex) in query.query_config.aggregations || []" :key="aggIndex" class="flex gap-2 mb-2 items-center">
                   <select v-model="agg.field" class="input flex-[2] min-w-[150px]" placeholder="Field">
                     <option value="">Select field...</option>
                     <option
                       v-for="field in getNumericFields(query.data_source)"
                       :key="field.value"
                       :value="field.value"
                     >
                       {{ field.label }}
                     </option>
                   </select>
                   <select v-model="agg.type" class="input w-24 flex-shrink-0 text-sm">
                     <option value="sum">Sum</option>
                     <option value="avg">Average</option>
                     <option value="count">Count</option>
                     <option value="min">Min</option>
                     <option value="max">Max</option>
                   </select>
                   <input v-model="agg.alias" type="text" class="input flex-[1.5] min-w-[100px]" placeholder="Alias (optional)" />
                   <button type="button" @click="removeAggregation(query, aggIndex)" class="text-red-600 hover:text-red-700 flex-shrink-0 p-2" title="Remove aggregation">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                <button type="button" @click="addAggregation(query)" class="btn-secondary text-sm mt-2">
                  Add Aggregation
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button type="button" @click="$emit('close')" class="btn-secondary">
          Cancel
        </button>
        <button @click="handleSubmit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Saving...' : (report ? 'Update Report' : 'Create Report') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps<{
  show: boolean
  report?: any
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { apiFetch } = useApi()
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  is_template: false,
  is_shared: false,
  queries: [] as any[]
})

watch(() => props.report, (newReport) => {
  if (newReport) {
    form.value = {
      name: newReport.name || '',
      description: newReport.description || '',
      is_template: newReport.is_template || false,
      is_shared: newReport.is_shared || false,
      queries: newReport.queries || []
    }
  } else {
    form.value = {
      name: '',
      description: '',
      is_template: false,
      is_shared: false,
      queries: []
    }
  }
}, { immediate: true })

const addQuery = () => {
  form.value.queries.push({
    data_source: '',
    visualization_type: '',
    query_config: {
      filters: [],
      aggregations: [],
      orderBy: []
    },
    visualization_config: {}
  })
}

const removeQuery = (index: number) => {
  form.value.queries.splice(index, 1)
}

const addFilter = (query: any) => {
  if (!query.query_config.filters) {
    query.query_config.filters = []
  }
  query.query_config.filters.push({
    field: '',
    operator: 'equals',
    value: ''
  })
}

const removeFilter = (query: any, index: number) => {
  query.query_config.filters.splice(index, 1)
}

const addAggregation = (query: any) => {
  if (!query.query_config.aggregations) {
    query.query_config.aggregations = []
  }
  query.query_config.aggregations.push({
    field: '',
    type: 'count',
    alias: ''
  })
}

const removeAggregation = (query: any, index: number) => {
  query.query_config.aggregations.splice(index, 1)
}

// Get available fields for a data source
const getAvailableFields = (dataSource: string): Array<{ value: string; label: string }> => {
  const fieldMap: Record<string, Array<{ value: string; label: string }>> = {
    tasks: [
      { value: 'id', label: 'ID' },
      { value: 'title', label: 'Title' },
      { value: 'description', label: 'Description' },
      { value: 'project_id', label: 'Project ID' },
      { value: 'product_id', label: 'Product ID' },
      { value: 'assignee_id', label: 'Assignee ID' },
      { value: 'status_id', label: 'Status ID' },
      { value: 'priority', label: 'Priority' },
      { value: 'due_date', label: 'Due Date' },
      { value: 'sla_deadline', label: 'SLA Deadline' },
      { value: 'estimated_hours', label: 'Estimated Hours' },
      { value: 'actual_hours', label: 'Actual Hours' },
      { value: 'is_archived', label: 'Is Archived' },
      { value: 'created_by', label: 'Created By' },
      { value: 'created_at', label: 'Created At' },
      { value: 'updated_at', label: 'Updated At' }
    ],
    projects: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'product_id', label: 'Product ID' },
      { value: 'owner_id', label: 'Owner ID' },
      { value: 'start_date', label: 'Start Date' },
      { value: 'end_date', label: 'End Date' },
      { value: 'is_archived', label: 'Is Archived' },
      { value: 'created_at', label: 'Created At' },
      { value: 'updated_at', label: 'Updated At' }
    ],
    products: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'owner_id', label: 'Owner ID' },
      { value: 'is_archived', label: 'Is Archived' },
      { value: 'created_at', label: 'Created At' },
      { value: 'updated_at', label: 'Updated At' }
    ],
    agencies: [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'description', label: 'Description' },
      { value: 'contact_email', label: 'Contact Email' },
      { value: 'is_active', label: 'Is Active' },
      { value: 'created_at', label: 'Created At' },
      { value: 'updated_at', label: 'Updated At' }
    ],
    users: [
      { value: 'id', label: 'ID' },
      { value: 'email', label: 'Email' },
      { value: 'full_name', label: 'Full Name' },
      { value: 'role', label: 'Role' },
      { value: 'avatar_url', label: 'Avatar URL' },
      { value: 'is_active', label: 'Is Active' },
      { value: 'created_at', label: 'Created At' },
      { value: 'updated_at', label: 'Updated At' }
    ],
    audit_logs: [
      { value: 'id', label: 'ID' },
      { value: 'user_id', label: 'User ID' },
      { value: 'action', label: 'Action' },
      { value: 'entity_type', label: 'Entity Type' },
      { value: 'entity_id', label: 'Entity ID' },
      { value: 'metadata', label: 'Metadata' },
      { value: 'created_at', label: 'Created At' }
    ]
  }

  return fieldMap[dataSource] || []
}

// Get numeric fields for aggregations
const getNumericFields = (dataSource: string): Array<{ value: string; label: string }> => {
  const numericFields: Record<string, Array<{ value: string; label: string }>> = {
    tasks: [
      { value: 'priority', label: 'Priority' },
      { value: 'estimated_hours', label: 'Estimated Hours' },
      { value: 'actual_hours', label: 'Actual Hours' }
    ],
    projects: [],
    products: [],
    agencies: [],
    users: [],
    audit_logs: []
  }

  // Also include count aggregations for any field
  const allFields = getAvailableFields(dataSource)
  return [
    ...numericFields[dataSource] || [],
    ...allFields.map(f => ({ value: f.value, label: `Count(${f.label})` }))
  ]
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    alert('Report name is required')
    return
  }

  saving.value = true
  try {
    const url = props.report ? `/reports/${props.report.id}` : '/reports'
    const method = props.report ? 'PATCH' : 'POST'

    const response = await apiFetch(url, {
      method,
      body: form.value
    })

    if (response.success) {
      emit('saved')
    } else {
      alert(response.error || 'Failed to save report')
    }
  } catch (error: any) {
    console.error('Failed to save report:', error)
    alert('Failed to save report')
  } finally {
    saving.value = false
  }
}
</script>
