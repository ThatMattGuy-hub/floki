<template>
  <div class="w-full h-96">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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
  'rgba(236, 72, 153, 0.8)'
]

const prepareChartData = () => {
  if (!props.data || !Array.isArray(props.data)) {
    return { labels: [], datasets: [] }
  }

  const rawData = props.data.raw_data || props.data
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { labels: [], datasets: [] }
  }

  const xAxis = props.config?.xAxis || Object.keys(rawData[0])[0]
  const yAxes = props.config?.yAxis || Object.keys(rawData[0]).filter(k => k !== xAxis)

  const labels = rawData.map((row: any) => String(row[xAxis] || ''))

  const datasets = yAxes.map((field: string, index: number) => ({
    label: field,
    data: rawData.map((row: any) => Number(row[field]) || 0),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length].replace('0.8', '1'),
    borderWidth: 1
  }))

  return { labels, datasets }
}

const createChart = () => {
  if (!chartCanvas.value) return

  const chartData = prepareChartData()
  
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new ChartJS(chartCanvas.value, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: props.config?.showLegend !== false,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          beginAtZero: true
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
