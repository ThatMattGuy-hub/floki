<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Labels</h3>
      <button @click="showPicker = !showPicker" class="text-blue-600 hover:text-blue-700 text-sm">
        {{ showPicker ? 'Done' : 'Edit' }}
      </button>
    </div>

    <!-- Current Labels -->
    <div v-if="currentLabels.length > 0" class="flex flex-wrap gap-1">
      <span
        v-for="tl in currentLabels"
        :key="tl.id"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        :style="{ backgroundColor: tl.label?.color + '20', color: tl.label?.color }"
      >
        {{ tl.label?.name }}
        <button v-if="showPicker" @click="removeLabel(tl.label?.id)" class="ml-1 hover:opacity-70">×</button>
      </span>
    </div>
    <div v-else class="text-sm text-gray-400">No labels</div>

    <!-- Label Picker -->
    <div v-if="showPicker" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="text-xs text-gray-500 mb-2">Click to add:</div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="label in availableLabels"
          :key="label.id"
          @click="addLabel(label)"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
          :style="{ backgroundColor: label.color + '20', color: label.color }"
        >
          + {{ label.name }}
        </button>
      </div>
      <div v-if="availableLabels.length === 0" class="text-xs text-gray-400">
        All labels added or <NuxtLink to="/admin/statuses-labels" class="text-blue-600">create new labels</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
  taskLabels?: any[]
}>()

const emit = defineEmits(['updated'])

const { apiFetch } = useApi()

const allLabels = ref<any[]>([])
const currentLabels = ref<any[]>([])
const showPicker = ref(false)

const availableLabels = computed(() => {
  const currentIds = currentLabels.value.map(tl => tl.label?.id || tl.label_id)
  return allLabels.value.filter(l => !currentIds.includes(l.id))
})

const loadLabels = async () => {
  try {
    const response = await apiFetch('/labels')
    allLabels.value = response.data || []
  } catch (error) {
    console.error('Failed to load labels:', error)
  }
}

const loadTaskLabels = async () => {
  try {
    const response = await apiFetch(`/tasks/${props.taskId}/labels`)
    currentLabels.value = response.data || []
  } catch (error) {
    console.error('Failed to load task labels:', error)
    // Fallback to prop if API fails
    currentLabels.value = props.taskLabels || []
  }
}

const addLabel = async (label: any) => {
  try {
    const response = await apiFetch(`/tasks/${props.taskId}/labels`, {
      method: 'POST',
      body: { label_id: label.id }
    })
    // Immediately add to local state
    currentLabels.value.push({ id: response.data?.id, label })
    emit('updated')
  } catch (error) {
    console.error('Failed to add label:', error)
  }
}

const removeLabel = async (labelId: string) => {
  try {
    await apiFetch(`/tasks/${props.taskId}/labels/${labelId}`, {
      method: 'DELETE'
    })
    // Immediately remove from local state
    currentLabels.value = currentLabels.value.filter(tl => tl.label?.id !== labelId)
    emit('updated')
  } catch (error) {
    console.error('Failed to remove label:', error)
  }
}

onMounted(() => {
  loadLabels()
  loadTaskLabels()
})
</script>
