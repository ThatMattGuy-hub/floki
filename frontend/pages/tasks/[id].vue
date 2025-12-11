<template>
  <div class="p-6">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!task" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Task not found</p>
      <NuxtLink to="/tasks" class="btn-primary mt-4 inline-block">Back to Tasks</NuxtLink>
    </div>

    <div v-else class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <NuxtLink to="/tasks" class="hover:text-blue-600 dark:hover:text-blue-400">Tasks</NuxtLink>
          <span v-if="task.parent_task" class="flex items-center gap-2">
            <span>/</span>
            <NuxtLink :to="`/tasks/${task.parent_task.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
              {{ task.parent_task.title }}
            </NuxtLink>
          </span>
          <span>/</span>
          <span>{{ task.title }}</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Editable Title -->
          <div class="flex-1 relative group">
            <input
              v-if="editingTitle"
              v-model="editTitle"
              @blur="saveTitle"
              @keydown.enter="saveTitle"
              @keydown.esc="cancelEditTitle"
              class="text-3xl font-bold w-full px-2 py-1 border-b-2 border-blue-500 bg-transparent focus:outline-none"
              ref="titleInput"
            />
            <h1
              v-else
              @click="startEditTitle"
              @mouseenter="showTitleTooltip = true"
              @mouseleave="showTitleTooltip = false"
              class="text-3xl font-bold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {{ task.title }}
            </h1>
            <div
              v-if="showTitleTooltip && !editingTitle"
              class="absolute bottom-full left-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
            >
              Click to edit title
              <div class="absolute top-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 -mt-1"></div>
            </div>
          </div>
          <Tooltip v-if="task.parent_task" text="This is a subtask of another task" position="top">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              Subtask
            </span>
          </Tooltip>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold">Description</h2>
              <span class="text-xs text-gray-500 dark:text-gray-400">Click to edit</span>
            </div>
            <div class="relative">
              <textarea
                v-if="editingDescription"
                v-model="editDescription"
                @blur="saveDescription"
                @keydown.ctrl.enter="saveDescription"
                @keydown.esc="cancelEditDescription"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref="descriptionInput"
                placeholder="Enter task description..."
              />
              <div
                v-else
                @click="startEditDescription"
                class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all min-h-[80px]"
              >
                <span v-if="task.description">{{ task.description }}</span>
                <span v-else class="text-gray-400 dark:text-gray-500 italic">Click to add a description...</span>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <TaskComments :task-id="task.id" />
          </div>

          <!-- Subtasks -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <TaskSubtasks :task-id="task.id" />
          </div>

          <!-- Checklist -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <TaskChecklist :task-id="task.id" />
          </div>

          <!-- Files -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <TaskFiles :task-id="task.id" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Details -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold mb-4">Details</h2>
            
            <div class="space-y-4">
              <!-- Status -->
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-400">Status</label>
                <div class="mt-1 relative">
                  <select
                    v-if="editingStatus"
                    v-model="editStatus"
                    @change="saveStatus"
                    @blur="saveStatus"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref="statusInput"
                  >
                    <option value="">No Status</option>
                    <option v-for="status in statuses" :key="status.id" :value="status.id">
                      {{ status.name }}
                    </option>
                  </select>
                  <span
                    v-else
                    @click="startEditStatus"
                    @mouseenter="showStatusTooltip = true"
                    @mouseleave="showStatusTooltip = false"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    :style="{ backgroundColor: task.status?.color + '20', color: task.status?.color }"
                  >
                    {{ task.status?.name || 'Click to set status' }}
                  </span>
                  <div
                    v-if="showStatusTooltip && !editingStatus"
                    class="absolute top-full left-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    Click to change status
                    <div class="absolute bottom-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 mb-[-4px]"></div>
                  </div>
                </div>
              </div>

              <!-- Priority -->
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-400">Priority</label>
                <div class="mt-1 relative">
                  <select
                    v-if="editingPriority"
                    v-model="editPriority"
                    @change="savePriority"
                    @blur="savePriority"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref="priorityInput"
                  >
                    <option :value="0">Low</option>
                    <option :value="1">Medium</option>
                    <option :value="2">High</option>
                    <option :value="3">Urgent</option>
                  </select>
                  <span
                    v-else
                    @click="startEditPriority"
                    @mouseenter="showPriorityTooltip = true"
                    @mouseleave="showPriorityTooltip = false"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    :class="getPriorityClass(task.priority)"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                  <div
                    v-if="showPriorityTooltip && !editingPriority"
                    class="absolute top-full left-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    Click to change priority level
                    <div class="absolute bottom-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 mb-[-4px]"></div>
                  </div>
                </div>
              </div>

              <!-- Labels -->
              <div>
                <TaskLabels :task-id="task.id" :task-labels="task.labels || []" @updated="loadTask" />
              </div>

              <!-- Assignee -->
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-400">Assignee</label>
                <div class="mt-1 relative">
                  <select
                    v-if="editingAssignee"
                    v-model="editAssignee"
                    @change="saveAssignee"
                    @blur="saveAssignee"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref="assigneeInput"
                  >
                    <option value="">Unassigned</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.full_name || user.email }}
                    </option>
                  </select>
                  <div
                    v-else
                    @click="startEditAssignee"
                    @mouseenter="showAssigneeTooltip = true"
                    @mouseleave="showAssigneeTooltip = false"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <div v-if="task.assignee" class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {{ getInitials(task.assignee.full_name || task.assignee.email) }}
                      </div>
                      <span>{{ task.assignee.full_name || task.assignee.email }}</span>
                    </div>
                    <span v-else class="text-gray-500 dark:text-gray-400">Click to assign</span>
                  </div>
                  <div
                    v-if="showAssigneeTooltip && !editingAssignee"
                    class="absolute top-full left-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    {{ task.assignee ? 'Click to change assignee' : 'Click to assign this task to someone' }}
                    <div class="absolute bottom-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 mb-[-4px]"></div>
                  </div>
                </div>
              </div>

              <hr class="border-gray-200 dark:border-gray-700" />

              <!-- Product -->
              <div>
                <Tooltip text="The product this task belongs to" position="top">
                  <label class="text-sm text-gray-600 dark:text-gray-400">Product</label>
                </Tooltip>
                <div class="mt-1">
                  <NuxtLink :to="`/products`" class="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {{ task.product?.name || 'Unknown' }}
                  </NuxtLink>
                </div>
              </div>

              <!-- Parent Task -->
              <div v-if="task.parent_task">
                <label class="text-sm text-gray-600 dark:text-gray-400">Parent Task</label>
                <div class="mt-1">
                  <NuxtLink :to="`/tasks/${task.parent_task.id}`" class="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {{ task.parent_task.title }}
                  </NuxtLink>
                </div>
              </div>

              <!-- Project -->
              <div>
                <Tooltip text="The project this task belongs to" position="top">
                  <label class="text-sm text-gray-600 dark:text-gray-400">Project</label>
                </Tooltip>
                <div class="mt-1">
                  <NuxtLink :to="`/projects`" class="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {{ task.project?.name || 'Unknown' }}
                  </NuxtLink>
                </div>
              </div>

              <hr class="border-gray-200 dark:border-gray-700" />

              <!-- Due Date -->
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-400">Due Date</label>
                <div class="mt-1 relative">
                  <input
                    v-if="editingDueDate"
                    v-model="editDueDate"
                    type="date"
                    @blur="saveDueDate"
                    @keydown.enter="saveDueDate"
                    @keydown.esc="cancelEditDueDate"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref="dueDateInput"
                  />
                  <div
                    v-else
                    @click="startEditDueDate"
                    @mouseenter="showDueDateTooltip = true"
                    @mouseleave="showDueDateTooltip = false"
                    class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    {{ task.due_date ? formatDate(task.due_date) : 'Click to set due date' }}
                  </div>
                  <div
                    v-if="showDueDateTooltip && !editingDueDate"
                    class="absolute top-full left-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    {{ task.due_date ? 'Click to change due date' : 'Click to set when this task is due' }}
                    <div class="absolute bottom-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 mb-[-4px]"></div>
                  </div>
                </div>
              </div>

              <!-- Estimated Hours -->
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-400">Estimated Hours</label>
                <div class="mt-1 relative">
                  <input
                    v-if="editingEstimatedHours"
                    v-model.number="editEstimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    @blur="saveEstimatedHours"
                    @keydown.enter="saveEstimatedHours"
                    @keydown.esc="cancelEditEstimatedHours"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ref="estimatedHoursInput"
                    placeholder="0"
                  />
                  <div
                    v-else
                    @click="startEditEstimatedHours"
                    @mouseenter="showEstimatedHoursTooltip = true"
                    @mouseleave="showEstimatedHoursTooltip = false"
                    class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    {{ task.estimated_hours ? `${task.estimated_hours}h` : 'Click to set hours' }}
                  </div>
                  <div
                    v-if="showEstimatedHoursTooltip && !editingEstimatedHours"
                    class="absolute top-full left-0 mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                  >
                    {{ task.estimated_hours ? 'Click to change estimated hours' : 'Click to set how many hours this task will take' }}
                    <div class="absolute bottom-full left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 mb-[-4px]"></div>
                  </div>
                </div>
              </div>

              <!-- Created -->
              <div>
                <Tooltip text="When this task was created and by whom" position="top">
                  <label class="text-sm text-gray-600 dark:text-gray-400">Created</label>
                </Tooltip>
                <div class="mt-1 text-sm">
                  {{ formatDate(task.created_at) }}
                  <div v-if="task.created_by_user" class="text-gray-500 dark:text-gray-400">
                    by {{ task.created_by_user.full_name || task.created_by_user.email }}
                  </div>
                </div>
              </div>

              <hr class="border-gray-200 dark:border-gray-700" />

              <div>
                <TaskWatchers :task-id="task.id" />
              </div>

              <div>
                <TaskAgencies :task-id="task.id" :task-agencies="task.agencies" @updated="handleTaskUpdated" />
              </div>

              <div>
                <TaskTeams :task-id="task.id" :task-teams="task.teams" @updated="handleTaskUpdated" />
              </div>

              <hr class="border-gray-200 dark:border-gray-700" />

              <div>
                <TaskCustomFields :task-id="task.id" />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-bold mb-4">Actions</h2>
            <div class="space-y-2">
              <Tooltip text="Permanently delete this task and all associated data. This action cannot be undone." position="left">
                <button @click="deleteTask" class="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg text-left">
                  <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Task
                </button>
              </Tooltip>
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

