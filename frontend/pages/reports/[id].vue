<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/reports" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-block flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Reports
      </NuxtLink>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{{ report?.name || 'Loading...' }}</h1>
          <p v-if="report?.description" class="text-gray-600 dark:text-gray-400">{{ report.description }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="executeReport" :disabled="executing" class="btn-secondary">
            {{ executing ? 'Running...' : 'Run Report' }}
          </button>
          <button @click="exportReport('csv')" :disabled="!results" class="btn-secondary">
            Export CSV
          </button>
          <button v-if="canEdit" @click="editReport" class="btn-secondary">Edit</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- Report Results -->
    <div v-else-if="results && results.results" class="space-y-6">
      <div v-for="(result, index) in results.results" :key="index" class="card p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {{ getDataSourceLabel(result.data_source) }}
          <span v-if="result.visualization_type" class="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ getVisualizationLabel(result.visualization_type) }})
          </span>
        </h3>

        <!-- Error in query -->
        <div v-if="result.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {{ result.error }}
        </div>

        <!-- Table View -->
        <div v-else-if="!result.visualization_type || result.visualization_type === 'table'" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  v-for="column in getTableColumns(result.data)"
                  :key="column"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(row, rowIndex) in getTableRows(result.data)" :key="rowIndex">
                <td
                  v-for="column in getTableColumns(result.data)"
                  :key="column"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {{ formatCellValue(row[column]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- KPI Cards -->
        <div v-else-if="result.visualization_type === 'kpi' && result.data.aggregations" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="agg in result.data.aggregations"
            :key="agg.alias"
            class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6"
          >
            <div class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{{ agg.alias }}</div>
            <div class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ formatNumber(agg.value) }}</div>
          </div>
        </div>

        <!-- Bar Chart -->
        <div v-else-if="result.visualization_type === 'bar'" class="w-full">
          <ReportBarChart :data="result.data" :config="result.visualization_config" />
        </div>

        <!-- Line Chart -->
        <div v-else-if="result.visualization_type === 'line'" class="w-full">
          <ReportLineChart :data="result.data" :config="result.visualization_config" />
        </div>

        <!-- Pie Chart -->
        <div v-else-if="result.visualization_type === 'pie'" class="w-full">
          <ReportPieChart :data="result.data" :config="result.visualization_config" />
        </div>

        <!-- Stacked Bar Chart -->
        <div v-else-if="result.visualization_type === 'stacked_bar'" class="w-full">
          <ReportStackedBarChart :data="result.data" :config="result.visualization_config" />
        </div>

        <!-- Fallback for unknown visualization types -->
        <div v-else class="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
          Chart visualization for {{ result.visualization_type }} not available
          <div class="mt-4 text-sm">
            Data: {{ Array.isArray(result.data) ? result.data.length : (result.data?.raw_data?.length || 'N/A') }} rows
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Results Yet</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Click "Run Report" to execute this report</p>
      <button @click="executeReport" class="btn-primary">Run Report</button>
    </div>

    <!-- Edit Modal -->
    <ReportBuilderModal
      v-if="showEditModal"
      :show="showEditModal"
      :report="report"
      @close="showEditModal = false"
      @saved="handleReportSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import ReportBuilderModal from '~/components/ReportBuilderModal.vue'
import ReportBarChart from '~/components/reports/ReportBarChart.vue'
import ReportLineChart from '~/components/reports/ReportLineChart.vue'
import ReportPieChart from '~/components/reports/ReportPieChart.vue'
import ReportStackedBarChart from '~/components/reports/ReportStackedBarChart.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { apiFetch } = useApi()

const loading = ref(true)
const executing = ref(false)
const error = ref('')
const report = ref<any>(null)
const results = ref<any>(null)
const showEditModal = ref(false)

const canEdit = computed(() => {
  if (!report.value) return false
  const role = authStore.user?.role?.toLowerCase()
  return report.value.created_by === authStore.user?.id || ['owner', 'admin', 'manager'].includes(role)
})

const loadReport = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await apiFetch(`/reports/${route.params.id}`)
    if (response.success) {
      report.value = response.data
    } else {
      error.value = response.error || 'Failed to load report'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load report'
    console.error('Failed to load report:', err)
  } finally {
    loading.value = false
  }
}

const executeReport = async () => {
  try {
    executing.value = true
    error.value = ''
    const response = await apiFetch(`/reports/${route.params.id}/execute`, {
      method: 'POST'
    })
    if (response.success) {
      results.value = response.data
    } else {
      error.value = response.error || 'Failed to execute report'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to execute report'
    console.error('Failed to execute report:', err)
  } finally {
    executing.value = false
  }
}

const exportReport = async (format: string) => {
  if (!results.value) return

  try {
    // Simple CSV export for now
    if (format === 'csv') {
      const csv = convertToCSV(results.value.results)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.value?.name || 'report'}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  } catch (err: any) {
    console.error('Failed to export report:', err)
    alert('Failed to export report')
  }
}

const convertToCSV = (results: any[]): string => {
  if (!results || results.length === 0) return ''

  const lines: string[] = []
  results.forEach((result, index) => {
    if (result.error) return

    lines.push(`Query ${index + 1}: ${result.data_source}`)
    
    if (result.data.aggregations) {
      lines.push('Aggregations:')
      result.data.aggregations.forEach((agg: any) => {
        lines.push(`${agg.alias || agg.field},${agg.value}`)
      })
      lines.push('')
    }

    if (result.data.raw_data && result.data.raw_data.length > 0) {
      const headers = Object.keys(result.data.raw_data[0])
      lines.push(headers.join(','))
      result.data.raw_data.forEach((row: any) => {
        lines.push(headers.map(h => `"${row[h] || ''}"`).join(','))
      })
    } else if (Array.isArray(result.data) && result.data.length > 0) {
      const headers = Object.keys(result.data[0])
      lines.push(headers.join(','))
      result.data.forEach((row: any) => {
        lines.push(headers.map(h => `"${row[h] || ''}"`).join(','))
      })
    }
    lines.push('')
  })

  return lines.join('\n')
}

const getDataSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    tasks: 'Tasks',
    projects: 'Projects',
    products: 'Products',
    agencies: 'Agencies',
    users: 'Users',
    audit_logs: 'Audit Logs'
  }
  return labels[source] || source
}

const getVisualizationLabel = (type: string) => {
  const labels: Record<string, string> = {
    table: 'Table',
    bar: 'Bar Chart',
    line: 'Line Chart',
    pie: 'Pie Chart',
    stacked_bar: 'Stacked Bar Chart',
    kpi: 'KPI Cards'
  }
  return labels[type] || type
}

const getTableColumns = (data: any): string[] => {
  if (data?.raw_data && data.raw_data.length > 0) {
    return Object.keys(data.raw_data[0])
  }
  if (Array.isArray(data) && data.length > 0) {
    return Object.keys(data[0])
  }
  return []
}

const getTableRows = (data: any): any[] => {
  if (data?.raw_data) {
    return data.raw_data
  }
  if (Array.isArray(data)) {
    return data
  }
  return []
}

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const formatNumber = (value: number): string => {
  if (typeof value !== 'number') return String(value)
  return value.toLocaleString()
}

const editReport = () => {
  showEditModal.value = true
}

const handleReportSaved = () => {
  showEditModal.value = false
  loadReport()
}

onMounted(() => {
  loadReport()
})
</script>
