<template>
  <div class="p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Product Roadmap</h1>
      <p class="text-gray-600 dark:text-gray-400">Visualize project timelines across your products</p>
    </div>

    <!-- Filters & Controls -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Product Filter -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium mb-1">Product</label>
          <select v-model="selectedProduct" class="input" @change="loadProjects">
            <option value="">All Products</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="w-[160px]">
          <label class="block text-sm font-medium mb-1">Status</label>
          <select v-model="selectedStatus" class="input">
            <option value="">All Statuses</option>
            <option v-for="status in projectStatuses" :key="status.slug" :value="status.slug">
              {{ status.name }}
            </option>
          </select>
        </div>

        <!-- Time Range -->
        <div class="w-[160px]">
          <label class="block text-sm font-medium mb-1">Time Range</label>
          <select v-model="timeRange" class="input">
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="quarter">This Quarter</option>
            <option value="halfyear">6 Months</option>
            <option value="9months">9 Months</option>
            <option value="year">This Year</option>
            <option value="next12">Next 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <!-- Zoom -->
        <div class="w-[140px]">
          <label class="block text-sm font-medium mb-1">Zoom</label>
          <select v-model="zoomLevel" class="input">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>

        <!-- Toggle Options -->
        <div class="flex items-center gap-4 ml-auto">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="showProgress" class="rounded" />
            Show Progress
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="showMilestones" class="rounded" />
            Show Milestones
          </label>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProjects.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-semibold mb-2">No projects with dates</h3>
      <p class="text-gray-500 mb-4">Add start and end dates to your projects to see them on the roadmap</p>
      <NuxtLink to="/projects" class="btn btn-primary">Go to Projects</NuxtLink>
    </div>

    <!-- Roadmap Timeline -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <div :style="{ minWidth: timelineWidth + 'px' }">
        <!-- Timeline Header -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-20">
          <!-- Project Names Column -->
          <div class="w-[280px] min-w-[280px] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-3 font-semibold sticky left-0 z-30">
            Projects ({{ filteredProjects.length }})
          </div>
          <!-- Timeline Columns -->
          <div class="flex">
            <div 
              v-for="period in timelinePeriods" 
              :key="period.key"
              class="text-center text-sm font-medium py-3 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
              :style="{ width: periodWidth + 'px' }"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': period.isToday }"
            >
              <div class="font-semibold">{{ period.label }}</div>
              <div class="text-xs text-gray-500">{{ period.sublabel }}</div>
            </div>
          </div>
        </div>

        <!-- Timeline Body -->
        <div>
          <!-- Group by Product if no filter -->
          <template v-if="!selectedProduct">
            <div v-for="productGroup in groupedProjects" :key="productGroup.product?.id || 'no-product'">
              <!-- Product Header -->
              <div class="flex bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <div class="w-[280px] min-w-[280px] p-2 font-semibold text-sm sticky left-0 bg-gray-100 dark:bg-gray-700/50 z-10 flex items-center gap-2">
                  <button @click="toggleProductGroup(productGroup.product?.id)" class="p-1">
                    <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': expandedProducts.includes(productGroup.product?.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span 
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: productGroup.product?.color || '#6B7280' }"
                  ></span>
                  {{ productGroup.product?.name || 'No Product' }}
                  <span class="text-xs text-gray-500">({{ productGroup.projects.length }})</span>
                </div>
                <!-- Timeline grid background for product row -->
                <div class="flex flex-1">
                  <div 
                    v-for="period in timelinePeriods" 
                    :key="'bg-' + period.key"
                    class="border-r border-gray-200 dark:border-gray-600 flex-shrink-0"
                    :style="{ width: periodWidth + 'px' }"
                    :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': period.isToday }"
                  ></div>
                </div>
              </div>
              <!-- Projects in this product -->
              <template v-if="expandedProducts.includes(productGroup.product?.id)">
                <div 
                  v-for="project in productGroup.projects"
                  :key="project.id"
                  class="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                >
                  <!-- Project Info Column -->
                  <div class="w-[280px] min-w-[280px] p-3 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 border-r border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getStatusColor(project.status) }"></div>
                      <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 flex-1">
                        {{ project.name }}
                      </NuxtLink>
                      <button @click="openEditModal(project)" class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span v-if="project.start_date">{{ formatDateShort(project.start_date) }}</span>
                      <span v-if="project.start_date && project.target_end_date"> → </span>
                      <span v-if="project.target_end_date">{{ formatDateShort(project.target_end_date) }}</span>
                    </div>
                  </div>
                  <!-- Timeline cells with project bar -->
                  <div class="flex flex-1 relative">
                    <!-- Grid columns -->
                    <div 
                      v-for="period in timelinePeriods" 
                      :key="'cell-' + period.key"
                      class="border-r border-gray-100 dark:border-gray-700 flex-shrink-0 h-[52px]"
                      :style="{ width: periodWidth + 'px' }"
                      :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': period.isToday }"
                    ></div>
                    <!-- Project bar overlay -->
                    <div 
                      v-if="project.start_date && project.target_end_date"
                      class="absolute top-1/2 -translate-y-1/2 h-7 rounded cursor-pointer hover:shadow-lg transition-shadow group/bar"
                      :style="getProjectBarStyle(project)"
                      :class="{ 'ring-2 ring-blue-400': resizingProject?.id === project.id }"
                      @click.stop="openProjectDetail(project)"
                    >
                      <!-- Left resize handle -->
                      <div 
                        class="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/30 rounded-l"
                        @mousedown.stop="startResize($event, project, 'start')"
                      ></div>
                      <!-- Bar content -->
                      <div class="h-full flex items-center px-3 overflow-hidden">
                        <span class="text-xs font-medium text-white truncate">{{ project.name }}</span>
                        <span v-if="showProgress && project.progress_percentage" class="ml-auto text-xs text-white/80 flex-shrink-0 pl-1">
                          {{ project.progress_percentage }}%
                        </span>
                      </div>
                      <!-- Right resize handle -->
                      <div 
                        class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/30 rounded-r"
                        @mousedown.stop="startResize($event, project, 'end')"
                      ></div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <!-- Single product view -->
          <template v-else>
            <div 
              v-for="project in filteredProjects"
              :key="project.id"
              class="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
            >
              <!-- Project Info Column -->
              <div class="w-[280px] min-w-[280px] p-3 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 border-r border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getStatusColor(project.status) }"></div>
                  <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 flex-1">
                    {{ project.name }}
                  </NuxtLink>
                  <button @click="openEditModal(project)" class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  <span v-if="project.start_date">{{ formatDateShort(project.start_date) }}</span>
                  <span v-if="project.start_date && project.target_end_date"> → </span>
                  <span v-if="project.target_end_date">{{ formatDateShort(project.target_end_date) }}</span>
                </div>
              </div>
              <!-- Timeline cells with project bar -->
              <div class="flex flex-1 relative">
                <!-- Grid columns -->
                <div 
                  v-for="period in timelinePeriods" 
                  :key="'cell-' + period.key"
                  class="border-r border-gray-100 dark:border-gray-700 flex-shrink-0 h-[52px]"
                  :style="{ width: periodWidth + 'px' }"
                  :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': period.isToday }"
                ></div>
                <!-- Project bar overlay -->
                <div 
                  v-if="project.start_date && project.target_end_date"
                  class="absolute top-1/2 -translate-y-1/2 h-7 rounded cursor-pointer hover:shadow-lg transition-shadow group/bar"
                  :style="getProjectBarStyle(project)"
                  :class="{ 'ring-2 ring-blue-400': resizingProject?.id === project.id }"
                  @click.stop="openProjectDetail(project)"
                >
                  <!-- Left resize handle -->
                  <div 
                    class="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/30 rounded-l"
                    @mousedown.stop="startResize($event, project, 'start')"
                  ></div>
                  <!-- Bar content -->
                  <div class="h-full flex items-center px-3 overflow-hidden">
                    <span class="text-xs font-medium text-white truncate">{{ project.name }}</span>
                    <span v-if="showProgress && project.progress_percentage" class="ml-auto text-xs text-white/80 flex-shrink-0 pl-1">
                      {{ project.progress_percentage }}%
                    </span>
                  </div>
                  <!-- Right resize handle -->
                  <div 
                    class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-white/30 rounded-r"
                    @mousedown.stop="startResize($event, project, 'end')"
                  ></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
      <div 
        v-for="status in projectStatuses" 
        :key="status.slug" 
        class="flex items-center gap-2"
      >
        <div class="w-8 h-3 rounded" :style="{ backgroundColor: status.color }"></div>
        <span>{{ status.name }}</span>
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <div class="w-4 h-4 border-2 border-dashed border-gray-400 rounded"></div>
        <span>Today</span>
      </div>
    </div>

    <!-- Edit Project Dates Modal -->
    <div v-if="editingProject" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <h3 class="text-xl font-semibold mb-4">Edit Project Timeline</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Project Name</label>
            <input type="text" :value="editingProject.name" disabled class="input bg-gray-100 dark:bg-gray-700" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" v-model="editForm.start_date" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Target End Date</label>
              <input type="date" v-model="editForm.target_end_date" class="input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Progress ({{ editForm.progress_percentage }}%)</label>
            <input type="range" v-model="editForm.progress_percentage" min="0" max="100" class="w-full" />
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="editForm.roadmap_visible" class="rounded" />
              <span class="text-sm">Show on Roadmap</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeEditModal" class="btn btn-secondary">Cancel</button>
          <button @click="saveProjectDates" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { projectStatuses, loadProjectStatuses, getStatusColor } = useProjectStatuses()

