<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Watchers</h3>
      <button @click="showAddWatcher = !showAddWatcher" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </div>

    <!-- Add Watcher -->
    <div v-if="showAddWatcher" class="mb-3">
      <select
        v-model="selectedUserId"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
        @change="addWatcher"
      >
        <option value="">Select user...</option>
        <option v-for="user in availableUsers" :key="user.id" :value="user.id">
          {{ user.full_name || user.email }}
        </option>
      </select>
    </div>

    <!-- Watchers List -->
    <div v-if="loading && watchers.length === 0" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="watchers.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      No watchers yet
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="watcher in watchers"
        :key="watcher.user?.id"
        class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm"
      >
        <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
          {{ getInitials(watcher.user?.full_name || watcher.user?.email) }}
        </div>
        <span>{{ watcher.user?.full_name || watcher.user?.email }}</span>
        <button
          @click="removeWatcher(watcher.user?.id)"
          class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
}>()

const { apiFetch } = useApi()

const watchers = ref([])
const availableUsers = ref([])
const showAddWatcher = ref(false)
const selectedUserId = ref('')
const loading = ref(false)

const loadWatchers = async () => {
  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/watchers`)
    watchers.value = response.data || []
  } catch (error) {
    console.error('Failed to load watchers:', error)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    availableUsers.value = (response.data || []).filter((u: any) => 
      !watchers.value.some((w: any) => w.user?.id === u.id)
    )
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const addWatcher = async () => {
  if (!selectedUserId.value || loading.value) return

  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/watchers`, {
      method: 'POST',
      body: {
        user_id: selectedUserId.value
      }
    })

    if (response.success) {
      await loadWatchers()
      selectedUserId.value = ''
      showAddWatcher.value = false
    }
  } catch (error) {
    console.error('Failed to add watcher:', error)
    alert('Failed to add watcher')
  } finally {
    loading.value = false
  }
}

const removeWatcher = async (userId: string) => {
  try {
    const response = await apiFetch(`/tasks/${props.taskId}/watchers/${userId}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await loadWatchers()
    }
  } catch (error) {
    console.error('Failed to remove watcher:', error)
    alert('Failed to remove watcher')
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

watch(showAddWatcher, (newVal) => {
  if (newVal) {
    loadUsers()
  }
})

onMounted(() => {
  loadWatchers()
})
</script>

