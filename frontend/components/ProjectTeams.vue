<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Teams</h3>
      <button @click="showPicker = !showPicker" class="text-blue-600 hover:text-blue-700 text-sm">
        {{ showPicker ? 'Done' : 'Edit' }}
      </button>
    </div>

    <!-- Current Teams -->
    <div v-if="currentTeams.length > 0" class="flex flex-wrap gap-1">
      <span
        v-for="pt in currentTeams"
        :key="pt.id"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        :class="pt.team?.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'"
      >
        {{ pt.team?.name }}
        <button v-if="showPicker" @click="removeTeam(pt.team?.id)" class="ml-1 hover:opacity-70">×</button>
      </span>
    </div>
    <div v-else class="text-sm text-gray-400">No teams assigned</div>

    <!-- Team Picker -->
    <div v-if="showPicker" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="text-xs text-gray-500 mb-2">Click to add:</div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="team in availableTeams"
          :key="team.id"
          @click="addTeam(team.id)"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
          :class="team.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'"
        >
          + {{ team.name }}
        </button>
      </div>
      <div v-if="availableTeams.length === 0" class="text-xs text-gray-400">
        All teams added or <NuxtLink to="/admin/agencies" class="text-blue-600">manage teams</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: string
}>()

const emit = defineEmits(['updated'])

const { apiFetch } = useApi()

const allTeams = ref<any[]>([])
const currentTeams = ref<any[]>([])
const showPicker = ref(false)
const loading = ref(true)

const availableTeams = computed(() => {
  const currentIds = currentTeams.value.map(pt => pt.team?.id || pt.team_id)
  return allTeams.value.filter(t => !currentIds.includes(t.id))
})

const loadTeams = async () => {
  try {
    const response = await apiFetch('/teams')
    allTeams.value = response.data || []
  } catch (error) {
    console.error('Failed to load teams:', error)
  }
}

const loadProjectTeams = async () => {
  try {
    const response = await apiFetch(`/projects/${props.projectId}/teams`)
    currentTeams.value = response.data || []
  } catch (error) {
    console.error('Failed to load project teams:', error)
  } finally {
    loading.value = false
  }
}

const addTeam = async (teamId: string) => {
  try {
    await apiFetch(`/projects/${props.projectId}/teams`, {
      method: 'POST',
      body: { team_id: teamId }
    })
    await loadProjectTeams()
    emit('updated')
  } catch (error) {
    console.error('Failed to add team:', error)
  }
}

const removeTeam = async (teamId: string) => {
  try {
    await apiFetch(`/projects/${props.projectId}/teams/${teamId}`, {
      method: 'DELETE'
    })
    await loadProjectTeams()
    emit('updated')
  } catch (error) {
    console.error('Failed to remove team:', error)
  }
}

onMounted(() => {
  loadTeams()
  loadProjectTeams()
})
</script>
