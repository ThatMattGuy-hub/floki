<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Agencies</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">
        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Agency
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="agencies.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-4">No agencies yet</p>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">Create Your First Agency</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="agency in agencies" :key="agency.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer" @click="viewAgency(agency.id)">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-2">{{ agency.name }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ agency.description || 'No description' }}</p>
            <div v-if="agency.contact_email" class="text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ agency.contact_email }}
            </div>
            <div v-if="agency.contact_phone" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ agency.contact_phone }}
            </div>
          </div>
          <div v-if="canEdit" class="relative" @click.stop>
            <button @click.stop="toggleMenu(agency.id)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div v-if="activeMenu === agency.id" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              <button @click.stop="editAgency(agency)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg">Edit</button>
              <button @click.stop="deleteAgency(agency)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg text-red-600 dark:text-red-400">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AgencyCreateModal :show="showCreateModal" :agency="selectedAgency" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const loading = ref(true)
const agencies = ref([])
const showCreateModal = ref(false)
const selectedAgency = ref(null)
const activeMenu = ref(null)

const canCreate = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const canEdit = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const loadAgencies = async () => {
  try {
    loading.value = true
    const response = await apiFetch('/agencies')
    agencies.value = response.data || []
  } catch (error) {
    console.error('Failed to load agencies:', error)
  } finally {
    loading.value = false
  }
}

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const editAgency = (agency: any) => {
  selectedAgency.value = agency
  showCreateModal.value = true
  activeMenu.value = null
}

const deleteAgency = async (agency: any) => {
  if (!confirm(`Are you sure you want to delete "${agency.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await apiFetch(`/agencies/${agency.id}`, { method: 'DELETE' })
    if (response.success) {
      agencies.value = agencies.value.filter(a => a.id !== agency.id)
    }
  } catch (error) {
    console.error('Failed to delete agency:', error)
    alert('Failed to delete agency')
  }
  activeMenu.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  selectedAgency.value = null
}

const handleSaved = () => {
  loadAgencies()
}

const viewAgency = (id: string) => {
  navigateTo(`/agencies/${id}`)
}

onMounted(() => {
  loadAgencies()
})

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e: any) => {
    if (!e.target.closest('.relative')) {
      activeMenu.value = null
    }
  })
})
</script>

