<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">Welcome back, {{ authStore.user?.full_name }}!</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Stats Cards -->
      <NuxtLink to="/tasks" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer block">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</h3>
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-3xl font-bold">{{ stats.totalTasks }}</p>
      </NuxtLink>

      <NuxtLink to="/tasks?status_filter=in_progress" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer block">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</h3>
          <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-3xl font-bold">{{ stats.inProgress }}</p>
      </NuxtLink>

      <NuxtLink to="/tasks?status_filter=completed" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer block">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</h3>
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-3xl font-bold">{{ stats.completed }}</p>
      </NuxtLink>

      <NuxtLink to="/tasks?status_filter=overdue" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer block">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</h3>
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-3xl font-bold">{{ stats.overdue }}</p>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Tasks -->
      <div class="card p-6">
        <h2 class="text-xl font-bold mb-4">Recent Tasks</h2>
        <div class="space-y-3">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="recentTasks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks found
          </div>
          <div v-else v-for="task in recentTasks" :key="task.id" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" @click="router.push(`/tasks/${task.id}`)">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: task.status?.color || '#6B7280' }"></div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ task.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.project?.name }}</p>
            </div>
            <span class="badge badge-primary">{{ task.status?.name || 'No Status' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card p-6">
        <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <button v-if="authStore.canCreateTasks" class="w-full flex items-center gap-3 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-left">
            <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <div>
              <p class="font-medium">Create New Task</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Add a new task to your project</p>
            </div>
          </button>

          <NuxtLink to="/tasks" class="block w-full">
            <div class="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p class="font-medium">View All Tasks</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Browse and manage all tasks</p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink to="/reports" class="block w-full">
            <div class="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <p class="font-medium">View Reports</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Check project insights</p>
              </div>
            </div>
          </NuxtLink>
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
const tasksStore = useTasksStore()
const router = useRouter()

const loading = ref(true)
const recentTasks = ref([])
const stats = ref({
  totalTasks: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0
})

onMounted(async () => {
  try {
    await tasksStore.fetchTasks({ limit: 100 }) // Fetch more tasks to calculate accurate stats
    
    // Filter tasks to only include those from "ongoing" projects
    const ongoingTasks = tasksStore.tasks.filter(t => t.project?.status === 'ongoing')
    
    // Show recent tasks from ongoing projects only
    recentTasks.value = ongoingTasks.slice(0, 5)
    
    // Calculate stats only for tasks in ongoing projects
    stats.value.totalTasks = ongoingTasks.length
    stats.value.inProgress = ongoingTasks.filter(t => t.status?.name === 'In Progress').length
    stats.value.completed = ongoingTasks.filter(t => t.status?.is_closed).length
    stats.value.overdue = ongoingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.status?.is_closed).length
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

