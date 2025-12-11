<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-800 dark:to-gray-900 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img 
          :src="colorMode.value === 'dark' ? '/flokidark.png' : '/floki.png'" 
          alt="Floki" 
          class="h-12 w-auto mx-auto mb-4"
        />
        <p class="text-primary-100 dark:text-gray-400">Comprehensive project management platform</p>
      </div>
      
      <div class="card p-8">
        <slot />
      </div>

      <div class="text-center mt-4">
        <button @click="toggleDarkMode" class="text-white dark:text-gray-400 hover:text-primary-100 transition-colors">
          <svg v-if="colorMode.value === 'dark'" class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

