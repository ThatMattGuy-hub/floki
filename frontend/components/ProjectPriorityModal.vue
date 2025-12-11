<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ project?.name }}</h3>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {{ project?.product?.name }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  Owner: {{ project?.owner?.full_name || project?.owner?.email || 'Unknown' }}
                </span>
              </div>
            </div>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Project Description -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
            <p class="text-gray-600 dark:text-gray-400">{{ project?.description || 'No description provided' }}</p>
          </div>

          <!-- Project Stats -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ tasks.length }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ completedTasksCount }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Completed</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ inProgressTasksCount }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
            </div>
          </div>

          <!-- Tasks Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Tasks Priority</h4>
              <button
                v-if="hasTaskChanges"
                @click="saveTaskPriorities"
                :disabled="savingTasks"
                class="btn-primary text-sm"
              >
                <svg v-if="!savingTasks" class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <div v-else class="w-4 h-4 inline mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ savingTasks ? 'Saving...' : 'Save Task Order' }}
              </button>
            </div>

            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Drag tasks to reorder their priority within this project
            </p>

            <div v-if="loadingTasks" class="py-8 text-center">
              <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else-if="tasks.length === 0" class="py-8 text-center text-gray-500 dark:text-gray-400">
              No tasks in this project
            </div>

            <draggable
              v-else
              v-model="tasks"
              item-key="id"
              handle=".drag-handle"
              @end="onTaskDragEnd"
              class="space-y-2 max-h-96 overflow-y-auto"
            >
              <template #item="{ element: task, index }">
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                    {{ index + 1 }}
                  </div>
                  <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: task.status?.color || '#6B7280' }"></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h5 class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ task.title }}</h5>
                      <span
                        v-if="task.status"
                        class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: task.status.color + '20', color: task.status.color }"
                      >
                        {{ task.status.name }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span v-if="task.assignee">
                        {{ task.assignee.full_name || task.assignee.email }}
                      </span>
                      <span v-else class="text-gray-400">Unassigned</span>
                      <span v-if="task.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(task.due_date) }">
                        Due: {{ formatDate(task.due_date) }}
                      </span>
                    </div>
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    :class="getPriorityClass(task.priority)"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <button
                    @click="viewTaskDetails(task)"
                    class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0"
                    title="View details"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button @click="closeModal" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

const props = defineProps<{
  show: boolean
  project: any
}>()

const emit = defineEmits(['close', 'taskPrioritiesUpdated', 'viewTask'])

const { apiFetch } = useApi()

const tasks = ref<any[]>([])
const loadingTasks = ref(false)
const savingTasks = ref(false)
const hasTaskChanges = ref(false)
const originalTaskOrder = ref<string[]>([])

const completedTasksCount = computed(() => {
  return tasks.value.filter(t => t.status?.name?.toLowerCase().includes('complete') || t.status?.name?.toLowerCase().includes('done')).length
})

const inProgressTasksCount = computed(() => {
  return tasks.value.filter(t => 
    t.status?.name?.toLowerCase().includes('progress') || 
    t.status?.name?.toLowerCase().includes('active') ||
    t.status?.name?.toLowerCase().includes('working')
  ).length
})

const loadTasks = async () => {
  if (!props.project?.id) return

  try {
    loadingTasks.value = true
    const response = await apiFetch(`/tasks?project_id=${props.project.id}&sort_by=priority_order&sort_order=asc`)
    tasks.value = response.data || []
    originalTaskOrder.value = tasks.value.map((t: any) => t.id)
    hasTaskChanges.value = false
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loadingTasks.value = false
  }
}

const onTaskDragEnd = () => {
  const currentOrder = tasks.value.map((t: any) => t.id)
  hasTaskChanges.value = JSON.stringify(currentOrder) !== JSON.stringify(originalTaskOrder.value)
}

const saveTaskPriorities = async () => {
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
        project_id: props.project.id
      }
    })

    if (response.success) {
      originalTaskOrder.value = tasks.value.map((t: any) => t.id)
      hasTaskChanges.value = false
      emit('taskPrioritiesUpdated')
    }
  } catch (error: any) {
    console.error('Failed to save task priorities:', error)
    alert(error.data?.error || 'Failed to save task priorities')
  } finally {
    savingTasks.value = false
  }
}

const viewTaskDetails = (task: any) => {
  emit('viewTask', task)
}

const closeModal = () => {
  if (hasTaskChanges.value) {
    if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
      return
    }
  }
  emit('close')
}

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

watch(() => props.show, (newVal) => {
  if (newVal && props.project) {
    loadTasks()
  }
})
</script>
