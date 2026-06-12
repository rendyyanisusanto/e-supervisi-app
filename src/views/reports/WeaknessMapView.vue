<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useReportStore } from '../../stores/reportStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { usePeriodStore } from '../../stores/periodStore';
import { useRouter } from 'vue-router';

import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import WeaknessAspectChart from '../../components/report/WeaknessAspectChart.vue';

const router = useRouter();
const reportStore = useReportStore();
const teacherStore = useTeacherStore();
const periodStore = usePeriodStore();

const selectedPeriodId = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    teacherStore.fetchTeachers(),
    periodStore.fetchPeriods()
  ]);
  
  // Set default period
  const activePeriod = periodStore.periods.find(p => p.isActive);
  if (activePeriod) {
    selectedPeriodId.value = String(activePeriod.id);
  } else if (periodStore.periods.length > 0) {
    selectedPeriodId.value = String(periodStore.periods[0].id);
  }

  loading.value = false;
});

watch(selectedPeriodId, async (newPeriod) => {
  if (newPeriod) {
    await reportStore.fetchWeaknessMap(newPeriod);
  } else {
    reportStore.currentWeaknessMap = null;
  }
});
</script>

<template>
  <div class="flex flex-col gap-4 relative">
    <BasePageHeader 
      title="Peta Kelemahan Guru" 
      subtitle="Analisis aspek dan item yang paling banyak mendapatkan skor rendah untuk perbaikan terarah."
      icon="pi pi-exclamation-triangle"
    />

    <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-2">
      <div class="font-medium text-slate-700">Pilih Periode:</div>
      <Dropdown 
        v-model="selectedPeriodId" 
        :options="periodStore.periods" 
        optionLabel="name" 
        optionValue="id" 
        placeholder="Pilih Periode" 
        class="w-full sm:w-80" 
      />
    </div>

    <div v-if="loading || reportStore.loading" class="grid grid-cols-1 gap-6">
      <Skeleton width="100%" height="10rem" />
      <Skeleton width="100%" height="20rem" />
    </div>

    <div v-else-if="reportStore.currentWeaknessMap">
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-red-50 border border-red-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <i class="pi pi-list"></i>
            </div>
            <div class="text-sm font-semibold text-red-800">Item Bermasalah</div>
          </div>
          <div class="text-3xl font-bold text-red-900">{{ reportStore.currentWeaknessMap.weakItemsCount }}</div>
        </div>
        
        <div class="bg-orange-50 border border-orange-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <i class="pi pi-chart-pie"></i>
            </div>
            <div class="text-sm font-semibold text-orange-800">Aspek Terlemah</div>
          </div>
          <div class="text-xl font-bold text-orange-900 leading-tight mt-1">{{ reportStore.currentWeaknessMap.weakestAspect }}</div>
        </div>

        <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <i class="pi pi-users"></i>
            </div>
            <div class="text-sm font-semibold text-yellow-800">Guru Perlu Perhatian</div>
          </div>
          <div class="text-3xl font-bold text-yellow-900">{{ reportStore.currentWeaknessMap.teachersNeedingAttentionCount }}</div>
        </div>

        <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <i class="pi pi-building"></i>
            </div>
            <div class="text-sm font-semibold text-blue-800">Rata-rata Sekolah</div>
          </div>
          <div class="text-3xl font-bold text-blue-900">{{ reportStore.currentWeaknessMap.schoolAverageScore.toFixed(1) }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Chart -->
        <div class="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-4 text-slate-800">Aspek Terlemah</h3>
          <WeaknessAspectChart :aspects="reportStore.currentWeaknessMap.aspects" />
        </div>

        <!-- Insight -->
        <div class="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <h3 class="font-bold text-lg mb-4 text-slate-800">Rekomendasi Tindak Lanjut</h3>
          
          <div class="space-y-4">
            <div class="flex gap-4 items-start bg-slate-50 p-4 rounded-lg">
              <i class="pi pi-info-circle text-blue-500 text-xl mt-0.5"></i>
              <div>
                <h4 class="font-semibold text-slate-700">Fokus Pembinaan Aspek</h4>
                <p class="text-slate-600 text-sm mt-1">Disarankan kurikulum membuat program pembinaan atau In-House Training (IHT) pada aspek <strong>{{ reportStore.currentWeaknessMap.weakestAspect }}</strong> karena memiliki rata-rata paling rendah di tingkat sekolah.</p>
              </div>
            </div>
            
            <div class="flex gap-4 items-start bg-slate-50 p-4 rounded-lg">
              <i class="pi pi-users text-orange-500 text-xl mt-0.5"></i>
              <div>
                <h4 class="font-semibold text-slate-700">Pendampingan Guru</h4>
                <p class="text-slate-600 text-sm mt-1">Terdapat <strong>{{ reportStore.currentWeaknessMap.teachersNeedingAttentionCount }} guru</strong> yang memiliki beberapa kelemahan signifikan. Pendampingan personal sangat dianjurkan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Item Bermasalah Table -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        <h3 class="font-bold text-lg mb-4 text-slate-800">Item Instrumen yang Sering Mendapat Skor Rendah</h3>
        <DataTable :value="reportStore.currentWeaknessMap.items.slice(0, 10)" responsiveLayout="scroll" class="p-datatable-sm">
          <Column field="itemCode" header="Kode" style="width: 100px;"></Column>
          <Column field="itemDescription" header="Deskripsi Item"></Column>
          <Column field="category" header="Aspek"></Column>
          <Column header="Rata-rata" style="width: 120px; text-align: center;">
            <template #body="slotProps">
              <span class="font-bold text-red-600">{{ slotProps.data.averageScore.toFixed(1) }} / {{ slotProps.data.maxScore }}</span>
            </template>
          </Column>
          <Column field="affectedTeachersCount" header="Jml Guru" style="width: 100px; text-align: center;"></Column>
        </DataTable>
      </div>

      <!-- Guru Perlu Perhatian Table -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 class="font-bold text-lg mb-4 text-slate-800">Daftar Guru Membutuhkan Perhatian</h3>
        <DataTable :value="reportStore.currentWeaknessMap.teachersAttention" responsiveLayout="scroll" class="p-datatable-sm">
          <Column field="teacherName" header="Nama Guru"></Column>
          <Column field="subjectName" header="Posisi/Mapel"></Column>
          <Column header="Aspek Lemah">
            <template #body="_slotProps">
              <div class="text-sm text-slate-600">{{ _slotProps.data.weakAspects.join(', ') }}</div>
            </template>
          </Column>
          <Column field="weakItemsCount" header="Jml Item Lemah" style="width: 140px; text-align: center;"></Column>
          <Column header="Aksi" bodyStyle="text-align: center">
            <template #body>
              <Button icon="pi pi-chart-pie" label="Rapor" size="small" severity="secondary" outlined 
                      @click="router.push('/guru/rapor')" />
            </template>
          </Column>
        </DataTable>
      </div>

    </div>
  </div>
</template>