// Data
const products = ref<any[]>([])
const projects = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)

// Filters
const selectedProduct = ref('')
const selectedStatus = ref('')
const timeRange = ref('halfyear')
const zoomLevel = ref('weeks')
const showProgress = ref(true)
const showMilestones = ref(true)
const expandedProducts = ref<string[]>([])

// Edit modal
const editingProject = ref<any>(null)
const editForm = ref({
  start_date: '',
  target_end_date: '',
  progress_percentage: 0,
  roadmap_visible: true
})


// Resize state
const resizingProject = ref<any>(null)
const resizeType = ref<'start' | 'end' | null>(null)
const resizeStartX = ref(0)
const originalStartDate = ref('')
const originalEndDate = ref('')

// Computed
const filteredProjects = computed(() => {
  let result = projects.value.filter(p => p.start_date || p.target_end_date)
  
  if (selectedProduct.value) {
    result = result.filter(p => p.product_id === selectedProduct.value)
  }
  
  if (selectedStatus.value) {
    result = result.filter(p => p.status === selectedStatus.value)
  }
  
  // Filter by time range
  const now = new Date()
  let rangeStart: Date, rangeEnd: Date
  
  switch (timeRange.value) {
    case '1month':
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case '3months':
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0)
      break
    case 'quarter':
      rangeStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      rangeEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
      break
    case 'halfyear':
      rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 5, 0)
      break
    case '9months':
      rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 8, 0)
      break
    case 'year':
      rangeStart = new Date(now.getFullYear(), 0, 1)
      rangeEnd = new Date(now.getFullYear(), 11, 31)
      break
    case 'next12':
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 12, 0)
      break
    default:
      return result
  }
  
  return result.filter(p => {
    const start = p.start_date ? new Date(p.start_date) : null
    const end = p.target_end_date ? new Date(p.target_end_date) : null
    
    if (start && end) {
      return start <= rangeEnd && end >= rangeStart
    }
    if (start) return start <= rangeEnd && start >= rangeStart
    if (end) return end >= rangeStart && end <= rangeEnd
    return false
  })
})

