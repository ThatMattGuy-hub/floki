<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Priority Management</h1>
      <p class="text-gray-600 dark:text-gray-400">Drag and drop to reorder projects and tasks by priority</p>
      <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Only "Ongoing" projects are shown. Change a project's status to manage its priority.</p>
    </div>

    <!-- View Selector -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
      <div class="flex items-center gap-4">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">View:</label>
        <div class="flex gap-2">
          <button
            @click="currentView = 'projects'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              currentView === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Projects
          </button>
          <button
            @click="currentView = 'tasks'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              currentView === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Tasks by Project
          </button>
        </div>
      </div>
    </div>

    <!-- Projects View -->
    <div v-if="currentView === 'projects'" class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Project Priorities</h2>
          <button
            v-if="hasProjectChanges"
            @click="saveProjectPriorities"
            :disabled="savingProjects"
            class="btn-primary"
          >
            <svg v-if="!savingProjects" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div v-else class="w-5 h-5 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ savingProjects ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Drag projects to reorder them. Click on a project to view details and manage its tasks.
        </p>
      </div>

      <div v-if="loadingProjects" class="p-12 text-center">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="projects.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        No projects found
      </div>

      <draggable
        v-else
        v-model="projects"
        item-key="id"
        handle=".drag-handle"
        @end="onProjectDragEnd"
        class="divide-y divide-gray-200 dark:divide-gray-700"
      >
        <template #item="{ element: project, index }">
          <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                {{ index + 1 }}
              </div>
              <div class="flex-1 cursor-pointer" @click="openProjectModal(project)">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ project.name }}</h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {{ project.product?.name }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ project.description || 'No description' }}</p>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Owner: {{ project.owner?.full_name || project.owner?.email || 'Unknown' }}
              </div>
              <button
                @click="openProjectModal(project)"
                class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="View details"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Tasks View -->
    <div v-if="currentView === 'tasks'" class="space-y-6">
      <!-- Project Filter -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <label class="block text-sm font-medium mb-2">Select Project</label>
        <select
          v-model="selectedProjectId"
          @change="loadTasksForProject"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        >
          <option value="">Select a project...</option>
          <option v-for="project in allProjects" :key="project.id" :value="project.id">
            {{ project.name }} ({{ project.product?.name }})
          </option>
        </select>
      </div>

      <!-- Tasks List -->
      <div v-if="selectedProjectId" class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Task Priorities</h2>
            <button
              v-if="hasTaskChanges"
              @click="saveTaskPriorities"
              :disabled="savingTasks"
              class="btn-primary"
            >
              <svg v-if="!savingTasks" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div v-else class="w-5 h-5 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ savingTasks ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Drag tasks to reorder them within this project. Click on a task to view details.
          </p>
        </div>

        <div v-if="loadingTasks" class="p-12 text-center">
          <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="tasks.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
          No tasks found in this project
        </div>

        <draggable
          v-else
          v-model="tasks"
          item-key="id"
          handle=".drag-handle"
          @end="onTaskDragEnd"
          class="divide-y divide-gray-200 dark:divide-gray-700"
        >
          <template #item="{ element: task, index }">
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div class="flex items-center gap-4">
                <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold text-sm">
                  {{ index + 1 }}
                </div>
                <div class="flex-1 cursor-pointer" @click="openTaskModal(task)">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: task.status?.color || '#6B7280' }"></div>
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{{ task.title }}</h3>
                    <span
                      v-if="task.status"
                      class="text-xs px-2 py-1 rounded-full"
                      :style="{ backgroundColor: task.status.color + '20', color: task.status.color }"
                    >
                      {{ task.status.name }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span v-if="task.assignee">
                      Assignee: {{ task.assignee.full_name || task.assignee.email }}
                    </span>
                    <span v-else class="text-gray-400">Unassigned</span>
                    <span v-if="task.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(task.due_date) }">
                      Due: {{ formatDate(task.due_date) }}
                    </span>
                  </div>
                </div>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ getPriorityLabel(task.priority) }}
                </span>
                <button
                  @click="openTaskModal(task)"
                  class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="View details"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Modals -->
    <ProjectPriorityModal
      :show="showProjectModal"
      :project="selectedProject"
      @close="closeProjectModal"
      @taskPrioritiesUpdated="handleTaskPrioritiesUpdated"
      @viewTask="openTaskModalFromProject"
    />

    <TaskDetailModal
      :show="showTaskModal"
      :task="selectedTask"
      @close="closeTaskModal"
    />
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const currentView = ref<'projects' | 'tasks'>('projects')
const selectedProjectId = ref('')

// Modal state
const showProjectModal = ref(false)
const showTaskModal = ref(false)
const selectedProject = ref<any>(null)
const selectedTask = ref<any>(null)

// Projects
const projects = ref<any[]>([])
const allProjects = ref<any[]>([])
const loadingProjects = ref(true)
const savingProjects = ref(false)
const hasProjectChanges = ref(false)
const originalProjectOrder = ref<string[]>([])

// Tasks
const tasks = ref<any[]>([])
const loadingTasks = ref(false)
const savingTasks = ref(false)
const hasTaskChanges = ref(false)
const originalTaskOrder = ref<string[]>([])

// Check permissions
const canManagePriorities = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

