import { defineStore } from 'pinia'
import type { Task, PaginatedResponse } from '~/types'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    currentTask: null as Task | null,
    loading: false,
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    },
    filters: {
      project_id: null as string | null,
      product_id: null as string | null,
      status_id: null as string | null,
      assignee_id: null as string | null,
      agency_id: null as string | null,
      team_id: null as string | null,
      priority: null as string | null,
      due_date_from: null as string | null,
      due_date_to: null as string | null,
      created_from: null as string | null,
      created_to: null as string | null
    },
    sortBy: 'created_at' as string,
    sortOrder: 'desc' as string
  }),

  actions: {
    async fetchTasks(filters?: any) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        
        // Build params object, filtering out null/undefined values
        const allFilters = {
          page: this.pagination.page.toString(),
          limit: this.pagination.limit.toString(),
          ...this.filters,
          ...filters
        }
        
        // Remove null, undefined, and empty string values
        const cleanFilters = Object.fromEntries(
          Object.entries(allFilters).filter(([_, v]) => v != null && v !== '' && v !== 'null')
        )
        
        const params = new URLSearchParams(cleanFilters)

        const response: PaginatedResponse<Task> = await $fetch(`/tasks?${params}`, {
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.success) {
          this.tasks = response.data
          this.pagination = response.pagination
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTaskById(id: string) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/tasks/${id}`, {
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.success && response.data) {
          this.currentTask = response.data
          return response.data
        }
      } catch (error) {
        console.error('Failed to fetch task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData: any) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await $fetch('/tasks', {
          method: 'POST',
          body: taskData,
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.success && response.data) {
          this.tasks.unshift(response.data)
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (error: any) {
        return { success: false, error: error.data?.error || 'Failed to create task' }
      } finally {
        this.loading = false
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/tasks/${id}`, {
          method: 'PATCH',
          body: updates,
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.success && response.data) {
          const index = this.tasks.findIndex(t => t.id === id)
          if (index !== -1) {
            // Use Vue's reactivity-friendly update
            this.tasks.splice(index, 1, response.data)
          }
          if (this.currentTask?.id === id) {
            this.currentTask = response.data
          }
          return { success: true, data: response.data }
        }

        return { success: false, error: response.error }
      } catch (error: any) {
        return { success: false, error: error.data?.error || 'Failed to update task' }
      } finally {
        this.loading = false
      }
    },

    async deleteTask(id: string) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await $fetch(`/tasks/${id}`, {
          method: 'DELETE',
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.success) {
          this.tasks = this.tasks.filter(t => t.id !== id)
          if (this.currentTask?.id === id) {
            this.currentTask = null
          }
          return { success: true }
        }

        return { success: false, error: response.error }
      } catch (error: any) {
        return { success: false, error: error.data?.error || 'Failed to delete task' }
      } finally {
        this.loading = false
      }
    },

    setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1
    },

    clearFilters() {
      this.filters = {
        project_id: null,
        product_id: null,
        status_id: null,
        assignee_id: null,
        agency_id: null,
        team_id: null,
        priority: null,
        due_date_from: null,
        due_date_to: null,
        created_from: null,
        created_to: null
      }
      this.sortBy = 'created_at'
      this.sortOrder = 'desc'
      this.pagination.page = 1
    },

    nextPage() {
      if (this.pagination.page < this.pagination.totalPages) {
        this.pagination.page++
      }
    },

    previousPage() {
      if (this.pagination.page > 1) {
        this.pagination.page--
      }
    }
  }
})

