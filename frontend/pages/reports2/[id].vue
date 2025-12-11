<template>
  <div class="flex flex-col h-screen">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/reports2"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {{ report?.name || 'Loading...' }}
          </h1>
          <p v-if="report?.description" class="text-sm text-gray-500 dark:text-gray-400">
            {{ report.description }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="btn-secondary"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-red-600 dark:text-red-400 mb-4">{{ error }}</div>
        <NuxtLink to="/reports2" class="btn-secondary">
          Back to Reports
        </NuxtLink>
      </div>
    </div>

    <!-- 3-panel layout -->
    <div v-else-if="report" class="flex flex-1 overflow-hidden">
      <!-- Left: Data Panel -->
      <div class="w-72 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <DataPanel :selected-data-source-id="selectedWidget?.dataSourceId || null" />
      </div>

      <!-- Center: Canvas -->
      <div class="flex-1 overflow-y-auto">
        <Canvas
          :report="report"
          :selected-widget-id="selectedWidgetId"
          @select-widget="selectedWidgetId = $event"
          @widgets-change="handleWidgetsChange"
        />
      </div>

      <!-- Right: Config Panel -->
      <div class="w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <WidgetConfigPanel
          :widget="selectedWidget"
          @change="handleWidgetChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ReportConfig, WidgetConfig } from '~/types/reporting'
import { useReporting } from '~/composables/useReporting'
import DataPanel from '~/components/reports2/DataPanel.vue'
import Canvas from '~/components/reports2/Canvas.vue'
import WidgetConfigPanel from '~/components/reports2/WidgetConfigPanel.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { getReport, saveReport } = useReporting()

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const report = ref<ReportConfig | null>(null)
const selectedWidgetId = ref<string | null>(null)

const selectedWidget = computed(() => {
  if (!report.value || !selectedWidgetId.value) return null
  return report.value.widgets.find(w => w.id === selectedWidgetId.value) || null
})

const loadReport = async () => {
  try {
    loading.value = true
    error.value = null
    
    const id = route.params.id as string
    
    // For new reports, create a default config
    if (id === 'new') {
      report.value = {
        id: '',
        name: 'Untitled Report',
        description: '',
        widgets: []
      }
      loading.value = false
      return
    }
    
    const data = await getReport(id)
    report.value = data
    
    // Select first widget if available
    if (data.widgets.length > 0) {
      selectedWidgetId.value = data.widgets[0].id
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load report'
    console.error('Load report error:', err)
  } finally {
    loading.value = false
  }
}

const handleWidgetsChange = (widgets: WidgetConfig[]) => {
  if (!report.value) return
  report.value = { ...report.value, widgets }
}

const handleWidgetChange = (updatedWidget: WidgetConfig) => {
  if (!report.value) return
  report.value = {
    ...report.value,
    widgets: report.value.widgets.map(w =>
      w.id === updatedWidget.id ? updatedWidget : w
    )
  }
}

const handleSave = async () => {
  if (!report.value) return
  
  try {
    saving.value = true
    const saved = await saveReport(report.value)
    report.value = saved
    
    // If this was a new report, redirect to the saved report
    if (route.params.id === 'new' && saved.id) {
      router.push(`/reports2/${saved.id}`)
    }
  } catch (err: any) {
    alert(err.message || 'Failed to save report')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>
