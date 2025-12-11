<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Files</h3>
      <label class="btn-secondary text-sm cursor-pointer">
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Upload File
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          class="hidden"
          multiple
        />
      </label>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <div class="flex-1">
          <p class="text-sm font-medium">Uploading {{ currentFileName }}...</p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Files List -->
    <div v-if="loading && files.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="files.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No files uploaded yet. Click "Upload File" to add attachments.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="file in files"
        :key="file.id"
        class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <!-- File Icon -->
        <div class="flex-shrink-0">
          <div v-if="isImage(file)" class="w-12 h-12 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
            <img
              :src="getImagePreview(file)"
              :alt="file.file_name || file.name"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <div v-else class="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ file.file_name || file.name }}</p>
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ formatFileSize(file.file_size || file.size) }}</span>
            <span>•</span>
            <span>{{ formatDate(file.created_at) }}</span>
            <span v-if="file.uploaded_by_user">•</span>
            <span v-if="file.uploaded_by_user">by {{ file.uploaded_by_user.full_name || file.uploaded_by_user.email }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <a
            :href="getDownloadUrl(file)"
            target="_blank"
            class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            :title="'Download ' + (file.file_name || file.name)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          <button
            @click="deleteFile(file.id)"
            class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            title="Delete file"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
}>()

const { apiFetch } = useApi()
const fileInput = ref(null)

const files = ref([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const currentFileName = ref('')

const loadFiles = async () => {
  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/files`)
    files.value = response.data || []
  } catch (error) {
    console.error('Failed to load files:', error)
  } finally {
    loading.value = false
  }
}

const handleFileSelect = async (event: any) => {
  const selectedFiles = Array.from(event.target.files || [])
  if (selectedFiles.length === 0) return

  for (const file of selectedFiles) {
    await uploadFile(file)
  }

  // Reset input
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).value = ''
  }
}

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    uploading.value = true
    currentFileName.value = file.name
    uploadProgress.value = 0

    // Simulate progress (in real app, you'd use XMLHttpRequest for progress tracking)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const response = await fetch(`${config.public.apiBaseUrl}/tasks/${props.taskId}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: formData
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    
    if (result.success) {
      await loadFiles()
    } else {
      throw new Error(result.error || 'Upload failed')
    }
  } catch (error: any) {
    console.error('Failed to upload file:', error)
    alert(`Failed to upload ${file.name}: ${error.message}`)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    currentFileName.value = ''
  }
}

const deleteFile = async (fileId: string) => {
  if (!confirm('Are you sure you want to delete this file?')) return

  try {
    const response = await apiFetch(`/tasks/${props.taskId}/files/${fileId}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await loadFiles()
    }
  } catch (error) {
    console.error('Failed to delete file:', error)
    alert('Failed to delete file')
  }
}

const getDownloadUrl = async (file: any) => {
  try {
    const response = await apiFetch(`/tasks/${props.taskId}/files/${file.id}/download`)
    return response.data?.url || '#'
  } catch (error) {
    console.error('Failed to get download URL:', error)
    return '#'
  }
}

const getImagePreview = (file: any) => {
  const config = useRuntimeConfig()
  if (file.thumbnail_path) {
    return `${config.public.supabaseUrl}/storage/v1/object/public/files/${file.thumbnail_path}`
  }
  // For images without thumbnails, use the main file
  if (file.storage_path) {
    return `${config.public.supabaseUrl}/storage/v1/object/public/files/${file.storage_path}`
  }
  return ''
}

const isImage = (file: any) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const mimeType = file.file_type || file.mime_type
  return imageTypes.includes(mimeType?.toLowerCase())
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleImageError = (event: any) => {
  // Fallback to file icon if image fails to load
  event.target.style.display = 'none'
}

onMounted(() => {
  loadFiles()
})
</script>

