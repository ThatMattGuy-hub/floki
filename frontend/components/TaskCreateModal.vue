<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Create New Task</h2>
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
          <label class="block text-sm font-medium mb-2">Title *</label>
          <input v-model="form.title" type="text" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Task title" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Task description"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Project *</label>
          <select v-model="form.project_id" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">Select project</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }} ({{ project.product?.name }})
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Product is inherited from the selected project</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Priority</label>
            <select v-model="form.priority" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
              <option :value="0">Low</option>
              <option :value="1">Medium</option>
              <option :value="2">High</option>
              <option :value="3">Urgent</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Due Date</label>
            <input v-model="form.due_date" type="date" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Agencies</label>
          <select
            v-model="form.agencies"
            multiple
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[100px]"
          >
            <option v-for="agency in agencies" :key="agency.id" :value="agency.id">
              {{ agency.name }}
            </option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple agencies</p>
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

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            {{ loading ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  initialProjectId?: string
}>()

const emit = defineEmits(['close', 'created'])

const { apiFetch } = useApi()
const loading = ref(false)
const error = ref('')
const projects = ref([])
const agencies = ref([])
const teams = ref([])

const form = ref({
  title: '',
  description: '',
  project_id: '',
  priority: 1,
  due_date: '',
  agencies: [] as string[],
  teams: [] as string[]
})

const loadProjects = async () => {
  try {
    // Load all ongoing projects (product is shown in the dropdown for context)
    const response = await apiFetch('/projects?status=ongoing&sort_by=name&sort_order=asc')
    projects.value = response.data || []
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const loadAgencies = async () => {
  try {
    const response = await apiFetch('/agencies')
    agencies.value = response.data || []
  } catch (err) {
    console.error('Failed to load agencies:', err)
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

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    const tasksStore = useTasksStore()
    const result = await tasksStore.createTask(form.value)
    
    if (result.success) {
      emit('created')
      emit('close')
      // Reset form
      form.value = {
        title: '',
        description: '',
        project_id: '',
        priority: 1,
        due_date: '',
        agencies: [],
        teams: []
      }
    } else {
      error.value = result.error || 'Failed to create task'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create task'
  } finally {
    loading.value = false
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await loadProjects()
    loadAgencies()
    loadTeams()
    
    // If initialProjectId is provided, pre-select it
    if (props.initialProjectId) {
      form.value.project_id = props.initialProjectId
    }
  }
})
</script>

