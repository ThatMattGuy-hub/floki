<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Admin Console</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage system settings and configurations</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink to="/admin/users-teams" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Users & Teams</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Manage users, roles, and team assignments</p>
      </NuxtLink>

      <NuxtLink to="/agencies" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Agencies</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Manage external agencies and their teams</p>
      </NuxtLink>

      <NuxtLink to="/admin/statuses-labels" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Statuses & Labels</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Configure workflow statuses and label categories</p>
      </NuxtLink>

      <NuxtLink to="/admin/custom-fields" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Custom Fields</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Define custom field templates for tasks</p>
      </NuxtLink>

      <NuxtLink to="/admin/automations" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Automations</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Create and manage automation rules (IFTTT)</p>
      </NuxtLink>

      <NuxtLink to="/admin/approvals" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Approvals</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Configure approval workflows and steps</p>
      </NuxtLink>

      <NuxtLink to="/admin/sla-rules" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">SLA Rules</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Define SLA policies and monitoring rules</p>
      </NuxtLink>

      <NuxtLink to="/admin/email-settings" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Email Settings</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Configure email notifications and SMTP</p>
      </NuxtLink>

      <NuxtLink to="/admin/audit-logs" class="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Audit Logs</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">View and export system audit history</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
  }
})
</script>

