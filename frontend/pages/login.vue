<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div>
        <label for="email" class="label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="input"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label for="password" class="label">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="input"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" :disabled="loading" class="w-full btn-primary">
        <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.login({ email: email.value, password: password.value })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Login failed'
  }

  loading.value = false
}
</script>

