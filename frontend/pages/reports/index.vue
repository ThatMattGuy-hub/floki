<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Reports</h1>
        <p class="text-gray-600 dark:text-gray-400">Analyze project data and generate insights</p>
      </div>
      <button 
        v-if="canCreate"
        @click="showCreateModal = true" 
        class="btn-primary"
      >
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Report
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Reports Grid -->
    <div v-else-if="reports.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="report in reports"
        :key="report.id"
        @click="openReport(report.id)"
        class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
              {{ report.name }}
            </h3>
            <p v-if="report.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ report.description }}
            </p>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <span v-if="report.is_template" class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
              Template
            </span>
            <span v-if="report.is_shared" class="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
              Shared
            </span>
          </div>
        </div>
        
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              {{ report.creator?.full_name?.charAt(0) || report.creator?.email?.charAt(0) }}
            </div>
            <span>{{ report.creator?.full_name || report.creator?.email }}</span>
          </div>
          <span>{{ formatDate(report.created_at) }}</span>
        </div>

        <div v-if="report.created_by === authStore.user?.id" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            @click.stop="editReport(report)"
            class="flex-1 btn-secondary text-sm"
          >
            Edit
          </button>
          <button
            @click.stop="deleteReport(report.id)"
            class="flex-1 btn-danger text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Reports Yet</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Create your first report to start analyzing data</p>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">
        Create Report
      </button>
    </div>

    <!-- Create/Edit Report Modal -->
    <ReportBuilderModal
      v-if="showCreateModal || editingReport"
      :show="showCreateModal || !!editingReport"
      :report="editingReport"
      @close="closeModal"
      @saved="handleReportSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import ReportBuilderModal from '~/components/ReportBuilderModal.vue'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()
const { apiFetch } = useApi()

const loading = ref(true)
const reports = ref<any[]>([])
const showCreateModal = ref(false)
const editingReport = ref<any>(null)

const canCreate = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager', 'contributor'].includes(role)
})

const loadReports = async () => {
  try {
    loading.value = true
    const response = await apiFetch('/reports')
    if (response.success) {
      reports.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load reports:', error)
  } finally {
    loading.value = false
  }
}

const openReport = (reportId: string) => {
  router.push(`/reports/${reportId}`)
}

const editReport = (report: any) => {
  editingReport.value = report
}

const deleteReport = async (reportId: string) => {
  if (!confirm('Are you sure you want to delete this report?')) return

  try {
    const response = await apiFetch(`/reports/${reportId}`, { method: 'DELETE' })
    if (response.success) {
      await loadReports()
    } else {
      alert('Failed to delete report')
    }
  } catch (error: any) {
    console.error('Failed to delete report:', error)
    alert('Failed to delete report')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingReport.value = null
}

const handleReportSaved = () => {
  closeModal()
  loadReports()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadReports()
})
</script>