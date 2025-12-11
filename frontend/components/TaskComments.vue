<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Comments</h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ comments.length }} comment{{ comments.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Comment Input -->
    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
      <textarea
        ref="commentInput"
        v-model="newComment"
        rows="3"
        class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none"
        placeholder="Add a comment... Use @ to mention someone"
        @keydown="handleKeydown"
        @input="handleInput"
        @click="handleClick"
      ></textarea>
      
      <!-- Mention Autocomplete Dropdown -->
      <div
        v-if="showMentionDropdown && mentionSuggestions.length > 0"
        class="absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        :style="{ top: mentionDropdownTop + 'px', left: mentionDropdownLeft + 'px', minWidth: '280px', maxWidth: '400px' }"
      >
        <div
          v-for="(item, index) in mentionSuggestions"
          :key="item.id"
          @click="selectMention(item)"
          @mouseenter="selectedMentionIndex = index"
          :class="[
            'px-4 py-2 cursor-pointer flex items-center gap-3',
            index === selectedMentionIndex
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          ]"
        >
          <div v-if="item.type === 'user'" class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
            {{ getInitials(item.full_name || item.email) }}
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 dark:text-gray-100 truncate">
              {{ item.type === 'user' ? (item.full_name || item.email) : item.name }}
            </div>
            <div v-if="item.type === 'user'" class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ item.email }}
            </div>
            <div v-else-if="item.description" class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ item.description }}
            </div>
          </div>
          <span v-if="item.type === 'team'" class="text-xs text-gray-400">Team</span>
        </div>
      </div>
      
      <div class="flex items-center justify-between mt-3">
        <label class="flex items-center gap-2 text-sm">
          <input v-model="isInternal" type="checkbox" class="rounded" />
          <span>Internal only (hidden from external agencies)</span>
        </label>
        
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || loading"
          class="btn-primary"
        >
          {{ loading ? 'Posting...' : 'Comment' }}
        </button>
      </div>
    </div>

    <!-- Comments List -->
    <div v-if="loading && comments.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      No comments yet. Be the first to comment!
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {{ getInitials(comment.user?.full_name || comment.user?.email) }}
          </div>

          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ comment.user?.full_name || comment.user?.email }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(comment.created_at) }}
                </span>
                <span v-if="comment.is_internal_only" class="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 rounded">
                  Internal
                </span>
              </div>
              
              <button
                v-if="canDelete(comment)"
                @click="deleteComment(comment.id)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap" v-html="renderComment(comment.content)"></div>

            <!-- Mentions -->
            <div v-if="comment.mentions && comment.mentions.length > 0" class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Mentioned:</span>
              <span v-for="mention in comment.mentions" :key="mention.user?.id" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {{ mention.user?.full_name || mention.user?.email }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  taskId: string
}>()

const authStore = useAuthStore()
const { apiFetch } = useApi()

const comments = ref([])
const newComment = ref('')
const isInternal = ref(false)
const loading = ref(false)

// Mention autocomplete state
const commentInput = ref<HTMLTextAreaElement | null>(null)
const showMentionDropdown = ref(false)
const mentionSuggestions = ref<any[]>([])
const selectedMentionIndex = ref(0)
const mentionDropdownTop = ref(0)
const mentionDropdownLeft = ref(0)
const mentionQuery = ref('')
const mentionStartPos = ref(0)
const allUsers = ref<any[]>([])
const allTeams = ref<any[]>([])
const loadingMentions = ref(false)

