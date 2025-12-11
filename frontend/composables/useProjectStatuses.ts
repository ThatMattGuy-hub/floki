// Composable for managing project statuses
const projectStatuses = ref<any[]>([])
const loading = ref(false)
const lastLoaded = ref<number>(0)
const CACHE_DURATION = 30000 // 30 seconds cache

export const useProjectStatuses = () => {
  const { apiFetch } = useApi()

  const loadProjectStatuses = async (force = false) => {
    // Check if cache is still valid (30 seconds)
    const now = Date.now()
    const cacheValid = lastLoaded.value > 0 && (now - lastLoaded.value) < CACHE_DURATION
    
    if (cacheValid && !force && projectStatuses.value.length > 0) {
      return projectStatuses.value
    }
    
    loading.value = true
    try {
      const response = await apiFetch('/admin/project-statuses')
      projectStatuses.value = response.data || []
      lastLoaded.value = now
    } catch (error) {
      console.error('Failed to load project statuses:', error)
      // Fallback to default statuses if API fails
      if (projectStatuses.value.length === 0) {
        projectStatuses.value = [
          { slug: 'ongoing', name: 'Ongoing', color: '#3B82F6', is_default: true, is_closed: false },
          { slug: 'on_hold', name: 'On Hold', color: '#F59E0B', is_default: false, is_closed: false },
          { slug: 'blocked', name: 'Blocked', color: '#EF4444', is_default: false, is_closed: false },
          { slug: 'done', name: 'Done', color: '#10B981', is_default: false, is_closed: true },
          { slug: 'cancelled', name: 'Cancelled', color: '#6B7280', is_default: false, is_closed: true }
        ]
      }
    } finally {
      loading.value = false
    }
    return projectStatuses.value
  }
  
  const invalidateCache = () => {
    lastLoaded.value = 0
  }

  const getStatusBySlug = (slug: string) => {
    return projectStatuses.value.find(s => s.slug === slug)
  }

  const getStatusColor = (slug: string) => {
    const status = getStatusBySlug(slug)
    return status?.color || '#6B7280'
  }

  const getStatusLabel = (slug: string) => {
    const status = getStatusBySlug(slug)
    return status?.name || slug
  }

  const getDefaultStatus = () => {
    return projectStatuses.value.find(s => s.is_default) || projectStatuses.value[0]
  }

  const getActiveStatuses = () => {
    return projectStatuses.value.filter(s => !s.is_closed)
  }

  const getClosedStatuses = () => {
    return projectStatuses.value.filter(s => s.is_closed)
  }

  return {
    projectStatuses,
    loading,
    loadProjectStatuses,
    invalidateCache,
    getStatusBySlug,
    getStatusColor,
    getStatusLabel,
    getDefaultStatus,
    getActiveStatuses,
    getClosedStatuses
  }
}