const groupedProjects = computed(() => {
  const groups: Record<string, { product: any, projects: any[] }> = {}
  
  filteredProjects.value.forEach(project => {
    const productId = project.product_id || 'no-product'
    if (!groups[productId]) {
      groups[productId] = {
        product: project.product,
        projects: []
      }
    }
    groups[productId].projects.push(project)
  })
  
  return Object.values(groups).sort((a, b) => {
    if (!a.product) return 1
    if (!b.product) return -1
    return a.product.name.localeCompare(b.product.name)
  })
})

const timelineStart = computed(() => {
  const now = new Date()
  switch (timeRange.value) {
    case '1month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case '3months':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'quarter':
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    case 'halfyear':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1)
    case '9months':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1)
    case 'year':
      return new Date(now.getFullYear(), 0, 1)
    case 'next12':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    default:
      // Find earliest date
      const dates = filteredProjects.value
        .filter(p => p.start_date)
        .map(p => new Date(p.start_date))
      return dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : now
  }
})

const timelineEnd = computed(() => {
  const now = new Date()
  switch (timeRange.value) {
    case '1month':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    case '3months':
      return new Date(now.getFullYear(), now.getMonth() + 3, 0)
    case 'quarter':
      return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
    case 'halfyear':
      return new Date(now.getFullYear(), now.getMonth() + 5, 0)
    case '9months':
      return new Date(now.getFullYear(), now.getMonth() + 8, 0)
    case 'year':
      return new Date(now.getFullYear(), 11, 31)
    case 'next12':
      return new Date(now.getFullYear(), now.getMonth() + 12, 0)
    default:
      // Find latest date
      const dates = filteredProjects.value
        .filter(p => p.target_end_date)
        .map(p => new Date(p.target_end_date))
      return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date(now.getFullYear(), now.getMonth() + 6, 0)
  }
})

