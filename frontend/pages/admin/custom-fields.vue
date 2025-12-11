<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">Custom Fields</h1>
      <p class="text-gray-600 dark:text-gray-400">Define custom field templates for tasks</p>
    </div>

    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Custom Field Library</h2>
          <button @click="openFieldModal()" class="btn btn-primary">
            + Add Custom Field
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="customFields.length === 0" class="text-center py-8 text-gray-500">
          No custom fields configured. Create your first custom field to get started.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="field in customFields"
            :key="field.id"
            class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-medium">{{ field.name }}</span>
                <span class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700">
                  {{ field.type }}
                </span>
                <span v-if="field.is_internal_only" class="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  Internal Only
                </span>
              </div>
              <div v-if="field.description" class="text-sm text-gray-500 dark:text-gray-400">
                {{ field.description }}
              </div>
              <div v-if="field.options && field.options.length > 0" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Options: {{ field.options.join(', ') }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="openFieldModal(field)"
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteField(field.id)"
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Modal -->
    <div v-if="showFieldModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeFieldModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingField ? 'Edit Custom Field' : 'Add Custom Field' }}</h3>
        </div>
        <form @submit.prevent="saveField" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Field Name *</label>
            <input
              v-model="fieldForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Budget, Priority Level"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Field Type *</label>
            <select v-model="fieldForm.type" required class="input">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select (Single)</option>
              <option value="multiselect">Multi-Select</option>
              <option value="user">User</option>
              <option value="team">Team</option>
              <option value="url">URL</option>
              <option value="currency">Currency</option>
              <option value="files">Files</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div v-if="fieldForm.type === 'select' || fieldForm.type === 'multiselect'">
            <label class="block text-sm font-medium mb-2">Options (one per line) *</label>
            <textarea
              v-model="optionsText"
              class="input"
              rows="4"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              required
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter one option per line</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="fieldForm.description"
              class="input"
              rows="3"
              placeholder="Field description"
            ></textarea>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="fieldForm.is_internal_only"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Internal Only (hidden from External Agencies)</span>
            </label>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="fieldForm.is_required"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Required Field</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeFieldModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const customFields = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showFieldModal = ref(false)
const editingField = ref<any>(null)
const optionsText = ref('')

const fieldForm = ref({
  name: '',
  type: 'text',
  description: '',
  is_internal_only: false,
  is_required: false,
  options: [] as string[]
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadFields()
})

const loadFields = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/admin/custom-fields')
    customFields.value = response.data || []
  } catch (error) {
    console.error('Failed to load custom fields:', error)
    customFields.value = []
  } finally {
    loading.value = false
  }
}

const openFieldModal = (field?: any) => {
  editingField.value = field
  if (field) {
    fieldForm.value = { ...field }
    optionsText.value = field.options ? field.options.join('\n') : ''
  } else {
    fieldForm.value = {
      name: '',
      type: 'text',
      description: '',
      is_internal_only: false,
      is_required: false,
      options: []
    }
    optionsText.value = ''
  }
  showFieldModal.value = true
}

const closeFieldModal = () => {
  showFieldModal.value = false
  editingField.value = null
  fieldForm.value = {
    name: '',
    type: 'text',
    description: '',
    is_internal_only: false,
    is_required: false,
    options: []
  }
  optionsText.value = ''
}

const saveField = async () => {
  saving.value = true
  try {
    const formData = { ...fieldForm.value }
    
    if (formData.type === 'select' || formData.type === 'multiselect') {
      formData.options = optionsText.value.split('\n').filter(opt => opt.trim())
    } else {
      formData.options = []
    }

    if (editingField.value) {
      await apiFetch(`/admin/custom-fields/${editingField.value.id}`, {
        method: 'PATCH',
        body: formData
      })
    } else {
      await apiFetch('/admin/custom-fields', {
        method: 'POST',
        body: formData
      })
    }
    await loadFields()
    closeFieldModal()
  } catch (error) {
    console.error('Failed to save custom field:', error)
    alert('Failed to save custom field')
  } finally {
    saving.value = false
  }
}

const deleteField = async (id: string) => {
  if (!confirm('Are you sure you want to delete this custom field?')) return
  
  try {
    await apiFetch(`/admin/custom-fields/${id}`, {
      method: 'DELETE'
    })
    await loadFields()
  } catch (error) {
    console.error('Failed to delete custom field:', error)
    alert('Failed to delete custom field')
  }
}
</script>

