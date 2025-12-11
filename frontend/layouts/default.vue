<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <NuxtLink to="/" class="block">
          <img 
            :src="colorMode.value === 'dark' ? '/flokidark.png' : '/floki.png'" 
            alt="Floki" 
            class="h-8 w-auto"
          />
        </NuxtLink>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-1">
        <NuxtLink 
          to="/" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink 
          to="/tasks" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Tasks</span>
        </NuxtLink>

        <NuxtLink 
          to="/projects" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Projects</span>
        </NuxtLink>

        <NuxtLink 
          to="/products" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Products</span>
        </NuxtLink>

        <NuxtLink 
          to="/roadmap" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span>Roadmap</span>
        </NuxtLink>

        <ClientOnly>
          <NuxtLink 
            v-if="authStore.canManageSettings"
            to="/priorities" 
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Priorities</span>
          </NuxtLink>
        </ClientOnly>

        <NuxtLink 
          to="/reports" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports</span>
        </NuxtLink>

        <NuxtLink 
          to="/reports2" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span>Reports 2.0</span>
          <span class="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">New</span>
        </NuxtLink>

        <ClientOnly>
          <NuxtLink 
            v-if="authStore.canManageSettings" 
            to="/admin" 
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Admin</span>
          </NuxtLink>
        </ClientOnly>
      </nav>

      <ClientOnly>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {{ authStore.user?.full_name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ authStore.user?.full_name || 'User' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.user?.role || '' }}</p>
            </div>
          </div>
          
          <button @click="toggleDarkMode" class="w-full btn-secondary mb-2 text-sm">
            <svg v-if="colorMode.value === 'dark'" class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }} Mode
          </button>

          <button @click="showPasswordModal = true" class="w-full btn-secondary mb-2 text-sm">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </button>
          
          <button @click="handleLogout" class="w-full btn-secondary text-sm">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </ClientOnly>

      <!-- Change Password Modal -->
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closePasswordModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">Change Password</h3>
          
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div v-if="passwordError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              {{ passwordSuccess }}
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Current Password</label>
              <input
                v-model="currentPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">New Password</label>
              <input
                v-model="newPassword"
                type="password"
                required
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Confirm new password"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="closePasswordModal" class="flex-1 btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="changingPassword" class="flex-1 btn-primary">
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const colorMode = useColorMode()
const router = useRouter()
const { apiBaseUrl } = useRuntimeConfig().public

const showPasswordModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  passwordSuccess.value = ''
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'New passwords do not match'
    return
  }

  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters'
    return
  }

  changingPassword.value = true

  try {
    const response = await $fetch('/auth/change-password', {
      method: 'POST',
      baseURL: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        current_password: currentPassword.value,
        new_password: newPassword.value
      }
    })

    if (response.success) {
      passwordSuccess.value = 'Password changed successfully!'
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      setTimeout(() => {
        closePasswordModal()
      }, 1500)
    } else {
      passwordError.value = response.error || 'Failed to change password'
    }
  } catch (error: any) {
    passwordError.value = error.data?.error || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}
</script>

