<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-3xl font-bold mb-2">Users & Teams</h1>
          <p class="text-gray-600 dark:text-gray-400">Manage users, roles, and team assignments</p>
        </div>
        <NuxtLink to="/agencies" class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Manage Agencies
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Users Section -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Users</h2>
            <button @click="openUserModal()" class="btn btn-primary">
              + Add User
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingUsers" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
            No users found
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              @click="viewUserTeams(user)"
            >
              <div class="flex items-center gap-3 flex-1">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-sm font-medium">{{ user.full_name?.charAt(0) || user.email?.charAt(0) }}</span>
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ user.full_name || user.email }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ user.email }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>Role: {{ user.role }}</span>
                    <span v-if="user.teams && user.teams.length > 0" class="text-blue-600 dark:text-blue-400">
                      • {{ user.teams.length }} team(s)
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="[
                  'px-2 py-1 text-xs rounded',
                  user.is_active
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                ]">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
                <button
                  @click.stop="openUserModal(user)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Teams Section -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Teams</h2>
            <button @click="openTeamModal()" class="btn btn-primary">
              + Add Team
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingTeams" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="teams.length === 0" class="text-center py-8 text-gray-500">
            No teams configured
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="team in teams"
              :key="team.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              @click="viewTeamMembers(team)"
            >
              <div class="flex-1">
                <div class="font-medium">{{ team.name }}</div>
                <div v-if="team.description" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ team.description }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                  <span v-if="team.is_agency_team" class="text-blue-600 dark:text-blue-400">Agency Team</span>
                  <span v-else>Internal Team</span>
                  <span v-if="team.team_members && team.team_members.length > 0" class="text-gray-600 dark:text-gray-400">
                    • {{ team.team_members.length }} member(s)
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click.stop="openTeamModal(team)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeUserModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingUser ? 'Edit User' : 'Add User' }}</h3>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Full Name *</label>
            <input
              v-model="userForm.full_name"
              type="text"
              required
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email *</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="input"
              :disabled="!!editingUser"
            />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium mb-2">Password *</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Role *</label>
            <select v-model="userForm.role" required class="input">
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Contributor">Contributor</option>
              <option value="External Agency">External Agency</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="userForm.is_active"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Active</span>
            </label>
          </div>
          <div v-if="editingUser" class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label class="block text-sm font-medium mb-2">Teams</label>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <label
                v-for="team in teams"
                :key="team.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                <input
                  type="checkbox"
                  :value="team.id"
                  v-model="userForm.team_ids"
                  class="rounded"
                />
                <span class="text-sm">{{ team.name }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeUserModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Team Modal -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeTeamModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingTeam ? 'Edit Team' : 'Add Team' }}</h3>
        </div>
        <form @submit.prevent="saveTeam" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Team Name *</label>
            <input
              v-model="teamForm.name"
              type="text"
              required
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="teamForm.description"
              class="input"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Agency</label>
            <select
              v-model="teamForm.agency_id"
              class="input"
            >
              <option :value="null">No Agency (Internal Team)</option>
              <option
                v-for="agency in agencies"
                :key="agency.id"
                :value="agency.id"
              >
                {{ agency.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select an agency to assign this team to, or leave as "No Agency" for internal teams
            </p>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="teamForm.is_agency_team"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Mark as Agency Team</span>
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
              Check this if this team represents an external agency team
            </p>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeTeamModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Team Members Modal -->
    <div v-if="showTeamMembersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeTeamMembersModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">{{ selectedTeam?.name }} - Members</h3>
            <button @click="showAddMemberModal = true" class="btn btn-primary btn-sm">
              + Add Member
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingMembers" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="teamMembers.length === 0" class="text-center py-8 text-gray-500">
            No members in this team
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span class="text-sm font-medium">{{ member.full_name?.charAt(0) || member.email?.charAt(0) }}</span>
                </div>
                <div>
                  <div class="font-medium">{{ member.full_name || member.email }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ member.email }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Role: {{ member.role }}
                  </div>
                </div>
              </div>
              <button
                @click="removeTeamMember(member.id)"
                class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showAddMemberModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">Add Team Member</h3>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Select User</label>
            <select v-model="selectedUserId" class="input">
              <option value="">Choose a user...</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.full_name || user.email }} ({{ user.role }})
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showAddMemberModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="addTeamMember" class="btn btn-primary" :disabled="!selectedUserId || saving">
              {{ saving ? 'Adding...' : 'Add Member' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Teams Modal -->
    <div v-if="showUserTeamsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeUserTeamsModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ selectedUser?.full_name || selectedUser?.email }} - Teams</h3>
        </div>
        <div class="p-6">
          <div v-if="loadingUserTeams" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="userTeams.length === 0" class="text-center py-8 text-gray-500">
            User is not assigned to any teams
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="team in userTeams"
              :key="team.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div>
                <div class="font-medium">{{ team.name }}</div>
                <div v-if="team.description" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ team.description }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span v-if="team.is_agency_team" class="text-blue-600 dark:text-blue-400">Agency Team</span>
                  <span v-else>Internal Team</span>
                </div>
              </div>
            </div>
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

const users = ref<any[]>([])
const teams = ref<any[]>([])
const loadingUsers = ref(false)
const loadingTeams = ref(false)
const saving = ref(false)
const showUserModal = ref(false)
const showTeamModal = ref(false)
const showTeamMembersModal = ref(false)
const showAddMemberModal = ref(false)
const showUserTeamsModal = ref(false)
const editingUser = ref<any>(null)
const editingTeam = ref<any>(null)
const selectedTeam = ref<any>(null)
const selectedUser = ref<any>(null)
const teamMembers = ref<any[]>([])
const userTeams = ref<any[]>([])
const loadingMembers = ref(false)
const loadingUserTeams = ref(false)
const selectedUserId = ref('')

const userForm = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'Contributor',
  is_active: true,
  team_ids: [] as string[]
})

