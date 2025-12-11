<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">SLA Rules</h1>
      <p class="text-gray-600 dark:text-gray-400">Define SLA policies and monitoring rules</p>
    </div>

    <div class="card">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">SLA Policies</h2>
          <button @click="openRuleModal()" class="btn btn-primary">
            + Create SLA Rule
          </button>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else-if="slaRules.length === 0" class="text-center py-8 text-gray-500">
          No SLA rules configured. Create your first SLA rule to get started.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="rule in slaRules"
            :key="rule.id"
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold">{{ rule.name }}</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded',
                      rule.is_active
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    ]"
                  >
                    {{ rule.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ rule.description }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>Threshold:</strong> {{ rule.threshold_value }} {{ rule.threshold_unit }}</div>
                  <div><strong>Applies To:</strong> {{ rule.applies_to || 'All Tasks' }}</div>
                  <div v-if="rule.alert_before_hours">
                    <strong>Alert Before:</strong> {{ rule.alert_before_hours }} hours
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openRuleModal(rule)"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteRule(rule.id)"
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

    <!-- SLA Rule Modal -->
    <div v-if="showRuleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeRuleModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold">{{ editingRule ? 'Edit SLA Rule' : 'Create SLA Rule' }}</h3>
        </div>
        <form @submit.prevent="saveRule" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Rule Name *</label>
            <input
              v-model="ruleForm.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Task Response Time SLA"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="ruleForm.description"
              class="input"
              rows="3"
              placeholder="Rule description"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Threshold Value *</label>
              <input
                v-model.number="ruleForm.threshold_value"
                type="number"
                required
                min="1"
                class="input"
                placeholder="24"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Threshold Unit *</label>
              <select v-model="ruleForm.threshold_unit" required class="input">
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Applies To</label>
            <select v-model="ruleForm.applies_to" class="input">
              <option value="">All Tasks</option>
              <option value="project">Specific Project</option>
              <option value="product">Specific Product</option>
              <option value="status">Specific Status</option>
              <option value="priority">Specific Priority</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Alert Before Breach (hours)</label>
            <input
              v-model.number="ruleForm.alert_before_hours"
              type="number"
              min="0"
              class="input"
              placeholder="e.g., 2 (alert 2 hours before breach)"
            />
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input
                v-model="ruleForm.is_active"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm">Active</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeRuleModal" class="btn btn-secondary">
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

const slaRules = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const showRuleModal = ref(false)
const editingRule = ref<any>(null)

const ruleForm = ref({
  name: '',
  description: '',
  threshold_value: 24,
  threshold_unit: 'hours',
  applies_to: '',
  alert_before_hours: 0,
  is_active: true
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadRules()
})

const loadRules = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/sla-rules')
    slaRules.value = response.data || []
  } catch (error) {
    console.error('Failed to load SLA rules:', error)
    slaRules.value = []
  } finally {
    loading.value = false
  }
}

const openRuleModal = (rule?: any) => {
  editingRule.value = rule
  if (rule) {
    ruleForm.value = { ...rule }
  } else {
    ruleForm.value = {
      name: '',
      description: '',
      threshold_value: 24,
      threshold_unit: 'hours',
      applies_to: '',
      alert_before_hours: 0,
      is_active: true
    }
  }
  showRuleModal.value = true
}

const closeRuleModal = () => {
  showRuleModal.value = false
  editingRule.value = null
  ruleForm.value = {
    name: '',
    description: '',
    threshold_value: 24,
    threshold_unit: 'hours',
    applies_to: '',
    alert_before_hours: 0,
    is_active: true
  }
}

const saveRule = async () => {
  saving.value = true
  try {
    if (editingRule.value) {
      await apiFetch(`/sla-rules/${editingRule.value.id}`, {
        method: 'PATCH',
        body: ruleForm.value
      })
    } else {
      await apiFetch('/sla-rules', {
        method: 'POST',
        body: ruleForm.value
      })
    }
    await loadRules()
    closeRuleModal()
  } catch (error) {
    console.error('Failed to save SLA rule:', error)
    alert('Failed to save SLA rule')
  } finally {
    saving.value = false
  }
}

const deleteRule = async (id: string) => {
  if (!confirm('Are you sure you want to delete this SLA rule?')) return
  
  try {
    await apiFetch(`/sla-rules/${id}`, {
      method: 'DELETE'
    })
    await loadRules()
  } catch (error) {
    console.error('Failed to delete SLA rule:', error)
    alert('Failed to delete SLA rule')
  }
}
</script>

