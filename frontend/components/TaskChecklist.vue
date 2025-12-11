<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Checklist</h3>
      <button @click="showAddForm = !showAddForm" class="btn-secondary text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>

    <!-- Add Item Form -->
    <div v-if="showAddForm" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
      <input
        v-model="newItemTitle"
        type="text"
        class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mb-3"
        placeholder="Checklist item"
        @keydown.enter="addItem"
      />
      <div class="flex items-center justify-end gap-2">
        <button @click="cancelAdd" class="btn-secondary text-sm">Cancel</button>
        <button @click="addItem" :disabled="!newItemTitle.trim() || loading" class="btn-primary text-sm">
          {{ loading ? 'Adding...' : 'Add' }}
        </button>
      </div>
    </div>

    <!-- Checklist Items -->
    <div v-if="loading && items.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No checklist items yet. Add one to track progress!
    </div>

    <draggable
      v-else
      v-model="items"
      item-key="id"
      handle=".drag-handle"
      @end="onDragEnd"
      class="space-y-2"
    >
      <template #item="{ element: item }">
        <div class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <input
            type="checkbox"
            :checked="item.is_completed"
            @change="toggleItem(item.id, $event.target.checked)"
            class="w-5 h-5 rounded border-gray-300 dark:border-gray-600"
          />
          <div class="flex-1">
            <input
              v-if="editingId === item.id"
              v-model="editTitle"
              type="text"
              class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              @keydown.enter="saveEdit(item.id)"
              @keydown.esc="cancelEdit"
              @blur="saveEdit(item.id)"
            />
            <span
              v-else
              :class="{ 'line-through text-gray-500 dark:text-gray-400': item.is_completed }"
              class="cursor-pointer"
              @dblclick="startEdit(item.id, item.title)"
            >
              {{ item.title }}
            </span>
          </div>
          <button
            @click="deleteItem(item.id)"
            class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>
    </draggable>

    <!-- Progress Bar -->
    <div v-if="items.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="text-gray-600 dark:text-gray-400">Progress</span>
        <span class="font-medium">{{ completedCount }} / {{ items.length }}</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

const props = defineProps<{
  taskId: string
}>()

const { apiFetch } = useApi()

const items = ref([])
const showAddForm = ref(false)
const newItemTitle = ref('')
const loading = ref(false)
const editingId = ref(null)
const editTitle = ref('')

const completedCount = computed(() => items.value.filter((i: any) => i.is_completed).length)
const progressPercent = computed(() => {
  if (items.value.length === 0) return 0
  return Math.round((completedCount.value / items.value.length) * 100)
})

const loadChecklist = async () => {
  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/checklist`)
    items.value = response.data || []
  } catch (error) {
    console.error('Failed to load checklist:', error)
  } finally {
    loading.value = false
  }
}

const addItem = async () => {
  if (!newItemTitle.value.trim() || loading.value) return

  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/checklist`, {
      method: 'POST',
      body: {
        title: newItemTitle.value
      }
    })

    if (response.success) {
      await loadChecklist()
      newItemTitle.value = ''
      showAddForm.value = false
    }
  } catch (error) {
    console.error('Failed to add checklist item:', error)
    alert('Failed to add checklist item')
  } finally {
    loading.value = false
  }
}

const toggleItem = async (itemId: string, isChecked: boolean) => {
  try {
    const response = await apiFetch(`/tasks/${props.taskId}/checklist/${itemId}`, {
      method: 'PATCH',
      body: {
        is_checked: isChecked
      }
    })

    if (response.success) {
      await loadChecklist()
    }
  } catch (error) {
    console.error('Failed to update checklist item:', error)
  }
}

const startEdit = (id: string, title: string) => {
  editingId.value = id
  editTitle.value = title
}

const saveEdit = async (id: string) => {
  if (!editTitle.value.trim()) {
    cancelEdit()
    return
  }

  try {
    const response = await apiFetch(`/tasks/${props.taskId}/checklist/${id}`, {
      method: 'PATCH',
      body: {
        title: editTitle.value
      }
    })

    if (response.success) {
      await loadChecklist()
      cancelEdit()
    }
  } catch (error) {
    console.error('Failed to update checklist item:', error)
  }
}

const cancelEdit = () => {
  editingId.value = null
  editTitle.value = ''
}

const cancelAdd = () => {
  showAddForm.value = false
  newItemTitle.value = ''
}

const deleteItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this item?')) return

  try {
    const response = await apiFetch(`/tasks/${props.taskId}/checklist/${id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await loadChecklist()
    }
  } catch (error) {
    console.error('Failed to delete checklist item:', error)
    alert('Failed to delete checklist item')
  }
}

const onDragEnd = async () => {
  try {
    const priorities = items.value.map((item: any, index: number) => ({
      id: item.id,
      order_index: index + 1
    }))

    await apiFetch(`/tasks/${props.taskId}/checklist/reorder`, {
      method: 'POST',
      body: { priorities }
    })
  } catch (error) {
    console.error('Failed to reorder checklist items:', error)
    // Reload to restore original order on failure
    await loadChecklist()
  }
}

onMounted(() => {
  loadChecklist()
})
</script>

