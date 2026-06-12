<script setup lang="ts">
import { computed } from 'vue';
import type { WeaknessAspect } from '../../types/weaknessMap';
import Chart from 'primevue/chart';

const props = defineProps<{
  aspects: WeaknessAspect[];
}>();

const chartData = computed(() => {
  if (!props.aspects || props.aspects.length === 0) return null;
  
  const sorted = [...props.aspects].sort((a, b) => a.averageScore - b.averageScore).slice(0, 5); // top 5 weakest
  const labels = sorted.map(a => a.category);
  const data = sorted.map(a => a.averageScore);

  return {
    labels,
    datasets: [
      {
        label: 'Rata-rata Skor Aspek Terlemah',
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        data,
        borderRadius: 4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // horizontal bar
  scales: {
    x: {
      min: 0,
      max: 100,
      grid: {
        color: '#f1f5f9'
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};
</script>

<template>
  <div class="h-64 relative">
    <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" class="w-full h-full" />
    <div v-else class="absolute inset-0 flex items-center justify-center text-slate-400">
      <p>Tidak ada data kelemahan</p>
    </div>
  </div>
</template>
