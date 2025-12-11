<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Products</h1>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">
        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Product
      </button>
    </div>

    <!-- Filters, Sort, Group By -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Search -->
        <div class="lg:col-span-3">
          <label class="block text-sm font-medium mb-2">Search</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search products..." 
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>

        <!-- Owner Filter -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-2">Owner</label>
          <select v-model="filters.owner_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">All Owners</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.full_name || user.email }}
            </option>
          </select>
        </div>

        <!-- Created From -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-2">Created From</label>
          <input 
            v-model="filters.created_from" 
            type="date" 
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>

        <!-- Created To -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-2">Created To</label>
          <input 
            v-model="filters.created_to" 
            type="date" 
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>

        <!-- Sort By -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-2">Sort By</label>
          <select v-model="sortBy" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="name">Name</option>
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
          </select>
        </div>

        <!-- Sort Order -->
        <div class="lg:col-span-1">
          <label class="block text-sm font-medium mb-2">Order</label>
          <select v-model="sortOrder" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>

        <!-- Group By -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium mb-2">Group By</label>
          <select v-model="groupBy" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <option value="">None</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <!-- Clear Button -->
        <div class="lg:col-span-1 flex items-end">
          <button @click="clearFilters" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Clear
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-4">No products found</p>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">Create Your First Product</button>
    </div>

    <!-- Grouped View -->
    <div v-else-if="groupBy" class="space-y-6">
      <div v-for="(group, groupKey) in groupedProducts" :key="groupKey" class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ getGroupLabel(groupKey) }} ({{ group.length }})
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="product in group" 
              :key="product.id" 
              class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold mb-2">{{ product.name }}</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">{{ product.description || 'No description' }}</p>
                </div>
                <div v-if="canEdit" class="relative">
                  <button @click="toggleMenu(product.id)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <div v-if="activeMenu === product.id" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                    <button @click="editProduct(product)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg">Edit</button>
                    <button @click="deleteProduct(product)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg text-red-600 dark:text-red-400">Delete</button>
                  </div>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Owner</span>
                  <span class="font-medium">{{ product.owner?.full_name || product.owner?.email || 'Unknown' }}</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-2">
                  <span class="text-gray-500 dark:text-gray-400">Projects</span>
                  <NuxtLink :to="`/projects?product_id=${product.id}`" class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    View Projects →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ungrouped View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{{ product.description || 'No description' }}</p>
          </div>
          <div v-if="canEdit" class="relative">
            <button @click="toggleMenu(product.id)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div v-if="activeMenu === product.id" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              <button @click="editProduct(product)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg">Edit</button>
              <button @click="deleteProduct(product)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg text-red-600 dark:text-red-400">Delete</button>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Owner</span>
            <span class="font-medium">{{ product.owner?.full_name || product.owner?.email || 'Unknown' }}</span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-500 dark:text-gray-400">Projects</span>
            <NuxtLink :to="`/projects?product_id=${product.id}`" class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View Projects →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <ProductCreateModal :show="showCreateModal" :product="selectedProduct" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const loading = ref(true)
const products = ref([])
const users = ref([])
const showCreateModal = ref(false)
const selectedProduct = ref(null)
const activeMenu = ref(null)
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const groupBy = ref('')

const filters = ref({
  owner_id: '',
  created_from: '',
  created_to: ''
})

const canCreate = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const canEdit = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const filteredProducts = computed(() => {
  let result = products.value

  // Client-side search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((p: any) => 
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }

  return result
})

const groupedProducts = computed(() => {
  if (!groupBy.value) return []
  
  const groups: Record<string, any[]> = {}
  
  filteredProducts.value.forEach((product: any) => {
    let key = 'Unknown'
    
    if (groupBy.value === 'owner') {
      key = product.owner ? (product.owner.full_name || product.owner.email) : 'Unassigned'
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(product)
  })
  
  return groups
})

const getGroupLabel = (key: string) => {
  if (groupBy.value === 'owner') return key
  return key
}

const loadProducts = async () => {
  try {
    loading.value = true
    const params: any = {
      ...filters.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })
    
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `/products?${queryString}` : '/products'
    
    const response = await apiFetch(url)
    products.value = response.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const editProduct = (product: any) => {
  selectedProduct.value = product
  showCreateModal.value = true
  activeMenu.value = null
}

const deleteProduct = async (product: any) => {
  if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    const response = await apiFetch(`/products/${product.id}`, { method: 'DELETE' })
    if (response.success) {
      products.value = products.value.filter((p: any) => p.id !== product.id)
    }
  } catch (error) {
    console.error('Failed to delete product:', error)
    alert('Failed to delete product')
  }
  activeMenu.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  selectedProduct.value = null
}

const handleSaved = () => {
  loadProducts()
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    owner_id: '',
    created_from: '',
    created_to: ''
  }
  sortBy.value = 'name'
  sortOrder.value = 'asc'
  groupBy.value = ''
  loadProducts()
}

watch([filters, sortBy, sortOrder], () => {
  loadProducts()
}, { deep: true })

onMounted(() => {
  loadUsers()
  loadProducts()
  
  // Close menu when clicking outside
  document.addEventListener('click', (e: any) => {
    if (!e.target.closest('.relative')) {
      activeMenu.value = null
    }
  })
})
</script>
