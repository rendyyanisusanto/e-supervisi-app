<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useReportStore } from '../../stores/reportStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';

const reportStore = useReportStore();

onMounted(() => {
  reportStore.fetchIndicatorReport('1');
});

const reportData = computed(() => reportStore.currentIndicatorReport);
</script>

<template>
  <div>
    <BasePageHeader 
      title="Laporan Per Indikator" 
      subtitle="Analisis rata-rata nilai untuk setiap indikator instrumen."
      icon="pi pi-list"
    />

    <div v-if="reportStore.loading" class="p-8 text-center text-slate-500">
      Memuat data...
    </div>

    <div v-else class="space-y-6">
      <Card v-for="instrument in reportData" :key="instrument.instrumentId" class="border-none shadow-sm">
        <template #title>
          <div class="flex justify-between items-center">
            <span>{{ instrument.instrumentName }}</span>
            <div class="text-sm font-normal text-slate-500">
              Total Supervisi: <span class="font-bold text-slate-800">{{ instrument.totalSupervisions }}</span> |
              Rata-rata: <span class="font-bold text-slate-800">{{ instrument.averageScore?.toFixed(1) || '-' }}</span>
            </div>
          </div>
        </template>
        <template #content>
          <DataTable :value="instrument.indicators" class="p-datatable-sm" responsiveLayout="scroll">
            <Column field="code" header="Kode" style="width: 100px"></Column>
            <Column field="description" header="Indikator"></Column>
            <Column field="averageScore" header="Rata-rata Nilai" style="width: 150px; text-align: center">
              <template #body="slotProps">
                <span class="font-bold" :class="{
                  'text-green-600': slotProps.data.averageScore >= 85,
                  'text-blue-600': slotProps.data.averageScore >= 70 && slotProps.data.averageScore < 85,
                  'text-orange-500': slotProps.data.averageScore >= 50 && slotProps.data.averageScore < 70,
                  'text-red-600': slotProps.data.averageScore < 50
                }">
                  {{ slotProps.data.averageScore?.toFixed(1) || '-' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <div v-if="!reportData || reportData.length === 0" class="p-8 text-center bg-white rounded-xl border border-gray-200 text-slate-500">
        Belum ada data nilai indikator.
      </div>
    </div>
  </div>
</template>
