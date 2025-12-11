<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <NuxtLink to="/agencies" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-block flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Agencies
      </NuxtLink>
      <div class="flex items-start justify-between mb-6">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{{ agency?.name || 'Loading...' }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ agency?.description || 'No description provided' }}</p>
        </div>
        <div v-if="canEdit && agency" class="flex gap-2">
          <button @click="editAgency" class="btn-secondary">Edit</button>
          <button @click="deleteAgency" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <div v-else-if="agency" class="space-y-6">
      <!-- Agency Info -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Agency Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <p class="text-gray-900 dark:text-gray-100 font-medium">{{ agency.name }}</p>
          </div>
          <div v-if="agency.contact_email">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Email</label>
            <p class="mt-1">
              <a :href="`mailto:${agency.contact_email}`" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                {{ agency.contact_email }}
              </a>
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <p class="mt-1">
              <span 
                :class="agency.is_active 
                  ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
              >
                {{ agency.is_active ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Teams Section -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Teams ({{ teams.length }})</h2>
          <button v-if="canEdit" @click="showAssignTeamModal = true" class="btn-secondary text-sm">
            <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Assign Team
          </button>
        </div>
        <div v-if="teams.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No teams assigned to this agency</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="team in teams" :key="team.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">{{ team.name }}</h3>
                <p v-if="team.description" class="text-sm text-gray-600 dark:text-gray-400">{{ team.description }}</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ team.members.length }} member{{ team.members.length !== 1 ? 's' : '' }}
                </span>
                <button
                  v-if="canEdit"
                  @click="removeTeamFromAgency(team.id)"
                  class="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Remove team from agency"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="team.members.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="member in team.members"
                  :key="member.id"
                  class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  <div class="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                    {{ member.full_name?.charAt(0) || member.email?.charAt(0) }}
                  </div>
                  <span class="text-gray-900 dark:text-gray-100">{{ member.full_name || member.email }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">({{ member.role }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Section -->
      <div class="card p-6">
        <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">All Users ({{ users.length }})</h2>
        <div v-if="users.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">No users assigned to teams in this agency</p>
        </div>
        <div v-else class="overflow-x-auto -mx-6">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teams</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {{ user.full_name?.charAt(0) || user.email?.charAt(0) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ user.full_name || 'No name' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 dark:text-gray-100">{{ user.role }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="teamName in user.teams"
                      :key="teamName"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {{ teamName }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="user.is_active 
                      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                  >
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AgencyCreateModal :show="showEditModal" :agency="agency" @close="closeEditModal" @saved="handleSaved" />

    <!-- Assign Team Modal -->
    <div v-if="showAssignTeamModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showAssignTeamModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">Assign Team to Agency</h3>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Select Team</label>
            <select v-model="selectedTeamId" class="input" :disabled="loadingTeams">
              <option :value="null">Choose a team...</option>
              <option
                v-for="team in allTeams"
                :key="team.id"
                :value="team.id"
              >
                {{ team.name }} {{ team.agency_id ? '(already assigned)' : '' }}
              </option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a team to assign to this agency. Teams already assigned to other agencies will be moved.
            </p>
          </div>
          <div v-if="allTeams.length === 0 && !loadingTeams" class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No unassigned teams available. Create a new team first.
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showAssignTeamModal = false; selectedTeamId = null" class="btn-secondary">
              Cancel
            </button>
            <button @click="assignTeam" class="btn-primary" :disabled="!selectedTeamId || saving || loadingTeams">
              {{ saving ? 'Assigning...' : 'Assign Team' }}
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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { apiFetch } = useApi()

const loading = ref(true)
const error = ref('')
const agency = ref<any>(null)
const teams = ref<any[]>([])
const users = ref<any[]>([])
const showEditModal = ref(false)
const showAssignTeamModal = ref(false)
const allTeams = ref<any[]>([])
const selectedTeamId = ref<string | null>(null)
const loadingTeams = ref(false)
const saving = ref(false)

const canEdit = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const loadAgency = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await apiFetch(`/agencies/${route.params.id}`)
    if (response.success) {
      agency.value = response.data
      teams.value = response.data.teams || []
      users.value = response.data.users || []
    } else {
      error.value = response.error || 'Failed to load agency'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load agency'
    console.error('Failed to load agency:', err)
  } finally {
    loading.value = false
  }
}

const loadAllTeams = async () => {
  loadingTeams.value = true
  try {
    const response = await apiFetch('/teams')
    // Show all teams except ones already assigned to this agency
    allTeams.value = (response.data || []).filter((team: any) => {
      return team.agency_id !== agency.value?.id
    })
  } catch (err) {
    console.error('Failed to load teams:', err)
    allTeams.value = []
  } finally {
    loadingTeams.value = false
  }
}

const assignTeam = async () => {
  if (!selectedTeamId.value) return
  
  saving.value = true
  try {
    const response = await apiFetch(`/teams/${selectedTeamId.value}`, {
      method: 'PATCH',
      body: {
        agency_id: agency.value?.id,
        is_agency_team: true
      }
    })
    if (response.success) {
      await loadAgency()
      showAssignTeamModal.value = false
      selectedTeamId.value = null
    } else {
      alert('Failed to assign team')
    }
  } catch (err: any) {
    console.error('Failed to assign team:', err)
    alert('Failed to assign team')
  } finally {
    saving.value = false
  }
}

const removeTeamFromAgency = async (teamId: string) => {
  if (!confirm('Are you sure you want to remove this team from the agency?')) return
  
  saving.value = true
  try {
    const response = await apiFetch(`/teams/${teamId}`, {
      method: 'PATCH',
      body: {
        agency_id: null,
        is_agency_team: false
      }
    })
    if (response.success) {
      await loadAgency()
    } else {
      alert('Failed to remove team from agency')
    }
  } catch (err: any) {
    console.error('Failed to remove team:', err)
    alert('Failed to remove team from agency')
  } finally {
    saving.value = false
  }
}

const editAgency = () => {
  showEditModal.value = true
}

const deleteAgency = async () => {
  if (!confirm(`Are you sure you want to delete "${agency.value?.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await apiFetch(`/agencies/${route.params.id}`, { method: 'DELETE' })
    if (response.success) {
      router.push('/agencies')
    } else {
      alert('Failed to delete agency')
    }
  } catch (err: any) {
    console.error('Failed to delete agency:', err)
    alert('Failed to delete agency')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const handleSaved = () => {
  closeEditModal()
  loadAgency()
}

watch(showAssignTeamModal, (newVal) => {
  if (newVal) {
    loadAllTeams()
  }
})

onMounted(() => {
  loadAgency()
})
</script>

