<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Teams</h3>
      <button @click="showAddTeam = !showAddTeam" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </div>

    <!-- Add Team -->
    <div v-if="showAddTeam" class="mb-3">
      <select
        v-model="selectedTeamId"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        @change="addTeam"
      >
        <option value="">Select team...</option>
        <option v-for="team in availableTeams" :key="team.id" :value="team.id">
          {{ team.name }}
        </option>
      </select>
    </div>

    <!-- Teams List -->
    <div v-if="loading && teams.length === 0" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="teams.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      No teams assigned
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="team in teams"
        :key="team.team?.id"
        class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-sm"
      >
        <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="font-medium">{{ team.team?.name }}</span>
        <button
          @click="removeTeam(team.team?.id)"
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
  taskTeams?: any[]
}>()

const emit = defineEmits(['updated'])

const { apiFetch } = useApi()

const teams = ref([])
const availableTeams = ref([])
const showAddTeam = ref(false)
const selectedTeamId = ref('')
const loading = ref(false)

const loadTeams = async () => {
  try {
    loading.value = true
    // Teams come from the task data, but we can also fetch them separately
    if (props.taskTeams) {
      teams.value = props.taskTeams
    } else {
      // Fallback: fetch from task detail
      const response = await apiFetch(`/tasks/${props.taskId}`)
      teams.value = response.data?.teams || []
    }
  } catch (error) {
    console.error('Failed to load teams:', error)
  } finally {
    loading.value = false
  }
}

const loadAvailableTeams = async () => {
  try {
    const response = await apiFetch('/teams')
    const allTeams = response.data || []
    // Filter out already assigned teams
    const assignedIds = teams.value.map((t: any) => t.team?.id)
    availableTeams.value = allTeams.filter((t: any) => !assignedIds.includes(t.id))
  } catch (error) {
    console.error('Failed to load available teams:', error)
  }
}

const addTeam = async () => {
  if (!selectedTeamId.value || loading.value) return

  try {
    loading.value = true
    // Get current teams from task
    const taskResponse = await apiFetch(`/tasks/${props.taskId}`)
    const currentTeams = taskResponse.data?.teams || []
    const currentTeamIds = currentTeams.map((t: any) => t.team?.id || t.id).filter(Boolean)
    
    // Check if team is already assigned
    if (currentTeamIds.includes(selectedTeamId.value)) {
      alert('This team is already assigned to the task')
      selectedTeamId.value = ''
      return
    }
    
    // Add new team
    const updatedTeams = [...currentTeamIds, selectedTeamId.value]
    
    const response = await apiFetch(`/tasks/${props.taskId}`, {
      method: 'PATCH',
      body: {
        teams: updatedTeams
      }
    })

    if (response.success) {
      emit('updated')
      selectedTeamId.value = ''
      showAddTeam.value = false
      await loadTeams()
      await loadAvailableTeams()
    } else {
      throw new Error(response.error || 'Failed to add team')
    }
  } catch (error: any) {
    console.error('Failed to add team:', error)
    const errorMessage = error.data?.error || error.message || 'Failed to add team to task'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const removeTeam = async (teamId: string) => {
  if (!confirm('Are you sure you want to remove this team from the task?')) return
  
  try {
    loading.value = true
    // Get current teams from task
    const taskResponse = await apiFetch(`/tasks/${props.taskId}`)
    const currentTeams = taskResponse.data?.teams || []
    const currentTeamIds = currentTeams.map((t: any) => t.team?.id || t.id).filter(Boolean)
    
    // Remove team
    const updatedTeams = currentTeamIds.filter((id: string) => id !== teamId)
    
    const response = await apiFetch(`/tasks/${props.taskId}`, {
      method: 'PATCH',
      body: {
        teams: updatedTeams
      }
    })

    if (response.success) {
      emit('updated')
      await loadTeams()
      await loadAvailableTeams()
    } else {
      throw new Error(response.error || 'Failed to remove team')
    }
  } catch (error: any) {
    console.error('Failed to remove team:', error)
    const errorMessage = error.data?.error || error.message || 'Failed to remove team from task'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

watch(showAddTeam, (newVal) => {
  if (newVal) {
    loadAvailableTeams()
  }
})

watch(() => props.taskTeams, (newVal) => {
  if (newVal) {
    teams.value = newVal
  }
}, { immediate: true, deep: true })

onMounted(() => {
  loadTeams()
})
</script>


