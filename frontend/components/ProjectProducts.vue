<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Products</h3>
      <button @click="showPicker = !showPicker" class="text-blue-600 hover:text-blue-700 text-sm">
        {{ showPicker ? 'Done' : 'Edit' }}
      </button>
    </div>

    <!-- Current Products -->
    <div v-if="currentProducts.length > 0" class="flex flex-wrap gap-1">
      <span
        v-for="pp in currentProducts"
        :key="pp.id"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      >
        {{ pp.product?.name }}
        <span v-if="pp.is_primary" class="ml-1 text-[10px] opacity-70">(primary)</span>
        <button v-if="showPicker && !pp.is_primary" @click="removeProduct(pp.product?.id)" class="ml-1 hover:opacity-70">×</button>
      </span>
    </div>
    <div v-else class="text-sm text-gray-400">No additional products</div>

    <!-- Product Picker -->
    <div v-if="showPicker" class="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="text-xs text-gray-500 mb-2">Click to add:</div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="product in availableProducts"
          :key="product.id"
          @click="addProduct(product.id)"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        >
          + {{ product.name }}
        </button>
      </div>
      <div v-if="availableProducts.length === 0" class="text-xs text-gray-400">
        All products added
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: string
}>()

const emit = defineEmits(['updated'])

const { apiFetch } = useApi()

const allProducts = ref<any[]>([])
const currentProducts = ref<any[]>([])
const showPicker = ref(false)
const loading = ref(true)

const availableProducts = computed(() => {
  const currentIds = currentProducts.value.map(pp => pp.product?.id || pp.product_id)
  return allProducts.value.filter(p => !currentIds.includes(p.id))
})

const loadProducts = async () => {
  try {
    const response = await apiFetch('/products')
    allProducts.value = response.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadProjectProducts = async () => {
  try {
    const response = await apiFetch(`/projects/${props.projectId}/products`)
    currentProducts.value = response.data || []
  } catch (error) {
    console.error('Failed to load project products:', error)
  } finally {
    loading.value = false
  }
}

const addProduct = async (productId: string) => {
  try {
    await apiFetch(`/projects/${props.projectId}/products`, {
      method: 'POST',
      body: { product_id: productId }
    })
    await loadProjectProducts()
    emit('updated')
  } catch (error) {
    console.error('Failed to add product:', error)
  }
}

const removeProduct = async (productId: string) => {
  try {
    await apiFetch(`/projects/${props.projectId}/products/${productId}`, {
      method: 'DELETE'
    })
    await loadProjectProducts()
    emit('updated')
  } catch (error) {
    console.error('Failed to remove product:', error)
  }
}

onMounted(() => {
  loadProducts()
  loadProjectProducts()
})
</script>
