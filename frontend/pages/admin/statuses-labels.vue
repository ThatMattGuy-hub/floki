<template>
  <div class="p-8">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
            ← Back to Admin
          </NuxtLink>
          <h1 class="text-3xl font-bold mb-2">Statuses & Labels</h1>
          <p class="text-gray-600 dark:text-gray-400">Configure workflow statuses and label categories</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Task Statuses Section -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Task Statuses</h2>
            <button
              @click="openStatusModal()"
              class="btn btn-primary"
            >
              + Add Status
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingStatuses" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="statuses.length === 0" class="text-center py-8 text-gray-500">
            No statuses configured
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="status in statuses"
              :key="status.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: status.color }"
                ></div>
                <div>
                  <div class="font-medium">{{ status.name }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Order: {{ status.order_index }}
                    <span v-if="status.is_default" class="ml-2 text-blue-600 dark:text-blue-400">(Default)</span>
                    <span v-if="status.is_closed" class="ml-2 text-gray-600 dark:text-gray-400">(Closed)</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openStatusModal(status)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteStatus(status.id)"
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

      <!-- Labels Section -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Labels</h2>
            <button
              @click="openLabelModal()"
              class="btn btn-primary"
            >
              + Add Label
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingLabels" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="labels.length === 0" class="text-center py-8 text-gray-500">
            No labels configured
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="label in labels"
              :key="label.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: label.color }"
                ></div>
                <div>
                  <div class="font-medium">{{ label.name }}</div>
                  <div v-if="label.description" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ label.description }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openLabelModal(label)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteLabel(label.id)"
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

      <!-- Project Statuses Section -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Project Statuses</h2>
            <button
              @click="openProjectStatusModal()"
              class="btn btn-primary"
            >
              + Add Status
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="loadingProjectStatuses" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else-if="projectStatuses.length === 0" class="text-center py-8 text-gray-500">
            No project statuses configured
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="status in projectStatuses"
              :key="status.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: status.color }"
                ></div>
                <div>
                  <div class="font-medium">{{ status.name }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ status.slug }}
                    <span v-if="status.is_default" class="ml-2 text-blue-600 dark:text-blue-400">(Default)</span>
                    <span v-if="status.is_closed" class="ml-2 text-green-600 dark:text-green-400">(Closed)</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openProjectStatusModal(status)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteProjectStatus(status.id)"
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
    </div>

    <!-- Status Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeStatusModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingStatus ? 'Edit Status' : 'Add Status' }}</h3>
        </div>
        <form @submit.prevent="saveStatus" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input
              v-model="statusForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., In Progress"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Color</label>
            <div class="flex items-center gap-3">
              <input
                v-model="statusForm.color"
                type="color"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                v-model="statusForm.color"
                type="text"
                required
                class="input flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Order Index</label>
            <input
              v-model.number="statusForm.order_index"
              type="number"
              required
              min="0"
              class="input"
            />
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="statusForm.is_default"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Default Status</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="statusForm.is_closed"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Closed Status</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeStatusModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Label Modal -->
    <div v-if="showLabelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeLabelModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingLabel ? 'Edit Label' : 'Add Label' }}</h3>
        </div>
        <form @submit.prevent="saveLabel" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input
              v-model="labelForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Bug, Feature"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Color</label>
            <div class="flex items-center gap-3">
              <input
                v-model="labelForm.color"
                type="color"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                v-model="labelForm.color"
                type="text"
                required
                class="input flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              v-model="labelForm.description"
              class="input"
              rows="3"
              placeholder="Label description"
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeLabelModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Project Status Modal -->
    <div v-if="showProjectStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeProjectStatusModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingProjectStatus ? 'Edit Project Status' : 'Add Project Status' }}</h3>
        </div>
        <form @submit.prevent="saveProjectStatus" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input
              v-model="projectStatusForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., In Progress"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Slug (URL-safe identifier)</label>
            <input
              v-model="projectStatusForm.slug"
              type="text"
              required
              class="input"
              placeholder="e.g., in_progress"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Color</label>
            <div class="flex items-center gap-3">
              <input
                v-model="projectStatusForm.color"
                type="color"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                v-model="projectStatusForm.color"
                type="text"
                required
                class="input flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <input
              v-model="projectStatusForm.description"
              type="text"
              class="input"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Order Index</label>
            <input
              v-model.number="projectStatusForm.order_index"
              type="number"
              required
              min="0"
              class="input"
            />
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="projectStatusForm.is_default"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Default Status</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                v-model="projectStatusForm.is_closed"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Closed Status</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeProjectStatusModal" class="btn btn-secondary">
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

const statuses = ref<any[]>([])
const labels = ref<any[]>([])
const projectStatuses = ref<any[]>([])
const loadingStatuses = ref(false)
const loadingLabels = ref(false)
const loadingProjectStatuses = ref(false)
const saving = ref(false)
const showStatusModal = ref(false)
const showLabelModal = ref(false)
const showProjectStatusModal = ref(false)
const editingStatus = ref<any>(null)
const editingLabel = ref<any>(null)
const editingProjectStatus = ref<any>(null)

const statusForm = ref({
  name: '',
  color: '#3B82F6',
  order_index: 0,
  is_default: false,
  is_closed: false
})

const labelForm = ref({
  name: '',
  color: '#3B82F6',
  description: ''
})

const projectStatusForm = ref({
  name: '',
  slug: '',
  color: '#3B82F6',
  description: '',
  order_index: 0,
  is_default: false,
  is_closed: false
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadStatuses()
  loadLabels()
  loadProjectStatuses()
})