const loadComments = async () => {
  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/comments`)
    comments.value = response.data || []
  } catch (error) {
    console.error('Failed to load comments:', error)
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || loading.value) return

  // Parse mentions from comment text
  const mentions = extractMentionIds(newComment.value)

  try {
    loading.value = true
    const response = await apiFetch(`/tasks/${props.taskId}/comments`, {
      method: 'POST',
      body: {
        content: newComment.value,
        is_internal_only: isInternal.value,
        mentions: mentions
      }
    })

    if (response.success) {
      await loadComments()
      newComment.value = ''
      isInternal.value = false
      showMentionDropdown.value = false
    }
  } catch (error) {
    console.error('Failed to post comment:', error)
    alert('Failed to post comment')
  } finally {
    loading.value = false
  }
}

// Load users and teams for mentions
const loadMentionData = async () => {
  if (allUsers.value.length > 0 && allTeams.value.length > 0) return
  
  loadingMentions.value = true
  try {
    const [usersResponse, teamsResponse] = await Promise.all([
      apiFetch('/users'),
      apiFetch('/teams')
    ])
    
    allUsers.value = (usersResponse.data || []).filter((u: any) => u.is_active)
    allTeams.value = teamsResponse.data || []
  } catch (error) {
    console.error('Failed to load mention data:', error)
  } finally {
    loadingMentions.value = false
  }
}

// Handle input to detect @ mentions
const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const text = textarea.value
  
  // Find @ symbol before cursor
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtIndex !== -1) {
    // Check if there's a space after @ (meaning mention ended)
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
      // We're in a mention
      mentionStartPos.value = lastAtIndex
      mentionQuery.value = textAfterAt.toLowerCase()
      updateMentionSuggestions()
      positionMentionDropdown(textarea, cursorPos)
      showMentionDropdown.value = true
      return
    }
  }
  
  showMentionDropdown.value = false
}

// Handle click to detect @ mentions
const handleClick = (event: MouseEvent) => {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const text = textarea.value
  
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtIndex !== -1) {
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
      mentionStartPos.value = lastAtIndex
      mentionQuery.value = textAfterAt.toLowerCase()
      updateMentionSuggestions()
      positionMentionDropdown(textarea, cursorPos)
      showMentionDropdown.value = true
      return
    }
  }
  
  showMentionDropdown.value = false
}

// Update mention suggestions based on query
const updateMentionSuggestions = () => {
  const query = mentionQuery.value.toLowerCase()
  
  const userMatches = allUsers.value
    .filter(user => {
      const name = (user.full_name || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
    .map(user => ({ ...user, type: 'user' }))
    .slice(0, 5)
  
  const teamMatches = allTeams.value
    .filter(team => {
      const name = (team.name || '').toLowerCase()
      const desc = (team.description || '').toLowerCase()
      return name.includes(query) || desc.includes(query)
    })
    .map(team => ({ ...team, type: 'team' }))
    .slice(0, 5)
  
  mentionSuggestions.value = [...userMatches, ...teamMatches]
  selectedMentionIndex.value = 0
}

// Position the mention dropdown
const positionMentionDropdown = (textarea: HTMLTextAreaElement, cursorPos: number) => {
  // Calculate cursor position in the textarea
  const textBeforeCursor = textarea.value.substring(0, cursorPos)
  const lines = textBeforeCursor.split('\n')
  const currentLine = lines.length - 1
  const lineText = lines[currentLine]
  
  // Approximate measurements
  const lineHeight = 24 // Approximate line height for textarea
  const charWidth = 7 // Approximate character width
  const padding = 16
  
  // Position dropdown below the current line
  mentionDropdownTop.value = (currentLine + 1) * lineHeight + padding
  
  // Position horizontally based on cursor position in current line
  // Add some padding to align with text start
  mentionDropdownLeft.value = Math.min(
    lineText.length * charWidth + padding,
    300 // Max left position to prevent overflow
  )
}

// Select a mention
const selectMention = (item: any) => {
  if (!commentInput.value) return
  
  const text = newComment.value
  const beforeMention = text.substring(0, mentionStartPos.value)
  const afterMention = text.substring(mentionStartPos.value)
  
  // Find where the mention ends (space, newline, or end of string)
  let mentionEnd = afterMention.length
  for (let i = 1; i < afterMention.length; i++) {
    if (afterMention[i] === ' ' || afterMention[i] === '\n') {
      mentionEnd = i
      break
    }
  }
  
  // Replace spaces with underscores for parsing, store ID in brackets
  const displayName = item.type === 'user' 
    ? (item.full_name || item.email).replace(/\s+/g, '_')
    : item.name.replace(/\s+/g, '_')
  const mentionText = `@${displayName}[${item.id}]`
  
  // Replace the mention and add a space
  const textAfterMention = afterMention.substring(mentionEnd)
  newComment.value = beforeMention + mentionText + (textAfterMention.startsWith(' ') ? '' : ' ') + textAfterMention
  
  showMentionDropdown.value = false
  
  // Set cursor position after mention
  setTimeout(() => {
    if (commentInput.value) {
      const newPos = beforeMention.length + mentionText.length + 1
      commentInput.value.setSelectionRange(newPos, newPos)
      commentInput.value.focus()
    }
  }, 0)
}

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (showMentionDropdown.value && mentionSuggestions.value.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectedMentionIndex.value = Math.min(selectedMentionIndex.value + 1, mentionSuggestions.value.length - 1)
      return
    }
    
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0)
      return
    }
    
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      selectMention(mentionSuggestions.value[selectedMentionIndex.value])
      return
    }
    
    if (event.key === 'Escape') {
      event.preventDefault()
      showMentionDropdown.value = false
      return
    }
  }
  
  // Submit on Cmd/Ctrl + Enter
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    submitComment()
  }
}

// Extract mention IDs from comment text
const extractMentionIds = (text: string): string[] => {
  const mentionIds: string[] = []
  // Match @name[uuid] format
  const mentionRegex = /@[^\[\]\s]+\[([a-f0-9-]+)\]/gi
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const userId = match[1]
    if (userId) {
      mentionIds.push(userId)
    }
  }
  
  return [...new Set(mentionIds)] // Remove duplicates
}

const deleteComment = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    const response = await apiFetch(`/tasks/${props.taskId}/comments/${commentId}`, {
      method: 'DELETE'
    })

    if (response.success) {
      comments.value = comments.value.filter(c => c.id !== commentId)
    }
  } catch (error) {
    console.error('Failed to delete comment:', error)
    alert('Failed to delete comment')
  }
}

const canDelete = (comment: any) => {
  const userRole = authStore.user?.role
  return comment.user?.id === authStore.user?.id || ['owner', 'admin', 'manager'].includes(userRole)
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (date: string) => {
  const now = new Date()
  const commentDate = new Date(date)
  const diffMs = now.getTime() - commentDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return commentDate.toLocaleDateString()
}

const renderComment = (content: string) => {
  // Convert @Name_Here[uuid] format to styled @Name Here (hiding UUID, converting underscores to spaces)
  return content.replace(/@([^\[\]\s]+)\[[a-f0-9-]+\]/gi, (match, name) => {
    const displayName = name.replace(/_/g, ' ')
    return `<span class="text-blue-600 dark:text-blue-400 font-medium">@${displayName}</span>`
  })
}

onMounted(() => {
  loadComments()
  loadMentionData()
})
</script>

