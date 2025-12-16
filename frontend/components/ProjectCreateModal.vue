<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ project ? 'Edit Project' : 'Create New Project' }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Product *</label>
          <select v-model="form.product_id" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">Select product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Project Name *</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="e.g., Q1 2024 Initiatives" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Project description"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Owner *</label>
          <select v-model="form.owner_id" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">Select owner</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.full_name || user.email }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="form.status" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="ongoing">Ongoing</option>
            <option value="on_hold">On Hold</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Only "Ongoing" projects appear in priorities and task counts</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Teams</label>
          <select
            v-model="form.teams"
            multiple
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[100px]"
          >
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple teams</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Additional Products</label>
          <select
            v-model="form.products"
            multiple
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[100px]"
          >
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Select additional products this project relates to (besides primary product above)</p>
        </div>

        <div v-if="project" class="text-sm text-gray-500 dark:text-gray-400">
          <p>Created: {{ formatDate(project.created_at) }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            {{ loading ? 'Saving...' : (project ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  project?: any
}>()

const emit = defineEmits(['close', 'saved'])

const { apiFetch } = useApi()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const products = ref([])
const users = ref([])
const teams = ref([])

const form = ref({
  product_id: '',
  name: '',
  description: '',
  owner_id: '',
  status: 'ongoing',
  teams: [] as string[],
  products: [] as string[]
})

watch(() => props.project, (newProject) => {
  if (newProject) {
    form.value = {
      product_id: newProject.product_id || '',
      name: newProject.name || '',
      description: newProject.description || '',
      owner_id: newProject.owner_id || newProject.owner?.id || '',
      status: newProject.status || 'ongoing',
      teams: newProject.teams?.map((t: any) => t.team?.id || t.team_id) || [],
      products: newProject.products?.map((p: any) => p.product?.id || p.product_id) || []
    }
  } else {
    form.value = {
      product_id: '',
      name: '',
      description: '',
      owner_id: authStore.user?.id || '',
      status: 'ongoing',
      teams: [],
      products: []
    }
  }
}, { immediate: true })

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadProducts()
    loadUsers()
    loadTeams()
  }
})

const loadProducts = async () => {
  try {
    const response = await apiFetch('/products')
    products.value = response.data || []
  } catch (err) {
    console.error('Failed to load products:', err)
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

const loadTeams = async () => {
  try {
    const response = await apiFetch('/teams')
    teams.value = response.data || []
  } catch (err) {
    console.error('Failed to load teams:', err)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    let response
    if (props.project) {
      response = await apiFetch(`/projects/${props.project.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      response = await apiFetch('/projects', {
        method: 'POST',
        body: form.value
      })
    }

    if (response.success) {
      emit('saved', response.data)
      emit('close')
      form.value = { product_id: '', name: '', description: '', owner_id: '', status: 'ongoing', teams: [], products: [] }
    } else {
      error.value = response.error || 'Failed to save project'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save project'
  } finally {
    loading.value = false
  }
}
</script>

