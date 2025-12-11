<template>
  <div class="w-full h-64 flex items-center justify-center">
    <div class="w-full max-w-sm">
      <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
      <div v-else class="text-center py-8 text-gray-400">
        No data available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import type { WidgetResult, WidgetConfig } from '~/types/reporting'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
  result: WidgetResult
  config: WidgetConfig
}>()

const chartData = computed(() => {
  if (!props.result.rows.length) return null

  const labels = props.result.rows.map(row => String(row[0] || ''))
  const data = props.result.rows.map(row => Number(row[1]) || 0)
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: labels.map((_, index) => getColor(index)),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.config.style?.showLegend ?? true,
      position: props.config.style?.legendPosition || 'right'
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}))

const getColor = (index: number): string => {
  const colors = [
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(16, 185, 129, 0.8)',   // green
    'rgba(249, 115, 22, 0.8)',   // orange
    'rgba(139, 92, 246, 0.8)',   // purple
    'rgba(236, 72, 153, 0.8)',   // pink
    'rgba(245, 158, 11, 0.8)',   // amber
    'rgba(20, 184, 166, 0.8)',   // teal
    'rgba(239, 68, 68, 0.8)',    // red
  ]
  return colors[index % colors.length]
}
</script>
