<template>
  <div class="p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!project" class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-600 dark:text-gray-400">Project not found</h2>
      <NuxtLink to="/projects" class="btn btn-primary mt-4">Back to Projects</NuxtLink>
    </div>

    <!-- Project Detail -->
    <div v-else>
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/projects" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </NuxtLink>
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold">{{ project.name }}</h1>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :style="getStatusStyle(project.status)">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            <p v-if="project.description" class="text-gray-600 dark:text-gray-400">{{ project.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openEditModal" class="btn btn-secondary">Edit Project</button>
            <button @click="showTaskModal = true" class="btn btn-primary">
              <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
            <NuxtLink :to="`/tasks?project_id=${project.id}`" class="btn btn-secondary">View All Tasks</NuxtLink>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Timeline Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Timeline
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <input type="date" v-model="project.start_date" @change="updateProject({ start_date: project.start_date })" class="input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-1">Target End Date</label>
                <input type="date" v-model="project.target_end_date" @change="updateProject({ target_end_date: project.target_end_date })" class="input" />
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-500">Progress</label>
                <span class="text-sm font-medium">{{ taskProgress }}% ({{ completedTasks }}/{{ totalTasks }} tasks)</span>
              </div>
              <div class="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all" :style="{ width: taskProgress + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Tasks Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tasks
              </span>
              <div class="flex items-center gap-3">
                <button @click="showTaskModal = true" class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
                <NuxtLink :to="`/tasks?project_id=${project.id}`" class="text-sm text-blue-600 hover:text-blue-700">View All →</NuxtLink>
              </div>
            </h3>
            <div v-if="tasks.length === 0" class="text-center py-8 text-gray-500">
              <p>No tasks yet</p>
              <button @click="showTaskModal = true" class="mt-2 text-sm text-blue-600 hover:text-blue-700">Create the first task</button>
            </div>
            <div v-else class="space-y-2">
              <div v-for="task in tasks.slice(0, 5)" :key="task.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="w-2 h-2 rounded-full" :class="getTaskStatusColor(task.status?.name)"></span>
                  <NuxtLink :to="`/tasks/${task.id}`" class="font-medium hover:text-blue-600">{{ task.title }}</NuxtLink>
                </div>
                <span class="text-sm text-gray-500">{{ task.status?.name }}</span>
              </div>
              <p v-if="tasks.length > 5" class="text-sm text-gray-500 text-center pt-2">
                And {{ tasks.length - 5 }} more tasks...
              </p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Details Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Details</h3>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Product</dt>
                <dd class="mt-1">{{ project.product?.name || 'None' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Owner</dt>
                <dd class="mt-1">{{ project.owner?.full_name || project.owner?.email || 'Unassigned' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
                  <select v-model="project.status" @change="updateProject({ status: project.status })" class="input">
                    <option v-for="status in projectStatuses" :key="status.slug" :value="status.slug">
                      {{ status.name }}
                    </option>
                  </select>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="mt-1">{{ formatDate(project.created_at) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Labels Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Labels</h3>
            <ProjectLabels :project-id="project.id" />
          </div>

          <!-- Roadmap Color -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Roadmap Settings</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-500 mb-2">Color</label>
                <div class="flex gap-2 flex-wrap">
                  <button 
                    v-for="color in colorOptions" 
                    :key="color"
                    @click="updateProject({ roadmap_color: color })"
                    class="w-8 h-8 rounded-full border-2 transition-transform"
                    :class="project.roadmap_color === color ? 'scale-110 border-gray-800 dark:border-white' : 'border-transparent'"
                    :style="{ backgroundColor: color }"
                  ></button>
                </div>
              </div>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="project.roadmap_visible" @change="updateProject({ roadmap_visible: project.roadmap_visible })" class="rounded" />
                <span class="text-sm">Show on Roadmap</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <ProjectCreateModal :show="showEditModal" :project="project" @close="showEditModal = false" @saved="loadProject" />
    
    <!-- Task Create Modal -->
    <TaskCreateModal :show="showTaskModal" :initial-project-id="project?.id" @close="showTaskModal = false" @created="onTaskCreated" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { apiFetch } = useApi()
const { projectStatuses, loadProjectStatuses, getStatusColor, getStatusLabel } = useProjectStatuses()

const loading = ref(true)
const project = ref<any>(null)
const tasks = ref<any[]>([])
const showEditModal = ref(false)
const showTaskModal = ref(false)

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
]

// Computed task progress
const totalTasks = computed(() => tasks.value.length)

const completedTasks = computed(() => {
  return tasks.value.filter((task: any) => {
    const statusName = task.status?.name?.toLowerCase() || ''
    return statusName.includes('done') || statusName.includes('complete') || statusName.includes('closed')
  }).length
})

const taskProgress = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

const loadProject = async () => {
  loading.value = true
  try {
    const response = await apiFetch(`/projects/${route.params.id}`)
    project.value = response.data
  } catch (error) {
    console.error('Failed to load project:', error)
    project.value = null
  } finally {
    loading.value = false
  }
}

const loadTasks = async () => {
  try {
    // Load all tasks for this project to calculate accurate progress
    const response = await apiFetch(`/tasks?project_id=${route.params.id}&limit=1000`)
    tasks.value = response.data || []
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
}

const updateProject = async (updates: any) => {
  try {
    await apiFetch(`/projects/${route.params.id}`, {
      method: 'PATCH',
      body: updates
    })
  } catch (error) {
    console.error('Failed to update project:', error)
    alert('Failed to update project')
    loadProject() // Reload to reset state
  }
}

const openEditModal = () => {
  showEditModal.value = true
}

const onTaskCreated = () => {
  loadTasks()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getStatusStyle = (slug: string) => {
  const color = getStatusColor(slug)
  return {
    backgroundColor: color + '20',
    color: color
  }
}

const getTaskStatusColor = (status: string) => {
  if (!status) return 'bg-gray-400'
  const lower = status.toLowerCase()
  if (lower.includes('done') || lower.includes('complete')) return 'bg-green-500'
  if (lower.includes('progress') || lower.includes('review')) return 'bg-blue-500'
  if (lower.includes('block') || lower.includes('hold')) return 'bg-red-500'
  return 'bg-gray-400'
}

onMounted(async () => {
  await loadProjectStatuses()
  loadProject()
  loadTasks()
})
</script>
