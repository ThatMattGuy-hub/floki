<template>
  <div 
    class="relative inline-block group"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <slot />
    <div
      v-if="showTooltip"
      class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200"
      :class="positionClasses"
    >
      {{ text }}
      <div
        class="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"
        :class="arrowClasses"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const showTooltip = ref(false)

const positionClasses = computed(() => {
  const classes = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }
  return classes[props.position || 'top']
})

const arrowClasses = computed(() => {
  const classes = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2'
  }
  return classes[props.position || 'top']
})
</script>