const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const { apiFetch } = useApi()

const task = ref<any>(null)
const loading = ref(true)

// Editing states
const editingTitle = ref(false)
const editingDescription = ref(false)
const editingStatus = ref(false)
const editingPriority = ref(false)
const editingAssignee = ref(false)
const editingDueDate = ref(false)
const editingEstimatedHours = ref(false)

// Tooltip states
const showTitleTooltip = ref(false)
const showStatusTooltip = ref(false)
const showPriorityTooltip = ref(false)
const showAssigneeTooltip = ref(false)
const showDueDateTooltip = ref(false)
const showEstimatedHoursTooltip = ref(false)

// Edit values
const editTitle = ref('')
const editDescription = ref('')
const editStatus = ref('')
const editPriority = ref(0)
const editAssignee = ref('')
const editDueDate = ref('')
const editEstimatedHours = ref<number | null>(null)

// Refs for inputs
const titleInput = ref<HTMLInputElement | null>(null)
const descriptionInput = ref<HTMLTextAreaElement | null>(null)
const statusInput = ref<HTMLSelectElement | null>(null)
const priorityInput = ref<HTMLSelectElement | null>(null)
const assigneeInput = ref<HTMLSelectElement | null>(null)
const dueDateInput = ref<HTMLInputElement | null>(null)
const estimatedHoursInput = ref<HTMLInputElement | null>(null)

