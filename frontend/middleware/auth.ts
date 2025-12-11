export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Skip middleware on server-side
  if (process.server) return

  // Initialize auth from storage on first load if token is missing
  if (!authStore.token) {
    const token = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (token && refreshToken) {
      // Set tokens immediately so middleware doesn't redirect
      authStore.token = token
      authStore.refreshToken = refreshToken
      
      // Fetch user in background, but don't block navigation
      // Use skipLogoutOnFailure to prevent logout during initialization
      authStore.fetchCurrentUser(true).catch(err => {
        console.error('Failed to fetch user during middleware:', err)
      })
    }
  }

  // Allow access to login/register pages
  if (to.path === '/login' || to.path === '/register') {
    // If user has a token, redirect to dashboard
    if (authStore.token) {
      return navigateTo('/')
    }
    return
  }

  // Protected routes - require token
  if (!authStore.token) {
    return navigateTo('/login')
  }
})

