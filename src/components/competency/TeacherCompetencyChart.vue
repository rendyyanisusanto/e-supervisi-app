<script setup lang="ts">
import { computed } from 'vue';
import type { TeacherCompetency } from '../../types/competency';
import Chart from 'primevue/chart';

const props = withDefaults(defineProps<{
  competency: TeacherCompetency;
  flat?: boolean;
}>(), {
  flat: false
});

const chartData = computed(() => {
  if (!props.competency) return null;
  
  const labels = props.competency.aspects.map(a => a.category);
  const data = props.competency.aspects.map(a => a.finalScore);

  return {
    labels,
    datasets: [
      {
        label: 'Nilai Kompetensi',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        data
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: {
        display: true
      },
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: {
        stepSize: 20
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
  <div :class="flat ? 'h-full flex flex-col' : 'bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col'">
    <h3 v-if="!flat" class="font-bold text-lg mb-4 text-center">Peta Kompetensi</h3>
    <div class="flex-1 relative flex items-center justify-center" :class="flat ? 'min-h-[200px]' : 'min-h-[300px]'">
      <Chart v-if="chartData && competency.aspects.length > 0" type="radar" :data="chartData" :options="chartOptions" class="w-full h-full" />
      <div v-else class="text-center text-slate-400">
        <i class="pi pi-chart-pie text-4xl mb-2"></i>
        <p>Data kompetensi belum tersedia</p>
      </div>
    </div>
  </div>
</template>
