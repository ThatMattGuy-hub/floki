<template>
  <div class="w-full h-64">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    <div v-else class="text-center py-8 text-gray-400">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import type { WidgetResult, WidgetConfig } from '~/types/reporting'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  result: WidgetResult
  config: WidgetConfig
}>()

const chartData = computed(() => {
  if (!props.result.rows.length) return null

  const labels = props.result.rows.map(row => String(row[0] || ''))
  const datasets = props.result.columns.slice(1).map((col, index) => ({
    label: col.label,
    data: props.result.rows.map(row => Number(row[index + 1]) || 0),
    backgroundColor: getColor(index),
    borderColor: getColor(index),
    borderWidth: 1
  }))

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.config.style?.showLegend ?? true,
      position: props.config.style?.legendPosition || 'top'
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}))

const getColor = (index: number): string => {
  const colors = [
    'rgba(59, 130, 246, 0.8)',  // blue
    'rgba(16, 185, 129, 0.8)',  // green
    'rgba(249, 115, 22, 0.8)',  // orange
    'rgba(139, 92, 246, 0.8)',  // purple
    'rgba(236, 72, 153, 0.8)',  // pink
  ]
  return colors[index % colors.length]
}
</script>
