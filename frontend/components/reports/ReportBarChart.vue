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
        label: 'Value',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    }
  }

  // Otherwise, try to extract data from raw_data or array
  const rawData = props.data.raw_data || props.data
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { labels: [], datasets: [] }
  }

  // Use first field as x-axis, second as y-axis (or use config)
  const xAxis = props.config?.xAxis || Object.keys(rawData[0])[0]
  const yAxis = props.config?.yAxis || Object.keys(rawData[0]).filter(k => k !== xAxis)[0]

  const labels = rawData.map((row: any) => String(row[xAxis] || ''))
  const values = rawData.map((row: any) => Number(row[yAxis]) || 0)

  return {
    labels,
    datasets: [{
      label: yAxis,
      data: values,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
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
        y: {
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
