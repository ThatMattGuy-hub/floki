<template>
  <div 
    class="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
  >
    <!-- Project Info Column -->
    <div 
      class="w-[280px] min-w-[280px] p-3 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 border-r border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <div 
          class="w-2 h-2 rounded-full flex-shrink-0"
          :style="{ backgroundColor: statusColor }"
        ></div>
        <NuxtLink 
          :to="`/projects/${project.id}`"
          class="font-medium text-sm truncate hover:text-blue-600 dark:hover:text-blue-400 flex-1"
          :title="project.name"
        >
          {{ project.name }}
        </NuxtLink>
        <button 
          @click.stop="$emit('edit', project)"
          class="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
          title="Edit timeline"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
        <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
        <span v-if="project.start_date && project.target_end_date">→</span>
        <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
        <span v-if="!project.start_date && !project.target_end_date" class="text-gray-400 italic">No dates set</span>
      </div>
    </div>

    <!-- Timeline Bar Column -->
    <div class="flex-1 relative py-2 min-h-[52px]">
      <!-- Today marker line -->
      <div 
        v-if="todayPosition >= 0 && todayPosition <= 100"
        class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
        :style="{ left: todayPosition + '%' }"
      >
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
      </div>

      <!-- Project Bar -->
      <div 
        v-if="hasValidDates"
        class="absolute top-1/2 -translate-y-1/2 h-8 rounded-md cursor-pointer transition-all hover:shadow-lg group/bar"
        :style="barStyle"
        @click="$emit('click', project)"
      >
        <!-- Progress fill -->
        <div 
          v-if="showProgress && project.progress_percentage > 0"
          class="absolute inset-0 rounded-md opacity-40"
          :style="{ 
            width: project.progress_percentage + '%',
            backgroundColor: 'rgba(0,0,0,0.3)'
          }"
        ></div>
        
        <!-- Bar content -->
        <div class="relative h-full flex items-center px-2 overflow-hidden">
          <span class="text-xs font-medium text-white truncate drop-shadow">
            {{ project.name }}
          </span>
          <span v-if="showProgress" class="ml-auto text-xs text-white/80 flex-shrink-0">
            {{ project.progress_percentage || 0 }}%
          </span>
        </div>

        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
          <div class="font-semibold">{{ project.name }}</div>
          <div class="text-gray-300">{{ formatDate(project.start_date) }} - {{ formatDate(project.target_end_date) }}</div>
          <div class="text-gray-300">Progress: {{ project.progress_percentage || 0 }}%</div>
          <div class="text-gray-300">Status: {{ project.status || 'Unknown' }}</div>
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      <!-- No dates indicator -->
      <div 
        v-else
        class="absolute top-1/2 left-4 -translate-y-1/2 text-xs text-gray-400 italic"
      >
        Click edit to set dates
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  project: any
  timelineStart: Date
  timelineEnd: Date
  periodWidth: number
  zoomLevel: string
  showProgress: boolean
  totalPeriods: number
}>()

defineEmits(['click', 'edit'])

const { getStatusColor } = useProjectStatuses()

const statusColor = computed(() => {
  return getStatusColor(props.project.status)
})

const hasValidDates = computed(() => {
  return props.project.start_date && props.project.target_end_date
})

// Total timeline width in pixels (excluding the project name column)
const timelineWidth = computed(() => {
  return props.totalPeriods * props.periodWidth
})

// Total timeline duration in days
const timelineDays = computed(() => {
  const start = new Date(props.timelineStart)
  const end = new Date(props.timelineEnd)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay))
})

const barStyle = computed(() => {
  if (!hasValidDates.value) return {}
  
  const projectStart = new Date(props.project.start_date)
  const projectEnd = new Date(props.project.target_end_date)
  const timelineStart = new Date(props.timelineStart)
  const timelineEnd = new Date(props.timelineEnd)
  
  const msPerDay = 24 * 60 * 60 * 1000
  
  // Calculate days from timeline start to project start
  const daysFromStart = (projectStart.getTime() - timelineStart.getTime()) / msPerDay
  // Calculate project duration in days
  const projectDuration = Math.max(1, (projectEnd.getTime() - projectStart.getTime()) / msPerDay)
  
  // Calculate as percentage of total timeline
  const totalDays = timelineDays.value
  const leftPercent = (daysFromStart / totalDays) * 100
  const widthPercent = (projectDuration / totalDays) * 100
  
  // Clamp values to stay within timeline bounds
  const clampedLeft = Math.max(0, Math.min(100, leftPercent))
  const clampedWidth = Math.max(2, Math.min(100 - clampedLeft, widthPercent))
  
  // Use project color or status color
  const bgColor = props.project.roadmap_color || getStatusColor(props.project.status)
  
  return {
    left: clampedLeft + '%',
    width: clampedWidth + '%',
    backgroundColor: bgColor,
    minWidth: '60px'
  }
})

const todayPosition = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const timelineStart = new Date(props.timelineStart)
  const timelineEnd = new Date(props.timelineEnd)
  
  // Check if today is within timeline range
  if (today < timelineStart || today > timelineEnd) {
    return -1 // Hide marker
  }
  
  const msPerDay = 24 * 60 * 60 * 1000
  const daysFromStart = (today.getTime() - timelineStart.getTime()) / msPerDay
  const totalDays = timelineDays.value
  
  return (daysFromStart / totalDays) * 100
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
