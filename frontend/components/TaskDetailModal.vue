<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: task?.status?.color || '#6B7280' }"></div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ task?.title }}</h3>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span
                  v-if="task?.status"
                  class="text-sm px-3 py-1 rounded-full"
                  :style="{ backgroundColor: task.status.color + '20', color: task.status.color }"
                >
                  {{ task.status.name }}
                </span>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getPriorityClass(task?.priority)"
                >
                  {{ getPriorityLabel(task?.priority) }}
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
        <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <!-- Task Details Grid -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Project -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Project</h4>
              <p class="text-gray-900 dark:text-gray-100">{{ task?.project?.name || 'N/A' }}</p>
            </div>

            <!-- Product -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product</h4>
              <p class="text-gray-900 dark:text-gray-100">{{ task?.product?.name || 'N/A' }}</p>
            </div>

            <!-- Assignee -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Assignee</h4>
              <div v-if="task?.assignee" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {{ getInitials(task.assignee.full_name || task.assignee.email) }}
                </div>
                <span class="text-gray-900 dark:text-gray-100">{{ task.assignee.full_name || task.assignee.email }}</span>
              </div>
              <p v-else class="text-gray-400">Unassigned</p>
            </div>

            <!-- Due Date -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Due Date</h4>
              <p v-if="task?.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(task.due_date), 'text-gray-900 dark:text-gray-100': !isOverdue(task.due_date) }">
                {{ formatDate(task.due_date) }}
                <span v-if="isOverdue(task.due_date)" class="text-xs ml-2">(Overdue)</span>
              </p>
              <p v-else class="text-gray-400">No due date</p>
            </div>

            <!-- Created By -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Created By</h4>
              <p class="text-gray-900 dark:text-gray-100">
                {{ task?.created_by_user?.full_name || task?.created_by_user?.email || 'Unknown' }}
              </p>
            </div>

            <!-- Created At -->
            <div>
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Created</h4>
              <p class="text-gray-900 dark:text-gray-100">{{ formatDate(task?.created_at) }}</p>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
            <div class="prose dark:prose-invert max-w-none">
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{ task?.description || 'No description provided' }}</p>
            </div>
          </div>

          <!-- Teams & Agencies -->
          <div v-if="(task?.teams && task.teams.length > 0) || (task?.agencies && task.agencies.length > 0)" class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teams & Agencies</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="team in task?.teams || []" 
                :key="`team-${team.team?.id}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ team.team?.name }}
              </span>
              <span 
                v-for="agency in task?.agencies || []" 
                :key="`agency-${agency.agency?.id}`"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ agency.agency?.name }}
              </span>
            </div>
          </div>

          <!-- Labels -->
          <div v-if="task?.labels && task.labels.length > 0" class="mb-6">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Labels</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="labelItem in task.labels" 
                :key="labelItem.label?.id"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :style="{ backgroundColor: labelItem.label?.color + '20', color: labelItem.label?.color }"
              >
                {{ labelItem.label?.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <NuxtLink :to="`/tasks/${task?.id}`" class="btn-secondary" target="_blank">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Full Task
          </NuxtLink>
          <button @click="closeModal" class="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  task: any
}>()

const emit = defineEmits(['close'])

const closeModal = () => {
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

const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