const loadStatuses = async () => {
  loadingStatuses.value = true
  try {
    const response = await apiFetch('/statuses')
    statuses.value = response.data || []
  } catch (error) {
    console.error('Failed to load statuses:', error)
  } finally {
    loadingStatuses.value = false
  }
}

const loadLabels = async () => {
  loadingLabels.value = true
  try {
    const response = await apiFetch('/labels')
    labels.value = response.data || []
  } catch (error) {
    console.error('Failed to load labels:', error)
    // If endpoint doesn't exist yet, set empty array
    labels.value = []
  } finally {
    loadingLabels.value = false
  }
}

const openStatusModal = (status?: any) => {
  editingStatus.value = status
  if (status) {
    statusForm.value = { ...status }
  } else {
    statusForm.value = {
      name: '',
      color: '#3B82F6',
      order_index: statuses.value.length,
      is_default: false,
      is_closed: false
    }
  }
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
  editingStatus.value = null
  statusForm.value = {
    name: '',
    color: '#3B82F6',
    order_index: 0,
    is_default: false,
    is_closed: false
  }
}

const saveStatus = async () => {
  saving.value = true
  try {
    if (editingStatus.value) {
      await apiFetch(`/statuses/${editingStatus.value.id}`, {
        method: 'PATCH',
        body: statusForm.value
      })
    } else {
      await apiFetch('/statuses', {
        method: 'POST',
        body: statusForm.value
      })
    }
    await loadStatuses()
    closeStatusModal()
  } catch (error) {
    console.error('Failed to save status:', error)
    alert('Failed to save status')
  } finally {
    saving.value = false
  }
}

const deleteStatus = async (id: string) => {
  if (!confirm('Are you sure you want to delete this status?')) return
  
  try {
    await apiFetch(`/statuses/${id}`, {
      method: 'DELETE'
    })
    await loadStatuses()
  } catch (error) {
    console.error('Failed to delete status:', error)
    alert('Failed to delete status')
  }
}

const openLabelModal = (label?: any) => {
  editingLabel.value = label
  if (label) {
    labelForm.value = { ...label }
  } else {
    labelForm.value = {
      name: '',
      color: '#3B82F6',
      description: ''
    }
  }
  showLabelModal.value = true
}

const closeLabelModal = () => {
  showLabelModal.value = false
  editingLabel.value = null
  labelForm.value = {
    name: '',
    color: '#3B82F6',
    description: ''
  }
}

const saveLabel = async () => {
  saving.value = true
  try {
    if (editingLabel.value) {
      await apiFetch(`/labels/${editingLabel.value.id}`, {
        method: 'PATCH',
        body: labelForm.value
      })
    } else {
      await apiFetch('/labels', {
        method: 'POST',
        body: labelForm.value
      })
    }
    await loadLabels()
    closeLabelModal()
  } catch (error) {
    console.error('Failed to save label:', error)
    alert('Failed to save label')
  } finally {
    saving.value = false
  }
}

const deleteLabel = async (id: string) => {
  if (!confirm('Are you sure you want to delete this label?')) return
  
  try {
    await apiFetch(`/labels/${id}`, {
      method: 'DELETE'
    })
    await loadLabels()
  } catch (error) {
    console.error('Failed to delete label:', error)
    alert('Failed to delete label')
  }
}

// Project Statuses
const loadProjectStatuses = async () => {
  loadingProjectStatuses.value = true
  try {
    const response = await apiFetch('/admin/project-statuses')
    projectStatuses.value = response.data || []
  } catch (error) {
    console.error('Failed to load project statuses:', error)
    projectStatuses.value = []
  } finally {
    loadingProjectStatuses.value = false
  }
}

const openProjectStatusModal = (status?: any) => {
  editingProjectStatus.value = status
  if (status) {
    projectStatusForm.value = { ...status }
  } else {
    projectStatusForm.value = {
      name: '',
      slug: '',
      color: '#3B82F6',
      description: '',
      order_index: projectStatuses.value.length + 1,
      is_default: false,
      is_closed: false
    }
  }
  showProjectStatusModal.value = true
}

const closeProjectStatusModal = () => {
  showProjectStatusModal.value = false
  editingProjectStatus.value = null
  projectStatusForm.value = {
    name: '',
    slug: '',
    color: '#3B82F6',
    description: '',
    order_index: 0,
    is_default: false,
    is_closed: false
  }
}

const saveProjectStatus = async () => {
  saving.value = true
  try {
    // Auto-generate slug if empty
    if (!projectStatusForm.value.slug) {
      projectStatusForm.value.slug = projectStatusForm.value.name.toLowerCase().replace(/\s+/g, '_')
    }
    
    if (editingProjectStatus.value) {
      await apiFetch(`/admin/project-statuses/${editingProjectStatus.value.id}`, {
        method: 'PATCH',
        body: projectStatusForm.value
      })
    } else {
      await apiFetch('/admin/project-statuses', {
        method: 'POST',
        body: projectStatusForm.value
      })
    }
    await loadProjectStatuses()
    closeProjectStatusModal()
  } catch (error) {
    console.error('Failed to save project status:', error)
    alert('Failed to save project status')
  } finally {
    saving.value = false
  }
}

const deleteProjectStatus = async (id: string) => {
  if (!confirm('Are you sure you want to delete this project status?')) return
  
  try {
    await apiFetch(`/admin/project-statuses/${id}`, {
      method: 'DELETE'
    })
    await loadProjectStatuses()
  } catch (error: any) {
    console.error('Failed to delete project status:', error)
    alert(error.message || 'Failed to delete project status')
  }
}
</script>