// Data for dropdowns
const statuses = ref([])
const users = ref([])

const getPriorityClass = (priority: number) => {
  const classes = [
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  ]
  return classes[priority] || classes[0]
}

const getPriorityLabel = (priority: number) => {
  const labels = ['Low', 'Medium', 'High', 'Urgent']
  return labels[priority] || 'Low'
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
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

const formatDateInput = (date: string) => {
  if (!date) return ''
  return date.split('T')[0]
}

// Edit functions
const startEditTitle = () => {
  editingTitle.value = true
  editTitle.value = task.value.title
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

const saveTitle = async () => {
  if (editTitle.value.trim() && editTitle.value !== task.value.title) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { title: editTitle.value })
      if (result.success) {
        task.value.title = editTitle.value
      }
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }
  editingTitle.value = false
}

const cancelEditTitle = () => {
  editingTitle.value = false
  editTitle.value = task.value.title
}

const startEditDescription = () => {
  editingDescription.value = true
  editDescription.value = task.value.description || ''
  nextTick(() => {
    descriptionInput.value?.focus()
  })
}

const saveDescription = async () => {
  if (editDescription.value !== (task.value.description || '')) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { description: editDescription.value || null })
      if (result.success) {
        task.value.description = editDescription.value || null
      }
    } catch (error) {
      console.error('Failed to update description:', error)
    }
  }
  editingDescription.value = false
}

