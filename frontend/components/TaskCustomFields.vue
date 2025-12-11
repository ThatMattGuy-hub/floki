<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Custom Fields</h3>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="customFields.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
      No custom fields defined. <NuxtLink to="/admin/custom-fields" class="text-blue-600 hover:underline">Create one</NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div v-for="field in customFields" :key="field.id" class="space-y-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ field.name }}
          <span v-if="field.is_required" class="text-red-500">*</span>
        </label>
        
        <!-- Text field -->
        <input
          v-if="field.type === 'text' || field.type === 'email'"
          :type="field.type === 'email' ? 'email' : 'text'"
          v-model="fieldValues[field.id]"
          @blur="saveField(field.id)"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          :placeholder="field.description || ''"
        />

        <!-- URL field with clickable link -->
        <div v-else-if="field.type === 'url'" class="space-y-1">
          <input
            type="url"
            v-model="fieldValues[field.id]"
            @blur="saveField(field.id)"
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            :placeholder="field.description || 'https://...'"
          />
          <a
            v-if="fieldValues[field.id]"
            :href="fieldValues[field.id]"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open link
          </a>
        </div>

        <!-- Number field -->
        <input
          v-else-if="field.type === 'number'"
          type="number"
          v-model="fieldValues[field.id]"
          @blur="saveField(field.id)"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          :placeholder="field.description || ''"
        />

        <!-- Date field -->
        <input
          v-else-if="field.type === 'date'"
          type="date"
          v-model="fieldValues[field.id]"
          @change="saveField(field.id)"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        />

        <!-- Checkbox field -->
        <div v-else-if="field.type === 'checkbox'" class="flex items-center">
          <input
            type="checkbox"
            :checked="fieldValues[field.id] === 'true'"
            @change="fieldValues[field.id] = ($event.target as HTMLInputElement).checked ? 'true' : 'false'; saveField(field.id)"
            class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
          />
          <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ field.description }}</span>
        </div>

        <!-- Select field -->
        <select
          v-else-if="field.type === 'select'"
          v-model="fieldValues[field.id]"
          @change="saveField(field.id)"
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
        >
          <option value="">Select...</option>
          <option v-for="opt in getOptions(field)" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <!-- Multi-select field -->
        <div v-else-if="field.type === 'multi_select'" class="space-y-1">
          <div v-for="opt in getOptions(field)" :key="opt" class="flex items-center">
            <input
              type="checkbox"
              :checked="getMultiSelectValues(field.id).includes(opt)"
              @change="toggleMultiSelect(field.id, opt)"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span class="ml-2 text-sm">{{ opt }}</span>
          </div>
        </div>

        <p v-if="field.description && field.type !== 'checkbox'" class="text-xs text-gray-500 dark:text-gray-400">
          {{ field.description }}
        </p>
      </div>
    </div>

    <div v-if="saving" class="text-xs text-gray-500 dark:text-gray-400">Saving...</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
}>()

const { apiFetch } = useApi()

const customFields = ref<any[]>([])
const fieldValues = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)

const loadCustomFields = async () => {
  try {
    // Load all custom field definitions
    const fieldsResponse = await apiFetch('/admin/custom-fields')
    customFields.value = fieldsResponse.data || []

    // Load values for this task
    const valuesResponse = await apiFetch(`/tasks/${props.taskId}/custom-fields`)
    const values = valuesResponse.data || []

    // Map values by custom_field_id
    const valueMap: Record<string, string> = {}
    values.forEach((v: any) => {
      valueMap[v.custom_field?.id || v.custom_field_id] = v.value || ''
    })
    fieldValues.value = valueMap
  } catch (error) {
    console.error('Failed to load custom fields:', error)
  } finally {
    loading.value = false
  }
}

const saveField = async (fieldId: string) => {
  try {
    saving.value = true
    await apiFetch(`/tasks/${props.taskId}/custom-fields`, {
      method: 'PUT',
      body: {
        values: [{ custom_field_id: fieldId, value: fieldValues.value[fieldId] || '' }]
      }
    })
  } catch (error) {
    console.error('Failed to save custom field:', error)
  } finally {
    saving.value = false
  }
}

const getOptions = (field: any): string[] => {
  if (!field.options) return []
  if (Array.isArray(field.options)) return field.options
  if (typeof field.options === 'string') {
    try {
      return JSON.parse(field.options)
    } catch {
      return field.options.split(',').map((s: string) => s.trim())
    }
  }
  return []
}

const getMultiSelectValues = (fieldId: string): string[] => {
  const val = fieldValues.value[fieldId]
  if (!val) return []
  try {
    return JSON.parse(val)
  } catch {
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }
}

const toggleMultiSelect = (fieldId: string, option: string) => {
  const current = getMultiSelectValues(fieldId)
  const index = current.indexOf(option)
  if (index === -1) {
    current.push(option)
  } else {
    current.splice(index, 1)
  }
  fieldValues.value[fieldId] = JSON.stringify(current)
  saveField(fieldId)
}

onMounted(() => {
  loadCustomFields()
})
</script>
