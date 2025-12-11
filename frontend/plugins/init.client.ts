export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize auth from localStorage on client
  await authStore.initializeFromStorage()
})