const cancelEditDescription = () => {
  editingDescription.value = false
  editDescription.value = task.value.description || ''
}

const startEditStatus = () => {
  editingStatus.value = true
  editStatus.value = task.value.status_id || ''
  nextTick(() => {
    statusInput.value?.focus()
  })
}

const saveStatus = async () => {
  if (editStatus.value !== (task.value.status_id || '')) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { status_id: editStatus.value || null })
      if (result.success) {
        await handleTaskUpdated(result.data)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }
  editingStatus.value = false
}

const startEditPriority = () => {
  editingPriority.value = true
  editPriority.value = task.value.priority ?? 0
  nextTick(() => {
    priorityInput.value?.focus()
  })
}

const savePriority = async () => {
  if (editPriority.value !== (task.value.priority ?? 0)) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { priority: editPriority.value })
      if (result.success) {
        await handleTaskUpdated(result.data)
      }
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }
  editingPriority.value = false
}

const startEditAssignee = () => {
  editingAssignee.value = true
  editAssignee.value = task.value.assignee_id || ''
  nextTick(() => {
    assigneeInput.value?.focus()
  })
}

const saveAssignee = async () => {
  if (editAssignee.value !== (task.value.assignee_id || '')) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { assignee_id: editAssignee.value || null })
      if (result.success) {
        await handleTaskUpdated(result.data)
      }
    } catch (error) {
      console.error('Failed to update assignee:', error)
    }
  }
  editingAssignee.value = false
}

const startEditDueDate = () => {
  editingDueDate.value = true
  editDueDate.value = task.value.due_date ? formatDateInput(task.value.due_date) : ''
  nextTick(() => {
    dueDateInput.value?.focus()
  })
}

const saveDueDate = async () => {
  const newDate = editDueDate.value || null
  const currentDate = task.value.due_date ? formatDateInput(task.value.due_date) : null
  if (newDate !== currentDate) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { due_date: newDate || null })
      if (result.success) {
        task.value.due_date = newDate
      }
    } catch (error) {
      console.error('Failed to update due date:', error)
    }
  }
  editingDueDate.value = false
}

const cancelEditDueDate = () => {
  editingDueDate.value = false
  editDueDate.value = task.value.due_date ? formatDateInput(task.value.due_date) : ''
}

const startEditEstimatedHours = () => {
  editingEstimatedHours.value = true
  editEstimatedHours.value = task.value.estimated_hours || null
  nextTick(() => {
    estimatedHoursInput.value?.focus()
    estimatedHoursInput.value?.select()
  })
}

const saveEstimatedHours = async () => {
  const newHours = editEstimatedHours.value || null
  if (newHours !== (task.value.estimated_hours || null)) {
    try {
      const result = await tasksStore.updateTask(task.value.id, { estimated_hours: newHours })
      if (result.success) {
        task.value.estimated_hours = newHours
      }
    } catch (error) {
      console.error('Failed to update estimated hours:', error)
    }
  }
  editingEstimatedHours.value = false
}

const cancelEditEstimatedHours = () => {
  editingEstimatedHours.value = false
  editEstimatedHours.value = task.value.estimated_hours || null
}

const handleTaskUpdated = async (updatedTask?: any) => {
  if (updatedTask) {
    task.value = updatedTask
  } else {
    // Reload to get fresh data
    try {
      const taskId = route.params.id as string
      task.value = await tasksStore.fetchTaskById(taskId)
    } catch (error) {
      console.error('Failed to reload task:', error)
    }
  }
}

const deleteTask = async () => {
  if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return
  
  try {
    const result = await tasksStore.deleteTask(task.value.id)
    if (result.success) {
      router.push('/tasks')
    } else {
      alert('Failed to delete task: ' + (result.error || 'Unknown error'))
    }
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task')
  }
}

const loadStatuses = async () => {
  try {
    const response = await apiFetch('/statuses')
    statuses.value = response.data || []
  } catch (error) {
    console.error('Failed to load statuses:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const loadTask = async () => {
  try {
    const taskId = route.params.id as string
    task.value = await tasksStore.fetchTaskById(taskId)
  } catch (error) {
    console.error('Failed to reload task:', error)
  }
}

onMounted(async () => {
  try {
    const taskId = route.params.id as string
    task.value = await tasksStore.fetchTaskById(taskId)
    await Promise.all([loadStatuses(), loadUsers()])
  } catch (error) {
    console.error('Failed to load task:', error)
  } finally {
    loading.value = false
  }
})
</script>