// Sort helper: items with priority_order = 0 or null go to bottom
const sortByPriorityOrder = (items: any[]) => {
  return [...items].sort((a, b) => {
    const aOrder = a.priority_order
    const bOrder = b.priority_order
    // Items with 0 or null go to bottom
    const aIsUnset = aOrder === 0 || aOrder === null || aOrder === undefined
    const bIsUnset = bOrder === 0 || bOrder === null || bOrder === undefined
    
    if (aIsUnset && bIsUnset) return 0
    if (aIsUnset) return 1  // a goes after b
    if (bIsUnset) return -1 // b goes after a
    return aOrder - bOrder
  })
}

// Load projects (only ongoing projects appear in priorities)
const loadProjects = async () => {
  try {
    loadingProjects.value = true
    const response = await apiFetch('/projects?status=ongoing&sort_by=priority_order&sort_order=asc')
    // Sort with 0/null priority_order items at the bottom
    projects.value = sortByPriorityOrder(response.data || [])
    allProjects.value = [...projects.value]
    originalProjectOrder.value = projects.value.map((p: any) => p.id)
    hasProjectChanges.value = false
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loadingProjects.value = false
  }
}

// Load tasks for a specific project
const loadTasksForProject = async () => {
  if (!selectedProjectId.value) {
    tasks.value = []
    return
  }

  try {
    loadingTasks.value = true
    const response = await apiFetch(`/tasks?project_id=${selectedProjectId.value}&sort_by=priority_order&sort_order=asc`)
    // Sort with 0/null priority_order items at the bottom
    tasks.value = sortByPriorityOrder(response.data || [])
    originalTaskOrder.value = tasks.value.map((t: any) => t.id)
    hasTaskChanges.value = false
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loadingTasks.value = false
  }
}

// Handle project drag end
const onProjectDragEnd = () => {
  const currentOrder = projects.value.map((p: any) => p.id)
  hasProjectChanges.value = JSON.stringify(currentOrder) !== JSON.stringify(originalProjectOrder.value)
}

// Handle task drag end
const onTaskDragEnd = () => {
  const currentOrder = tasks.value.map((t: any) => t.id)
  hasTaskChanges.value = JSON.stringify(currentOrder) !== JSON.stringify(originalTaskOrder.value)
}

// Save project priorities
const saveProjectPriorities = async () => {
  if (!canManagePriorities.value) {
    alert('You do not have permission to manage priorities')
    return
  }

  try {
    savingProjects.value = true
    const priorities = projects.value.map((project, index) => ({
      id: project.id,
      priority_order: index + 1
    }))

    const response = await apiFetch('/projects/priorities', {
      method: 'POST',
      body: { priorities }
    })

    if (response.success) {
      originalProjectOrder.value = projects.value.map((p: any) => p.id)
      hasProjectChanges.value = false
      // Show success message
      alert('Project priorities saved successfully!')
    }
  } catch (error: any) {
    console.error('Failed to save project priorities:', error)
    alert(error.data?.error || 'Failed to save project priorities')
  } finally {
    savingProjects.value = false
  }
}

// Save task priorities
const saveTaskPriorities = async () => {
  if (!canManagePriorities.value) {
    alert('You do not have permission to manage priorities')
    return
  }

  try {
    savingTasks.value = true
    const priorities = tasks.value.map((task, index) => ({
      id: task.id,
      priority_order: index + 1
    }))

    const response = await apiFetch('/tasks/priorities', {
      method: 'POST',
      body: {
        priorities,
        project_id: selectedProjectId.value
      }
    })

    if (response.success) {
      originalTaskOrder.value = tasks.value.map((t: any) => t.id)
      hasTaskChanges.value = false
      // Show success message
      alert('Task priorities saved successfully!')
    }
  } catch (error: any) {
    console.error('Failed to save task priorities:', error)
    alert(error.data?.error || 'Failed to save task priorities')
  } finally {
    savingTasks.value = false
  }
}

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const isOverdue = (dateString: string) => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

const getPriorityLabel = (priority: number) => {
  const labels = ['Low', 'Medium', 'High', 'Urgent']
  return labels[priority] || 'Low'
}

const getPriorityClass = (priority: number) => {
  const classes = [
    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  ]
  return classes[priority] || classes[0]
}

// Check permissions on mount
onMounted(() => {
  if (!canManagePriorities.value) {
    alert('You do not have permission to access this page')
    navigateTo('/')
    return
  }
  
  loadProjects()
})

// Modal functions
const openProjectModal = (project: any) => {
  selectedProject.value = project
  showProjectModal.value = true
}

const closeProjectModal = () => {
  showProjectModal.value = false
  selectedProject.value = null
}

const openTaskModal = (task: any) => {
  selectedTask.value = task
  showTaskModal.value = true
}

const openTaskModalFromProject = (task: any) => {
  selectedTask.value = task
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTask.value = null
}

const handleTaskPrioritiesUpdated = () => {
  // Reload tasks if we're in tasks view and viewing the same project
  if (currentView.value === 'tasks' && selectedProjectId.value === selectedProject.value?.id) {
    loadTasksForProject()
  }
}

// Watch for view changes
watch(currentView, (newView) => {
  if (newView === 'tasks' && allProjects.value.length > 0 && !selectedProjectId.value) {
    // Auto-select first project if none selected
    selectedProjectId.value = allProjects.value[0]?.id || ''
    if (selectedProjectId.value) {
      loadTasksForProject()
    }
  }
})
</script>
