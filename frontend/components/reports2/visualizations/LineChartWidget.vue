<template>
  <div class="w-full h-64">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    <div v-else class="text-center py-8 text-gray-400">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'
import type { WidgetResult, WidgetConfig } from '~/types/reporting'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

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
    borderColor: getColor(index),
    backgroundColor: getColor(index, 0.1),
    tension: 0.3,
    fill: true
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

const getColor = (index: number, alpha = 1): string => {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`,  // blue
    `rgba(16, 185, 129, ${alpha})`,  // green
    `rgba(249, 115, 22, ${alpha})`,  // orange
    `rgba(139, 92, 246, ${alpha})`,  // purple
    `rgba(236, 72, 153, ${alpha})`,  // pink
  ]
  return colors[index % colors.length]
}
</script>
