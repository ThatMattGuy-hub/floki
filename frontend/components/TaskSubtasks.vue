<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Subtasks</h3>
      <button @click="showAddForm = !showAddForm" class="btn-secondary text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Subtask
      </button>
    </div>

    <!-- Add Subtask Form -->
    <div v-if="showAddForm" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
      <div class="space-y-3">
        <input
          v-model="newSubtask.title"
          type="text"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="Subtask title *"
        />
        <textarea
          v-model="newSubtask.description"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="Description (optional)"
          rows="3"
        />
        <div class="grid grid-cols-2 gap-3">
          <select
            v-model="newSubtask.status_id"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="">Select Status</option>
            <option v-for="status in statuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
          <select
            v-model="newSubtask.priority"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option :value="1">Low Priority</option>
            <option :value="2">Medium Priority</option>
            <option :value="3">High Priority</option>
            <option :value="4">Urgent</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <select
            v-model="newSubtask.assignee_id"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="">Unassigned</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.full_name || user.email }}
            </option>
          </select>
          <input
            v-model="newSubtask.due_date"
            type="date"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 mt-4">
        <button @click="cancelAdd" class="btn-secondary text-sm">Cancel</button>
        <button @click="addSubtask" :disabled="!newSubtask.title?.trim() || loading" class="btn-primary text-sm">
          {{ loading ? 'Adding...' : 'Add Subtask' }}
        </button>
      </div>
    </div>

    <!-- Subtasks List -->
    <div v-if="loading && subtasks.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="subtasks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No subtasks yet. Add one to break down the work!
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="subtask in subtasks"
        :key="subtask.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <NuxtLink 
                :to="`/tasks/${subtask.id}`"
                class="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400"
              >
                {{ subtask.title }}
              </NuxtLink>
              <span 
                v-if="subtask.status"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :style="{ backgroundColor: subtask.status.color + '20', color: subtask.status.color }"
              >
                {{ subtask.status.name }}
              </span>
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getPriorityClass(subtask.priority)"
              >
                {{ getPriorityLabel(subtask.priority) }}
              </span>
            </div>
            
            <p v-if="subtask.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {{ subtask.description }}
            </p>
            
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div v-if="subtask.assignee" class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {{ getInitials(subtask.assignee.full_name || subtask.assignee.email) }}
                </div>
                <span>{{ subtask.assignee.full_name || subtask.assignee.email }}</span>
              </div>
              <span v-else class="text-gray-400">Unassigned</span>
              
              <span v-if="subtask.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(subtask.due_date) }">
                Due: {{ formatDate(subtask.due_date) }}
              </span>
              
              <span v-if="subtask.estimated_hours" class="text-gray-500">
                Est: {{ subtask.estimated_hours }}h
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 ml-4">
            <NuxtLink 
              :to="`/tasks/${subtask.id}`"
              class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
            >
              View →
            </NuxtLink>
            <button
              @click="deleteSubtask(subtask.id)"
              class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/types'

const props = defineProps<{
  taskId: string
}>()

const { apiFetch } = useApi()
const router = useRouter()

const subtasks = ref<Task[]>([])
const showAddForm = ref(false)
const newSubtask = ref({
  title: '',
  description: '',
  assignee_id: '',
  status_id: '',
  priority: 1,
  due_date: ''
})
const loading = ref(false)
const statuses = ref([])
const users = ref([])

const getPriorityClass = (priority: number) => {
  const classes = {
    0: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    1: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    2: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    3: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    4: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  return classes[priority as keyof typeof classes] || classes[1]
}

const getPriorityLabel = (priority: number) => {
  const labels = {
    0: 'Low',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent'
  }
  return labels[priority as keyof typeof labels] || 'Low'
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const loadSubtasks = async () => {
  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/subtasks`)
    subtasks.value = response.data || []
  } catch (error) {
    console.error('Failed to load subtasks:', error)
  } finally {
    loading.value = false
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

const addSubtask = async () => {
  if (!newSubtask.value.title?.trim() || loading.value) return

  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/subtasks`, {
      method: 'POST',
      body: {
        title: newSubtask.value.title,
        description: newSubtask.value.description || undefined,
        assignee_id: newSubtask.value.assignee_id || undefined,
        status_id: newSubtask.value.status_id || undefined,
        priority: newSubtask.value.priority,
        due_date: newSubtask.value.due_date || undefined
      }
    })

    if (response.success) {
      await loadSubtasks()
      newSubtask.value = {
        title: '',
        description: '',
        assignee_id: '',
        status_id: '',
        priority: 1,
        due_date: ''
      }
      showAddForm.value = false
    }
  } catch (error) {
    console.error('Failed to add subtask:', error)
    alert('Failed to add subtask')
  } finally {
    loading.value = false
  }
}

const cancelAdd = () => {
  showAddForm.value = false
  newSubtask.value = {
    title: '',
    description: '',
    assignee_id: '',
    status_id: '',
    priority: 1,
    due_date: ''
  }
}

const deleteSubtask = async (id: string) => {
  if (!confirm('Are you sure you want to delete this subtask? This will also delete all comments, files, and checklists associated with it.')) return

  try {
    const response = await apiFetch(`/tasks/${props.taskId}/subtasks/${id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await loadSubtasks()
    }
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    alert('Failed to delete subtask')
  }
}

onMounted(() => {
  loadSubtasks()
  loadStatuses()
  loadUsers()
})
</script>
