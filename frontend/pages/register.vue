<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <div>
        <label for="full_name" class="block text-sm font-medium mb-2">Full Name</label>
        <input
          id="full_name"
          v-model="full_name"
          type="text"
          required
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium mb-2">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-2">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" :disabled="loading" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
        <span v-if="loading">Registering...</span>
        <span v-else>Register</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm">
        Already have an account?
        <NuxtLink to="/login" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Login here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

const full_name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.register({ 
    email: email.value, 
    password: password.value,
    full_name: full_name.value
  })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Registration failed'
  }

  loading.value = false
}
</script>

