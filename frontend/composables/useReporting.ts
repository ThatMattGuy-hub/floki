import { ref, watch, type Ref } from 'vue'
import type { ReportConfig, WidgetConfig, WidgetResult, DataField } from '~/types/reporting'
import { useApi } from '~/composables/useApi'

export const useReporting = () => {
  const { apiFetch } = useApi()

  const runWidgetQuery = async (widget: WidgetConfig): Promise<WidgetResult> => {
    try {
      const response = await apiFetch('/reports2/run-widget', {
        method: 'POST',
        body: widget
      })
      
      if (response.success) {
        return response.data
      }
      throw new Error(response.error || 'Failed to run widget query')
    } catch (error: any) {
      console.error('Widget query error:', error)
      throw error
    }
  }

  const getReport = async (id: string): Promise<ReportConfig> => {
    try {
      const response = await apiFetch(`/reports2/${id}`)
      if (response.success) {
        return response.data
      }
      throw new Error(response.error || 'Failed to load report')
    } catch (error: any) {
      console.error('Get report error:', error)
      throw error
    }
  }

  const saveReport = async (report: ReportConfig): Promise<ReportConfig> => {
    try {
      const url = report.id ? `/reports2/${report.id}` : '/reports2'
      const method = report.id ? 'PATCH' : 'POST'
      
      const response = await apiFetch(url, {
        method,
        body: report
      })
      
      if (response.success) {
        return response.data
      }
      throw new Error(response.error || 'Failed to save report')
    } catch (error: any) {
      console.error('Save report error:', error)
      throw error
    }
  }

  const getDataSourceFields = async (dataSourceId: string): Promise<DataField[]> => {
    try {
      const response = await apiFetch(`/reports2/data-sources/${dataSourceId}/fields`)
      if (response.success && response.data) {
        return response.data
      }
      return getFallbackFields(dataSourceId)
    } catch (error: any) {
      console.error('Get fields error:', error)
      // Return fallback fields for now
      return getFallbackFields(dataSourceId)
    }
  }

  return {
    runWidgetQuery,
    getReport,
    saveReport,
    getDataSourceFields
  }
}

// Composable for debounced widget queries
export const useWidgetQuery = (widget: Ref<WidgetConfig | null>, debounceMs = 400) => {
  const { runWidgetQuery } = useReporting()
  const data = ref<WidgetResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let timeoutId: NodeJS.Timeout | null = null

  watch(
    widget,
    (newWidget) => {
      if (!newWidget) {
        data.value = null
        return
      }

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Don't query if no dimensions or metrics configured
      if (newWidget.dimensions.length === 0 && newWidget.metrics.length === 0) {
        data.value = null
        return
      }

      timeoutId = setTimeout(async () => {
        try {
          loading.value = true
          error.value = null
          const result = await runWidgetQuery(newWidget)
          data.value = result
        } catch (err: any) {
          error.value = err.message || 'Failed to run query'
          data.value = null
        } finally {
          loading.value = false
        }
      }, debounceMs)
    },
    { deep: true }
  )

  return { data, loading, error }
}

// Fallback fields for development
function getFallbackFields(dataSourceId: string): DataField[] {
  const fieldMap: Record<string, DataField[]> = {
    tasks: [
      { id: 'tasks.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'tasks.title', label: 'Title', type: 'string', isMetric: false },
      { id: 'tasks.status', label: 'Status', type: 'enum', isMetric: false },
      { id: 'tasks.priority', label: 'Priority', type: 'enum', isMetric: false },
      { id: 'tasks.due_date', label: 'Due Date', type: 'date', isMetric: false },
      { id: 'tasks.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'tasks.estimated_hours', label: 'Estimated Hours', type: 'number', isMetric: true },
      { id: 'tasks.actual_hours', label: 'Actual Hours', type: 'number', isMetric: true },
      { id: 'tasks.count', label: 'Task Count', type: 'number', isMetric: true }
    ],
    projects: [
      { id: 'projects.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'projects.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'projects.start_date', label: 'Start Date', type: 'date', isMetric: false },
      { id: 'projects.end_date', label: 'End Date', type: 'date', isMetric: false },
      { id: 'projects.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'projects.count', label: 'Project Count', type: 'number', isMetric: true }
    ],
    products: [
      { id: 'products.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'products.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'products.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'products.count', label: 'Product Count', type: 'number', isMetric: true }
    ],
    agencies: [
      { id: 'agencies.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'agencies.name', label: 'Name', type: 'string', isMetric: false },
      { id: 'agencies.is_active', label: 'Is Active', type: 'enum', isMetric: false },
      { id: 'agencies.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'agencies.count', label: 'Agency Count', type: 'number', isMetric: true }
    ],
    users: [
      { id: 'users.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'users.email', label: 'Email', type: 'string', isMetric: false },
      { id: 'users.full_name', label: 'Full Name', type: 'string', isMetric: false },
      { id: 'users.role', label: 'Role', type: 'enum', isMetric: false },
      { id: 'users.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'users.count', label: 'User Count', type: 'number', isMetric: true }
    ],
    audit_logs: [
      { id: 'audit_logs.id', label: 'ID', type: 'string', isMetric: false },
      { id: 'audit_logs.action', label: 'Action', type: 'string', isMetric: false },
      { id: 'audit_logs.entity_type', label: 'Entity Type', type: 'string', isMetric: false },
      { id: 'audit_logs.created_at', label: 'Created At', type: 'date', isMetric: false },
      { id: 'audit_logs.count', label: 'Event Count', type: 'number', isMetric: true }
    ]
  }

  return fieldMap[dataSourceId] || []
}
