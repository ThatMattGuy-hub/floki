<template>
  <div class="w-full h-96">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: any
  config?: any
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const colors = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(34, 197, 94, 0.8)'
]

const prepareChartData = () => {
  if (!props.data || !Array.isArray(props.data)) {
    return { labels: [], datasets: [] }
  }

  // If data has aggregations, use those
  if (props.data.aggregations) {
    const labels = props.data.aggregations.map((agg: any) => agg.alias || agg.field)
    const values = props.data.aggregations.map((agg: any) => agg.value)
    
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    }
  }

  // Otherwise, try to extract data from raw_data or array
  const rawData = props.data.raw_data || props.data
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labelField = props.config?.xAxis || Object.keys(rawData[0])[0]
  const valueField = props.config?.yAxis || Object.keys(rawData[0]).filter(k => k !== labelField)[0]

  const labels = rawData.map((row: any) => String(row[labelField] || ''))
  const values = rawData.map((row: any) => Number(row[valueField]) || 0)

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.slice(0, values.length),
      borderColor: '#fff',
      borderWidth: 2
    }]
  }
}

const createChart = () => {
  if (!chartCanvas.value) return

  const chartData = prepareChartData()
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new ChartJS(chartCanvas.value, {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: props.config?.showLegend !== false,
          position: 'right'
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
    }
  })
}

watch(() => [props.data, props.config], () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
