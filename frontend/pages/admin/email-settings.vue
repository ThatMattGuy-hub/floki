<template>
  <div class="p-8">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2 inline-block">
        ← Back to Admin
      </NuxtLink>
      <h1 class="text-3xl font-bold mb-2">Email Settings</h1>
      <p class="text-gray-600 dark:text-gray-400">Configure email notifications and SMTP</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- SMTP Configuration -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold">SMTP Configuration</h2>
        </div>
        <form @submit.prevent="saveEmailSettings" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Email Provider</label>
            <select v-model="emailForm.provider" class="input" @change="onProviderChange">
              <option value="outlook_smtp">Outlook SMTP</option>
              <option value="microsoft_graph">Microsoft Graph API</option>
              <option value="custom">Custom SMTP</option>
            </select>
          </div>

          <div v-if="emailForm.provider === 'outlook_smtp' || emailForm.provider === 'custom'">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">SMTP Host</label>
                <input
                  v-model="emailForm.smtp_host"
                  type="text"
                  class="input"
                  placeholder="smtp.office365.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">SMTP Port</label>
                <input
                  v-model.number="emailForm.smtp_port"
                  type="number"
                  class="input"
                  placeholder="587"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Username/Email</label>
                <input
                  v-model="emailForm.smtp_user"
                  type="email"
                  class="input"
                  placeholder="your-email@outlook.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Password</label>
                <input
                  v-model="emailForm.smtp_password"
                  type="password"
                  class="input"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label class="flex items-center gap-2">
                  <input
                    v-model="emailForm.smtp_secure"
                    type="checkbox"
                    class="rounded"
                  />
                  <span class="text-sm">Use TLS/SSL</span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="emailForm.provider === 'microsoft_graph'">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Tenant ID</label>
                <input
                  v-model="emailForm.tenant_id"
                  type="text"
                  class="input"
                  placeholder="your-tenant-id"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Client ID</label>
                <input
                  v-model="emailForm.client_id"
                  type="text"
                  class="input"
                  placeholder="your-client-id"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Client Secret</label>
                <input
                  v-model="emailForm.client_secret"
                  type="password"
                  class="input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">From Email Address</label>
            <input
              v-model="emailForm.from_email"
              type="email"
              required
              class="input"
              placeholder="noreply@yourcompany.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">From Name</label>
            <input
              v-model="emailForm.from_name"
              type="text"
              class="input"
              placeholder="Project Management System"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Reply-To Email</label>
            <input
              v-model="emailForm.reply_to"
              type="email"
              class="input"
              placeholder="support@yourcompany.com"
            />
          </div>

          <div class="flex items-center gap-4 pt-4">
            <button type="button" @click="testConnection(false)" class="btn btn-secondary" :disabled="testing">
              {{ testing ? 'Testing...' : 'Test Connection' }}
            </button>
            <button type="button" @click="testConnection(true)" class="btn btn-secondary" :disabled="testing">
              {{ testing ? 'Sending...' : 'Send Test Email' }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>

          <div v-if="testResult" :class="[
            'p-3 rounded text-sm',
            testResult.success
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          ]">
            {{ testResult.message }}
          </div>
        </form>
      </div>

      <!-- Email Templates -->
      <div class="card">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold">Email Templates</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="template in emailTemplates"
              :key="template.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ template.name }}</span>
                <button
                  @click="editTemplate(template)"
                  class="text-sm text-blue-600 dark:text-blue-400"
                >
                  Edit
                </button>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Subject: {{ template.subject }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()

const saving = ref(false)
const testing = ref(false)
const testResult = ref<any>(null)
const emailTemplates = ref<any[]>([])

const emailForm = ref({
  provider: 'outlook_smtp',
  smtp_host: 'smtp.office365.com',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  smtp_secure: true,
  tenant_id: '',
  client_id: '',
  client_secret: '',
  from_email: '',
  from_name: 'Project Management System',
  reply_to: ''
})

onMounted(() => {
  if (!authStore.canManageSettings) {
    navigateTo('/')
    return
  }
  loadEmailSettings()
  loadEmailTemplates()
})

const loadEmailSettings = async () => {
  try {
    const response = await apiFetch('/admin/email-settings')
    if (response.data) {
      emailForm.value = { ...emailForm.value, ...response.data }
    }
  } catch (error) {
    console.error('Failed to load email settings:', error)
  }
}

const loadEmailTemplates = async () => {
  try {
    const response = await apiFetch('/admin/email-templates')
    emailTemplates.value = response.data || []
  } catch (error) {
    console.error('Failed to load email templates:', error)
    emailTemplates.value = []
  }
}

const onProviderChange = () => {
  if (emailForm.value.provider === 'outlook_smtp') {
    emailForm.value.smtp_host = 'smtp.office365.com'
    emailForm.value.smtp_port = 587
    emailForm.value.smtp_secure = true
  }
}

const testConnection = async (sendTestEmail: boolean = false) => {
  testing.value = true
  testResult.value = null
  try {
    const url = sendTestEmail 
      ? '/admin/email-settings/test?sendTest=true' 
      : '/admin/email-settings/test'
    const response = await apiFetch(url, {
      method: 'POST',
      body: emailForm.value
    })
    testResult.value = {
      success: response.success,
      message: response.message || (response.success ? 'Connection successful!' : 'Connection failed')
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.data?.error || 'Connection test failed'
    }
  } finally {
    testing.value = false
  }
}

const saveEmailSettings = async () => {
  saving.value = true
  try {
    await apiFetch('/admin/email-settings', {
      method: 'POST',
      body: emailForm.value
    })
    alert('Email settings saved successfully')
  } catch (error) {
    console.error('Failed to save email settings:', error)
    alert('Failed to save email settings')
  } finally {
    saving.value = false
  }
}

const editTemplate = (template: any) => {
  // TODO: Implement template editing modal
  alert('Template editing coming soon')
}
</script>

