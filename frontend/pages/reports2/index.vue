<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Reports 2.0</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Build interactive reports with drag-and-drop dimensions and metrics
        </p>
      </div>
      <NuxtLink to="/reports2/new" class="btn-primary">
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Report
      </NuxtLink>
    </div>

    <!-- Legacy Reports Link -->
    <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Looking for the original reports?
          </div>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <NuxtLink to="/reports" class="underline hover:no-underline">
              Click here to access Reports 1.0
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Reports Grid -->
    <div v-else-if="reports.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="report in reports"
        :key="report.id"
        :to="`/reports2/${report.id}`"
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
        </div>
        
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{{ report.widgets?.length || 0 }} widgets</span>
          </div>
          <span>{{ formatDate(report.created_at) }}</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Reports Yet</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Create your first interactive report with drag-and-drop dimensions and metrics
      </p>
      <NuxtLink to="/reports2/new" class="btn-primary">
        Create Report
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ReportConfig } from '~/types/reporting'

definePageMeta({
  middleware: 'auth'
})

const { apiFetch } = useApi()

const loading = ref(true)
const reports = ref<ReportConfig[]>([])

const loadReports = async () => {
  try {
    loading.value = true
    const response = await apiFetch('/reports2')
    if (response.success) {
      reports.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load reports:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return ''
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
