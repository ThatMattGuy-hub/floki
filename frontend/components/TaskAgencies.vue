<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Agencies</h3>
      <button @click="showAddAgency = !showAddAgency" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </div>

    <!-- Add Agency -->
    <div v-if="showAddAgency" class="mb-3">
      <select
        v-model="selectedAgencyId"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        @change="addAgency"
      >
        <option value="">Select agency...</option>
        <option v-for="agency in availableAgencies" :key="agency.id" :value="agency.id">
          {{ agency.name }}
        </option>
      </select>
    </div>

    <!-- Agencies List -->
    <div v-if="loading && agencies.length === 0" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="agencies.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      No agencies assigned
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="agency in agencies"
        :key="agency.agency?.id"
        class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-sm"
      >
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="font-medium">{{ agency.agency?.name }}</span>
        <button
          @click="removeAgency(agency.agency?.id)"
          class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
  taskAgencies?: any[]
}>()

const emit = defineEmits(['updated'])

const { apiFetch } = useApi()

const agencies = ref([])
const availableAgencies = ref([])
const showAddAgency = ref(false)
const selectedAgencyId = ref('')
const loading = ref(false)

const loadAgencies = async () => {
  try {
    loading.value = true
    // Agencies come from the task data, but we can also fetch them separately
    if (props.taskAgencies) {
      agencies.value = props.taskAgencies
    } else {
      // Fallback: fetch from task detail
      const response = await apiFetch(`/tasks/${props.taskId}`)
      agencies.value = response.data?.agencies || []
    }
  } catch (error) {
    console.error('Failed to load agencies:', error)
  } finally {
    loading.value = false
  }
}

const loadAvailableAgencies = async () => {
  try {
    const response = await apiFetch('/agencies')
    const allAgencies = response.data || []
    // Filter out already assigned agencies
    const assignedIds = agencies.value.map((a: any) => a.agency?.id)
    availableAgencies.value = allAgencies.filter((a: any) => !assignedIds.includes(a.id))
  } catch (error) {
    console.error('Failed to load available agencies:', error)
  }
}

const addAgency = async () => {
  if (!selectedAgencyId.value || loading.value) return

  try {
    loading.value = true
    // Get current agencies from task
    const taskResponse = await apiFetch(`/tasks/${props.taskId}`)
    const currentAgencies = taskResponse.data?.agencies || []
    const currentAgencyIds = currentAgencies.map((a: any) => a.agency?.id)
    
    // Add new agency
    const updatedAgencies = [...currentAgencyIds, selectedAgencyId.value]
    
    const response = await apiFetch(`/tasks/${props.taskId}`, {
      method: 'PATCH',
      body: {
        agencies: updatedAgencies
      }
    })

    if (response.success) {
      emit('updated')
      selectedAgencyId.value = ''
      showAddAgency.value = false
      await loadAgencies()
    }
  } catch (error) {
    console.error('Failed to add agency:', error)
    alert('Failed to add agency')
  } finally {
    loading.value = false
  }
}

const removeAgency = async (agencyId: string) => {
  try {
    // Get current agencies from task
    const taskResponse = await apiFetch(`/tasks/${props.taskId}`)
    const currentAgencies = taskResponse.data?.agencies || []
    const currentAgencyIds = currentAgencies.map((a: any) => a.agency?.id)
    
    // Remove agency
    const updatedAgencies = currentAgencyIds.filter((id: string) => id !== agencyId)
    
    const response = await apiFetch(`/tasks/${props.taskId}`, {
      method: 'PATCH',
      body: {
        agencies: updatedAgencies
      }
    })

    if (response.success) {
      emit('updated')
      await loadAgencies()
    }
  } catch (error) {
    console.error('Failed to remove agency:', error)
    alert('Failed to remove agency')
  }
}

watch(showAddAgency, (newVal) => {
  if (newVal) {
    loadAvailableAgencies()
  }
})

watch(() => props.taskAgencies, (newVal) => {
  if (newVal) {
    agencies.value = newVal
  }
}, { immediate: true, deep: true })

onMounted(() => {
  loadAgencies()
})
</script>