const teamForm = ref({
  name: '',
  description: '',
  is_agency_team: false,
  agency_id: null as string | null
})

const agencies = ref<any[]>([])
const loadingAgencies = ref(false)

const availableUsers = computed(() => {
  if (!selectedTeam.value) return []
  const memberIds = teamMembers.value.map(m => m.id)
  return users.value.filter(u => !memberIds.includes(u.id) && u.is_active)
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadUsers()
  loadTeams()
  loadAgencies()
})

const loadAgencies = async () => {
  loadingAgencies.value = true
  try {
    const response = await apiFetch('/agencies')
    agencies.value = response.data || []
  } catch (error) {
    console.error('Failed to load agencies:', error)
    agencies.value = []
  } finally {
    loadingAgencies.value = false
  }
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await apiFetch('/users')
    const usersData = response.data || []
    
    // Load teams for each user
    for (const user of usersData) {
      try {
        const teamsResponse = await apiFetch(`/teams/users/${user.id}/teams`)
        user.teams = teamsResponse.data || []
      } catch (error) {
        user.teams = []
      }
    }
    
    users.value = usersData
  } catch (error) {
    console.error('Failed to load users:', error)
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const loadTeams = async () => {
  loadingTeams.value = true
  try {
    const response = await apiFetch('/teams?include_members=true')
    teams.value = response.data || []
  } catch (error) {
    console.error('Failed to load teams:', error)
    teams.value = []
  } finally {
    loadingTeams.value = false
  }
}

const viewTeamMembers = async (team: any) => {
  selectedTeam.value = team
  loadingMembers.value = true
  try {
    const response = await apiFetch(`/teams/${team.id}/members`)
    teamMembers.value = response.data || []
  } catch (error) {
    console.error('Failed to load team members:', error)
    teamMembers.value = []
  } finally {
    loadingMembers.value = false
  }
  showTeamMembersModal.value = true
}

const closeTeamMembersModal = () => {
  showTeamMembersModal.value = false
  showAddMemberModal.value = false
  selectedTeam.value = null
  teamMembers.value = []
  selectedUserId.value = ''
}

const addTeamMember = async () => {
  if (!selectedUserId.value || !selectedTeam.value) return
  
  saving.value = true
  try {
    await apiFetch(`/teams/${selectedTeam.value.id}/members`, {
      method: 'POST',
      body: { user_id: selectedUserId.value }
    })
    await viewTeamMembers(selectedTeam.value)
    await loadTeams()
    showAddMemberModal.value = false
    selectedUserId.value = ''
  } catch (error: any) {
    console.error('Failed to add team member:', error)
    alert(error.data?.error || 'Failed to add team member')
  } finally {
    saving.value = false
  }
}

const removeTeamMember = async (userId: string) => {
  if (!confirm('Are you sure you want to remove this member from the team?')) return
  if (!selectedTeam.value) return
  
  saving.value = true
  try {
    await apiFetch(`/teams/${selectedTeam.value.id}/members/${userId}`, {
      method: 'DELETE'
    })
    await viewTeamMembers(selectedTeam.value)
    await loadTeams()
    await loadUsers()
  } catch (error) {
    console.error('Failed to remove team member:', error)
    alert('Failed to remove team member')
  } finally {
    saving.value = false
  }
}

const viewUserTeams = async (user: any) => {
  selectedUser.value = user
  loadingUserTeams.value = true
  try {
    const response = await apiFetch(`/teams/users/${user.id}/teams`)
    userTeams.value = response.data || []
  } catch (error) {
    console.error('Failed to load user teams:', error)
    userTeams.value = []
  } finally {
    loadingUserTeams.value = false
  }
  showUserTeamsModal.value = true
}

const closeUserTeamsModal = () => {
  showUserTeamsModal.value = false
  selectedUser.value = null
  userTeams.value = []
}

const openUserModal = async (user?: any) => {
  editingUser.value = user
  if (user) {
    // Load user teams
    let userTeamIds: string[] = []
    try {
      const teamsResponse = await apiFetch(`/teams/users/${user.id}/teams`)
      userTeamIds = (teamsResponse.data || []).map((t: any) => t.id)
    } catch (error) {
      console.error('Failed to load user teams:', error)
    }
    
    userForm.value = {
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Contributor',
      is_active: user.is_active !== false,
      team_ids: userTeamIds
    }
  } else {
    userForm.value = {
      full_name: '',
      email: '',
      password: '',
      role: 'Contributor',
      is_active: true,
      team_ids: []
    }
  }
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  userForm.value = {
    full_name: '',
    email: '',
    password: '',
    role: 'Contributor',
    is_active: true,
    team_ids: []
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    const data = { ...userForm.value }
    const teamIds = data.team_ids
    delete data.team_ids
    
    if (editingUser.value && !data.password) {
      delete data.password
    }

    if (editingUser.value) {
      await apiFetch(`/users/${editingUser.value.id}`, {
        method: 'PATCH',
        body: data
      })
      
      // Update team memberships
      if (editingUser.value) {
        // Get current teams
        const currentTeamsResponse = await apiFetch(`/teams/users/${editingUser.value.id}/teams`)
        const currentTeamIds = (currentTeamsResponse.data || []).map((t: any) => t.id)
        
        // Add new teams
        for (const teamId of teamIds) {
          if (!currentTeamIds.includes(teamId)) {
            try {
              await apiFetch(`/teams/${teamId}/members`, {
                method: 'POST',
                body: { user_id: editingUser.value.id }
              })
            } catch (error) {
              console.error('Failed to add user to team:', error)
            }
          }
        }
        
        // Remove teams
        for (const teamId of currentTeamIds) {
          if (!teamIds.includes(teamId)) {
            try {
              await apiFetch(`/teams/${teamId}/members/${editingUser.value.id}`, {
                method: 'DELETE'
              })
            } catch (error) {
              console.error('Failed to remove user from team:', error)
            }
          }
        }
      }
    } else {
      await apiFetch('/users', {
        method: 'POST',
        body: data
      })
    }
    await loadUsers()
    await loadTeams()
    closeUserModal()
  } catch (error) {
    console.error('Failed to save user:', error)
    alert('Failed to save user')
  } finally {
    saving.value = false
  }
}

const openTeamModal = (team?: any) => {
  editingTeam.value = team
  if (team) {
    teamForm.value = {
      name: team.name || '',
      description: team.description || '',
      is_agency_team: team.is_agency_team || false,
      agency_id: team.agency_id || null
    }
  } else {
    teamForm.value = {
      name: '',
      description: '',
      is_agency_team: false,
      agency_id: null
    }
  }
  showTeamModal.value = true
}

const closeTeamModal = () => {
  showTeamModal.value = false
  editingTeam.value = null
  teamForm.value = {
    name: '',
    description: '',
    is_agency_team: false,
    agency_id: null
  }
}

const saveTeam = async () => {
  saving.value = true
  try {
    if (editingTeam.value) {
      await apiFetch(`/teams/${editingTeam.value.id}`, {
        method: 'PATCH',
        body: teamForm.value
      })
    } else {
      await apiFetch('/teams', {
        method: 'POST',
        body: teamForm.value
      })
    }
    await loadTeams()
    closeTeamModal()
  } catch (error) {
    console.error('Failed to save team:', error)
    alert('Failed to save team')
  } finally {
    saving.value = false
  }
}
</script>
