<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">Approval Workflows</h1>
      <p class="text-gray-600 dark:text-gray-400">Configure approval workflows and steps</p>
    </div>

    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Approval Workflows</h2>
          <button @click="openWorkflowModal()" class="btn btn-primary">
            + Create Workflow
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="workflows.length === 0" class="text-center py-8 text-gray-500">
          No approval workflows configured. Create your first workflow to get started.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="workflow in workflows"
            :key="workflow.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold">{{ workflow.name }}</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded',
                      workflow.is_active
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    ]"
                  >
                    {{ workflow.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div v-if="workflow.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ workflow.description }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <div><strong>Type:</strong> {{ workflow.approval_type === 'sequential' ? 'Sequential' : 'Parallel' }}</div>
                  <div><strong>Steps:</strong> {{ workflow.steps?.length || 0 }} step(s)</div>
                  <div v-if="workflow.applies_to">
                    <strong>Applies To:</strong> {{ workflow.applies_to }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openWorkflowModal(workflow)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteWorkflow(workflow.id)"
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

    <!-- Workflow Modal -->
    <div v-if="showWorkflowModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeWorkflowModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingWorkflow ? 'Edit Workflow' : 'Create Workflow' }}</h3>
        </div>
        <form @submit.prevent="saveWorkflow" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">Workflow Name *</label>
            <input
              v-model="workflowForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Manager Approval Required"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="workflowForm.description"
              class="input"
              rows="3"
              placeholder="Workflow description"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Approval Type *</label>
            <select v-model="workflowForm.approval_type" required class="input">
              <option value="sequential">Sequential (one after another)</option>
              <option value="parallel">Parallel (all at once)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Applies To</label>
            <select v-model="workflowForm.applies_to" class="input">
              <option value="">All Tasks</option>
              <option value="project">Specific Project</option>
              <option value="product">Specific Product</option>
              <option value="status">Specific Status</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Approval Steps *</label>
            <div class="space-y-3">
              <div
                v-for="(step, index) in workflowForm.steps"
                :key="index"
                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="font-medium">Step {{ index + 1 }}</span>
                  <button
                    type="button"
                    @click="removeStep(index)"
                    class="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div class="space-y-2">
                  <input
                    v-model="step.name"
                    type="text"
                    class="input"
                    placeholder="Step name"
                    required
                  />
                  <select v-model="step.approver_type" class="input" required>
                    <option value="role">By Role</option>
                    <option value="team">By Team</option>
                    <option value="user">Specific User</option>
                    <option value="agency">By Agency</option>
                  </select>
                  <input
                    v-model="step.approver_value"
                    type="text"
                    class="input"
                    placeholder="Role/Team/User ID"
                    required
                  />
                </div>
              </div>
              <button type="button" @click="addStep" class="text-sm text-blue-600 dark:text-blue-400">
                + Add Step
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="workflowForm.is_active"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Active</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeWorkflowModal" class="btn btn-secondary">
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

const workflows = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showWorkflowModal = ref(false)
const editingWorkflow = ref<any>(null)

const workflowForm = ref({
  name: '',
  description: '',
  approval_type: 'sequential',
  applies_to: '',
  steps: [] as any[],
  is_active: true
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadWorkflows()
})

const loadWorkflows = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/approval-workflows')
    workflows.value = response.data || []
  } catch (error) {
    console.error('Failed to load workflows:', error)
    workflows.value = []
  } finally {
    loading.value = false
  }
}

const openWorkflowModal = (workflow?: any) => {
  editingWorkflow.value = workflow
  if (workflow) {
    workflowForm.value = {
      name: workflow.name || '',
      description: workflow.description || '',
      approval_type: workflow.approval_type || 'sequential',
      applies_to: workflow.applies_to || '',
      steps: workflow.steps || [],
      is_active: workflow.is_active !== false
    }
  } else {
    workflowForm.value = {
      name: '',
      description: '',
      approval_type: 'sequential',
      applies_to: '',
      steps: [],
      is_active: true
    }
  }
  showWorkflowModal.value = true
}

const closeWorkflowModal = () => {
  showWorkflowModal.value = false
  editingWorkflow.value = null
  workflowForm.value = {
    name: '',
    description: '',
    approval_type: 'sequential',
    applies_to: '',
    steps: [],
    is_active: true
  }
}

const addStep = () => {
  workflowForm.value.steps.push({
    name: '',
    approver_type: 'role',
    approver_value: ''
  })
}

const removeStep = (index: number) => {
  workflowForm.value.steps.splice(index, 1)
}

const saveWorkflow = async () => {
  if (workflowForm.value.steps.length === 0) {
    alert('Please add at least one approval step')
    return
  }

  saving.value = true
  try {
    if (editingWorkflow.value) {
      await apiFetch(`/approval-workflows/${editingWorkflow.value.id}`, {
        method: 'PATCH',
        body: workflowForm.value
      })
    } else {
      await apiFetch('/approval-workflows', {
        method: 'POST',
        body: workflowForm.value
      })
    }
    await loadWorkflows()
    closeWorkflowModal()
  } catch (error) {
    console.error('Failed to save workflow:', error)
    alert('Failed to save workflow')
  } finally {
    saving.value = false
  }
}

const deleteWorkflow = async (id: string) => {
  if (!confirm('Are you sure you want to delete this workflow?')) return
  
  try {
    await apiFetch(`/approval-workflows/${id}`, {
      method: 'DELETE'
    })
    await loadWorkflows()
  } catch (error) {
    console.error('Failed to delete workflow:', error)
    alert('Failed to delete workflow')
  }
}
</script>

