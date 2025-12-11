export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const apiFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    try {
      const response = await $fetch<T>(url, {
        baseURL: config.public.apiBaseUrl,
        ...options,
        headers
      })

      return response
    } catch (error: any) {
      // If token expired, try to refresh
      if (error.status === 401 && authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken()
        
        if (refreshed) {
          // Retry the original request
          headers.Authorization = `Bearer ${authStore.token}`
          return await $fetch<T>(url, {
            baseURL: config.public.apiBaseUrl,
            ...options,
            headers
          })
        }
      }

      throw error
    }
  }

  return {
    apiFetch
  }
}