const periodWidth = computed(() => {
  switch (zoomLevel.value) {
    case 'days': return 40
    case 'weeks': return 80
    case 'months': return 120
    default: return 80
  }
})

// Compute actual rendered timeline boundaries (accounts for week/month alignment)
const renderedTimelineStart = computed(() => {
  const start = new Date(timelineStart.value)
  if (zoomLevel.value === 'weeks') {
    // Align to Monday
    const dayOfWeek = start.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + daysToMonday)
  } else if (zoomLevel.value === 'months') {
    // Align to first of month
    start.setDate(1)
  }
  start.setHours(0, 0, 0, 0)
  return start
})

const renderedTimelineEnd = computed(() => {
  const end = new Date(timelineEnd.value)
  if (zoomLevel.value === 'weeks') {
    // Extend to end of week (Sunday)
    const dayOfWeek = end.getDay()
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    end.setDate(end.getDate() + daysToSunday)
  } else if (zoomLevel.value === 'months') {
    // Extend to end of month
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
  }
  end.setHours(23, 59, 59, 999)
  return end
})

const timelinePeriods = computed(() => {
  const periods: { key: string, label: string, sublabel: string, isToday: boolean }[] = []
  const start = new Date(renderedTimelineStart.value)
  const end = new Date(renderedTimelineEnd.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (zoomLevel.value === 'days') {
    const current = new Date(start)
    current.setHours(0, 0, 0, 0)
    while (current <= end) {
      const isToday = current.toDateString() === today.toDateString()
      const monthLabel = current.getDate() === 1 || periods.length === 0 
        ? current.toLocaleDateString('en-US', { month: 'short' }) 
        : ''
      periods.push({
        key: current.toISOString(),
        label: current.getDate().toString(),
        sublabel: monthLabel || current.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        isToday
      })
      current.setDate(current.getDate() + 1)
    }
  } else if (zoomLevel.value === 'weeks') {
    const current = new Date(start)
    while (current <= end) {
      const weekEnd = new Date(current)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const isToday = today >= current && today <= weekEnd
      periods.push({
        key: current.toISOString(),
        label: `${current.getDate()} - ${weekEnd.getDate()}`,
        sublabel: current.toLocaleDateString('en-US', { month: 'short' }),
        isToday
      })
      current.setDate(current.getDate() + 7)
    }
  } else {
    const current = new Date(start)
    while (current <= end) {
      const isToday = today.getMonth() === current.getMonth() && today.getFullYear() === current.getFullYear()
      periods.push({
        key: current.toISOString(),
        label: current.toLocaleDateString('en-US', { month: 'short' }),
        sublabel: current.getFullYear().toString(),
        isToday
      })
      current.setMonth(current.getMonth() + 1)
    }
  }
  
  return periods
})

const timelineWidth = computed(() => {
  return 280 + (timelinePeriods.value.length * periodWidth.value)
})

// Helper functions
const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getProjectBarStyle = (project: any) => {
  const projectStart = new Date(project.start_date)
  const projectEnd = new Date(project.target_end_date)
  // Use rendered timeline boundaries to match header
  const tlStart = new Date(renderedTimelineStart.value)
  const tlEnd = new Date(renderedTimelineEnd.value)
  
  // Clip project dates to visible timeline range
  const visibleStart = new Date(Math.max(projectStart.getTime(), tlStart.getTime()))
  const visibleEnd = new Date(Math.min(projectEnd.getTime(), tlEnd.getTime()))
  
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.max(1, (tlEnd.getTime() - tlStart.getTime()) / msPerDay)
  const totalWidth = timelinePeriods.value.length * periodWidth.value
  
  // Calculate pixel position based on clipped dates
  const daysFromStart = (visibleStart.getTime() - tlStart.getTime()) / msPerDay
  const visibleDuration = Math.max(1, (visibleEnd.getTime() - visibleStart.getTime()) / msPerDay)
  
  // Convert to pixels
  const pixelsPerDay = totalWidth / totalDays
  const left = daysFromStart * pixelsPerDay
  const width = Math.max(60, visibleDuration * pixelsPerDay)
  
  return {
    left: left + 'px',
    width: width + 'px',
    backgroundColor: getStatusColor(project.status)
  }
}

// Resize functions
const startResize = (event: MouseEvent, project: any, type: 'start' | 'end') => {
  event.preventDefault()
  resizingProject.value = project
  resizeType.value = type
  resizeStartX.value = event.clientX
  originalStartDate.value = project.start_date
  originalEndDate.value = project.target_end_date
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

const onResize = (event: MouseEvent) => {
  if (!resizingProject.value || !resizeType.value) return
  
  const deltaX = event.clientX - resizeStartX.value
  const totalWidth = timelinePeriods.value.length * periodWidth.value
  // Use rendered timeline boundaries to match header
  const tlStart = new Date(renderedTimelineStart.value)
  const tlEnd = new Date(renderedTimelineEnd.value)
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = (tlEnd.getTime() - tlStart.getTime()) / msPerDay
  const pixelsPerDay = totalWidth / totalDays
  const daysDelta = Math.round(deltaX / pixelsPerDay)
  
  if (daysDelta === 0) return
  
  const project = resizingProject.value
  
  if (resizeType.value === 'start') {
    const originalDate = new Date(originalStartDate.value)
    const newDate = new Date(originalDate.getTime() + (daysDelta * msPerDay))
    // Don't allow start date to go past end date
    const endDate = new Date(project.target_end_date)
    if (newDate < endDate) {
      project.start_date = newDate.toISOString().split('T')[0]
    }
  } else {
    const originalDate = new Date(originalEndDate.value)
    const newDate = new Date(originalDate.getTime() + (daysDelta * msPerDay))
    // Don't allow end date to go before start date
    const startDate = new Date(project.start_date)
    if (newDate > startDate) {
      project.target_end_date = newDate.toISOString().split('T')[0]
    }
  }
}

const stopResize = async () => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  if (resizingProject.value) {
    const project = resizingProject.value
    const hasChanged = project.start_date !== originalStartDate.value || 
                       project.target_end_date !== originalEndDate.value
    
    if (hasChanged) {
      // Save changes to backend
      try {
        await apiFetch(`/projects/${project.id}`, {
          method: 'PATCH',
          body: {
            start_date: project.start_date,
            target_end_date: project.target_end_date
          }
        })
      } catch (error) {
        console.error('Failed to save project dates:', error)
        // Revert on error
        project.start_date = originalStartDate.value
        project.target_end_date = originalEndDate.value
        alert('Failed to save changes')
      }
    }
  }
  
  resizingProject.value = null
  resizeType.value = null
}

// Methods
const loadProducts = async () => {
  try {
    const response = await apiFetch('/products')
    products.value = response.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadProjects = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedProduct.value) params.product_id = selectedProduct.value
    const queryString = new URLSearchParams(params).toString()
    const response = await apiFetch(`/projects${queryString ? '?' + queryString : ''}`)
    projects.value = response.data || []
    
    // Auto-expand all products initially
    expandedProducts.value = [...new Set(projects.value.map(p => p.product_id || 'no-product'))]
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loading.value = false
  }
}

const toggleProductGroup = (productId: string | undefined) => {
  const id = productId || 'no-product'
  const index = expandedProducts.value.indexOf(id)
  if (index > -1) {
    expandedProducts.value.splice(index, 1)
  } else {
    expandedProducts.value.push(id)
  }
}

const openProjectDetail = (project: any) => {
  navigateTo(`/projects/${project.id}`)
}

const openEditModal = (project: any) => {
  editingProject.value = project
  editForm.value = {
    start_date: project.start_date || '',
    target_end_date: project.target_end_date || '',
    progress_percentage: project.progress_percentage || 0,
    roadmap_visible: project.roadmap_visible !== false
  }
}

const closeEditModal = () => {
  editingProject.value = null
}

const saveProjectDates = async () => {
  if (!editingProject.value) return
  
  saving.value = true
  try {
    await apiFetch(`/projects/${editingProject.value.id}`, {
      method: 'PATCH',
      body: editForm.value
    })
    await loadProjects()
    closeEditModal()
  } catch (error) {
    console.error('Failed to save project:', error)
    alert('Failed to save project')
  } finally {
    saving.value = false
  }
}

// Initialize
onMounted(async () => {
  await loadProjectStatuses()
  loadProducts()
  loadProjects()
})
</script>
