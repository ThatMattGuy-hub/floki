<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">Audit Logs</h1>
      <p class="text-gray-600 dark:text-gray-400">View and export system audit history</p>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Actor</label>
            <input
              v-model="filters.actor"
              type="text"
              class="input"
              placeholder="User email or ID"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Entity Type</label>
            <select v-model="filters.entity_type" class="input">
              <option value="">All</option>
              <option value="task">Task</option>
              <option value="project">Project</option>
              <option value="product">Product</option>
              <option value="user">User</option>
              <option value="status">Status</option>
              <option value="label">Label</option>
              <option value="automation">Automation</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">From Date</label>
            <input
              v-model="filters.from_date"
              type="date"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">To Date</label>
            <input
              v-model="filters.to_date"
              type="date"
              class="input"
            />
          </div>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <button @click="loadLogs" class="btn btn-primary">
            Apply Filters
          </button>
          <button @click="resetFilters" class="btn btn-secondary">
            Reset
          </button>
          <button @click="exportLogs" class="btn btn-secondary" :disabled="exporting">
            {{ exporting ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold">Audit History</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Entity Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Entity ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="px-6 py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </td>
            </tr>
            <tr v-else-if="auditLogs.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">
                No audit logs found
              </td>
            </tr>
            <tr
              v-else
              v-for="log in auditLogs"
              :key="log.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ log.actor_email || log.actor_id || 'System' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs rounded',
                  getActionColorClass(log.action)
                ]">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ log.entity_type || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ log.entity_id || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <div class="max-w-xs truncate" :title="log.details">
                  {{ log.details || '-' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pagination.totalPages > 1" class="p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
            {{ pagination.total }} entries
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="btn btn-secondary"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Page {{ pagination.page }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const auditLogs = ref<any[]>([])
const loading = ref(false)
const exporting = ref(false)

const filters = ref({
  actor: '',
  entity_type: '',
  from_date: '',
  to_date: ''
})

const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadLogs()
})

const loadLogs = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v))
    })
    
    const response = await apiFetch(`/audit-logs?${params}`)
    auditLogs.value = response.data || []
    pagination.value = {
      ...pagination.value,
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 1
    }
  } catch (error) {
    console.error('Failed to load audit logs:', error)
    auditLogs.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    actor: '',
    entity_type: '',
    from_date: '',
    to_date: ''
  }
  pagination.value.page = 1
  loadLogs()
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadLogs()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getActionColorClass = (action: string) => {
  if (action.includes('create')) return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
  if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
  if (action.includes('delete')) return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
  if (action.includes('read') || action.includes('view')) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
  return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
}

const exportLogs = async () => {
  exporting.value = true
  try {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v))
    )
    
    const response = await apiFetch(`/audit-logs/export?${params}`, {
      responseType: 'blob'
    })
    
    // Create download link
    const blob = new Blob([response], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export audit logs:', error)
    alert('Failed to export audit logs')
  } finally {
    exporting.value = false
  }
}
</script>

