import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterData } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    refreshToken: null as string | null,
    loading: false,
    initializing: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isExternalAgency: (state) => state.user?.role === 'External Agency',
    canManageSettings: (state) => ['Owner', 'Admin'].includes(state.user?.role || ''),
    canManageTeams: (state) => ['Owner', 'Admin', 'Manager'].includes(state.user?.role || ''),
    canCreateTasks: (state) => ['Owner', 'Admin', 'Manager', 'Contributor'].includes(state.user?.role || '')
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.loading = true
      try {
        const response = await $fetch('/auth/login', {
          method: 'POST',
          body: credentials,
          baseURL: useRuntimeConfig().public.apiBaseUrl
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.session.access_token
          this.refreshToken = response.data.session.refresh_token
          
          // Store tokens in localStorage
          if (process.client) {
            localStorage.setItem('access_token', this.token!)
            localStorage.setItem('refresh_token', this.refreshToken!)
          }

          return { success: true }
        }

        return { success: false, error: response.error || 'Login failed' }
      } catch (error: any) {
        return { success: false, error: error.data?.error || 'Login failed' }
      } finally {
        this.loading = false
      }
    },

    async register(data: RegisterData) {
      this.loading = true
      try {
        const response = await $fetch('/auth/register', {
          method: 'POST',
          body: data,
          baseURL: useRuntimeConfig().public.apiBaseUrl
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.token = response.data.session.access_token
          this.refreshToken = response.data.session.refresh_token
          
          if (process.client) {
            localStorage.setItem('access_token', this.token!)
            localStorage.setItem('refresh_token', this.refreshToken!)
          }

          return { success: true }
        }

        return { success: false, error: response.error || 'Registration failed' }
      } catch (error: any) {
        return { success: false, error: error.data?.error || 'Registration failed' }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/auth/logout', {
          method: 'POST',
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.token = null
        this.refreshToken = null
        
        if (process.client) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    },

    async fetchCurrentUser(skipLogoutOnFailure = false) {
      if (!this.token) return false

      try {
        const response = await $fetch('/auth/me', {
          baseURL: useRuntimeConfig().public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        if (response.success && response.data) {
          this.user = response.data
          return true
        }
        return false
      } catch (error: any) {
        console.error('Failed to fetch user:', error)
        
        // If token expired, try to refresh it
        if (error.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken()
          if (refreshed && this.token) {
            // Retry fetching user with new token
            try {
              const response = await $fetch('/auth/me', {
                baseURL: useRuntimeConfig().public.apiBaseUrl,
                headers: {
                  Authorization: `Bearer ${this.token}`
                }
              })
              if (response.success && response.data) {
                this.user = response.data
                return true
              }
            } catch (retryError) {
              console.error('Failed to fetch user after refresh:', retryError)
              // Only logout if not initializing and retry also fails
              if (!skipLogoutOnFailure) {
                this.logout()
              }
              return false
            }
          } else {
            // Refresh failed, logout only if not initializing
            if (!skipLogoutOnFailure) {
              this.logout()
            }
            return false
          }
        } else {
          // Not a 401 or no refresh token, logout only if not initializing
          if (!skipLogoutOnFailure) {
            this.logout()
          }
          return false
        }
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) return false

      try {
        const response = await $fetch('/auth/refresh', {
          method: 'POST',
          body: { refresh_token: this.refreshToken },
          baseURL: useRuntimeConfig().public.apiBaseUrl
        })

        if (response.success && response.data) {
          this.token = response.data.session.access_token
          this.refreshToken = response.data.session.refresh_token
          
          if (process.client) {
            localStorage.setItem('access_token', this.token!)
            localStorage.setItem('refresh_token', this.refreshToken!)
          }

          return true
        }

        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        // Don't logout here, let fetchCurrentUser handle it
        return false
      }
    },

    async initializeFromStorage() {
      if (process.client) {
        this.initializing = true
        try {
          const token = localStorage.getItem('access_token')
          const refreshToken = localStorage.getItem('refresh_token')
          
          if (token && refreshToken) {
            this.token = token
            this.refreshToken = refreshToken
            // Don't logout on failure during initialization
            await this.fetchCurrentUser(true)
          }
        } finally {
          this.initializing = false
        }
      }
    }
  }
})

