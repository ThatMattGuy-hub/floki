<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ agency ? 'Edit Agency' : 'Create New Agency' }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Agency Name *</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="e.g., Design Agency Inc." />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Agency description"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Contact Email</label>
            <input v-model="form.contact_email" type="email" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="contact@agency.com" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Contact Phone</label>
            <input v-model="form.contact_phone" type="tel" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="+1 234 567 8900" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            {{ loading ? 'Saving...' : (agency ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  agency?: any
}>()

const emit = defineEmits(['close', 'saved'])

const { apiFetch } = useApi()
const loading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  description: '',
  contact_email: '',
  contact_phone: ''
})

watch(() => props.agency, (newAgency) => {
  if (newAgency) {
    form.value = {
      name: newAgency.name || '',
      description: newAgency.description || '',
      contact_email: newAgency.contact_email || '',
      contact_phone: newAgency.contact_phone || ''
    }
  } else {
    form.value = {
      name: '',
      description: '',
      contact_email: '',
      contact_phone: ''
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    let response
    if (props.agency) {
      response = await apiFetch(`/agencies/${props.agency.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      response = await apiFetch('/agencies', {
        method: 'POST',
        body: form.value
      })
    }

    if (response.success) {
      emit('saved', response.data)
      emit('close')
      form.value = { name: '', description: '', contact_email: '', contact_phone: '' }
    } else {
      error.value = response.error || 'Failed to save agency'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save agency'
  } finally {
    loading.value = false
  }
}
</script>

