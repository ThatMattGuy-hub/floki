<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ product ? 'Edit Product' : 'Create New Product' }}</h2>
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
          <label class="block text-sm font-medium mb-2">Product Name *</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="e.g., Website, Mobile App" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Product description"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Owner *</label>
          <select v-model="form.owner_id" required class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">Select owner</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.full_name || user.email }}
            </option>
          </select>
        </div>

        <div v-if="product" class="text-sm text-gray-500 dark:text-gray-400">
          <p>Created: {{ formatDate(product.created_at) }}</p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            {{ loading ? 'Saving...' : (product ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  product?: any
}>()

const emit = defineEmits(['close', 'saved'])

const { apiFetch } = useApi()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const users = ref([])

const form = ref({
  name: '',
  description: '',
  owner_id: ''
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      owner_id: newProduct.owner_id || newProduct.owner?.id || ''
    }
  } else {
    form.value = {
      name: '',
      description: '',
      owner_id: authStore.user?.id || ''
    }
  }
}, { immediate: true })

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadUsers()
  }
})

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    let response
    if (props.product) {
      response = await apiFetch(`/products/${props.product.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      response = await apiFetch('/products', {
        method: 'POST',
        body: form.value
      })
    }

    if (response.success) {
      emit('saved', response.data)
      emit('close')
      form.value = { name: '', description: '', owner_id: '' }
    } else {
      error.value = response.error || 'Failed to save product'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save product'
  } finally {
    loading.value = false
  }
}
</script>

