<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../utils/formatDate';

import Button from 'primevue/button';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Chart from 'primevue/chart';
import Avatar from 'primevue/avatar';
import Skeleton from 'primevue/skeleton';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseMetricCard from '../../components/common/BaseMetricCard.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';
import BaseSectionCard from '../../components/common/BaseSectionCard.vue';

const router = useRouter();
const dashboardStore = useDashboardStore();
const authStore = useAuthStore();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Dashboard' }
]);

const getChartOptions = () => {
  return {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };
};

const getPieOptions = () => {
  return {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
};

const chartOptions = ref(getChartOptions());
const pieOptions = ref(getPieOptions());

const averageScoreData = computed(() => {
  if (!dashboardStore.chartData?.averageScoreChart) return null;
  return {
    labels: dashboardStore.chartData.averageScoreChart.labels,
    datasets: [
      {
        label: 'Rata-rata Nilai',
        data: dashboardStore.chartData.averageScoreChart.data,
        backgroundColor: '#0984e3',
        borderRadius: 4
      }
    ]
  };
});

const statusDistributionData = computed(() => {
  if (!dashboardStore.chartData?.statusDistributionChart) return null;
  return {
    labels: dashboardStore.chartData.statusDistributionChart.labels,
    datasets: [
      {
        data: dashboardStore.chartData.statusDistributionChart.data,
        backgroundColor: [
          '#10b981', // Optimal - Green
          '#3b82f6', // Baik - Blue
          '#eab308', // Cukup - Yellow
          '#f97316', // Perlu Pembinaan - Orange
          '#ef4444'  // Kurang - Red
        ]
      }
    ]
  };
});

const getActionMenuItems = (data: any) => {
  return [
    { label: 'Lihat Detail', icon: 'pi pi-eye', command: () => console.log('Lihat', data) },
    { label: 'Input Nilai', icon: 'pi pi-pencil', command: () => console.log('Input', data) },
    { label: 'Cetak', icon: 'pi pi-print', command: () => console.log('Cetak', data) },
    { separator: true },
    { label: 'Batalkan', icon: 'pi pi-times', command: () => console.log('Batal', data) }
  ];
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

onMounted(() => {
  dashboardStore.fetchDashboardData();
});
</script>

<template>
  <div>
    <BasePageHeader 
      title="Dashboard" 
      subtitle="Ringkasan supervisi guru dan monitoring mutu pembelajaran."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <div class="flex gap-2 flex-wrap justify-end">
          <Button label="Isi Refleksi" icon="pi pi-comment" outlined severity="info" @click="router.push('/refleksi')" v-if="authStore.role === 'guru'" />
          <Button label="Peta Kelemahan" icon="pi pi-exclamation-triangle" outlined severity="warning" @click="router.push('/laporan/peta-kelemahan')" v-if="['admin', 'kurikulum'].includes(authStore.role)" />
          <Button label="Rapor Guru" icon="pi pi-id-card" outlined severity="secondary" @click="router.push(authStore.role === 'guru' ? '/guru/rapor' : '/laporan/rapor-guru')" />
          <Button label="Jadwalkan" icon="pi pi-calendar-plus" outlined severity="primary" v-if="['admin', 'kurikulum', 'penilai'].includes(authStore.role)" />
          <Button label="Mulai Supervisi" icon="pi pi-play" @click="router.push('/supervisi/mulai')" v-if="['admin', 'kurikulum', 'penilai'].includes(authStore.role)" />
        </div>
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="dashboardStore.error" 
      title="Gagal Memuat Data" 
      :description="dashboardStore.error" 
      @retry="dashboardStore.fetchDashboardData" 
    />

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <BaseMetricCard 
          title="Total Guru" 
          :value="dashboardStore.stats?.totalTeachers || 0" 
          icon="pi pi-users" 
          :loading="dashboardStore.loading" 
        />
        <BaseMetricCard 
          title="Total Supervisi" 
          :value="dashboardStore.stats?.totalSupervisions || 0" 
          icon="pi pi-file" 
          :loading="dashboardStore.loading" 
        />
        <BaseMetricCard 
          title="Selesai" 
          :value="dashboardStore.stats?.completedSupervisions || 0" 
          icon="pi pi-check-circle" 
          :loading="dashboardStore.loading" 
        />
        <BaseMetricCard 
          title="Terjadwal" 
          :value="dashboardStore.stats?.scheduledSupervisions || 0" 
          icon="pi pi-calendar" 
          :loading="dashboardStore.loading" 
        />
        <BaseMetricCard 
          title="Rata-rata Nilai" 
          :value="dashboardStore.stats?.averageScore || 0" 
          icon="pi pi-star" 
          :loading="dashboardStore.loading" 
        />
        <BaseMetricCard 
          title="Perlu Perhatian" 
          :value="dashboardStore.stats?.attentionTeachers || 0" 
          icon="pi pi-exclamation-triangle" 
          :loading="dashboardStore.loading" 
        />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <BaseSectionCard title="Nilai Rata-rata per Instrumen" class="lg:col-span-2">
            <Skeleton v-if="dashboardStore.loading" height="300px" />
            <Chart v-else-if="averageScoreData" type="bar" :data="averageScoreData" :options="chartOptions" class="h-[300px]" />
        </BaseSectionCard>

        <BaseSectionCard title="Distribusi Status">
            <Skeleton v-if="dashboardStore.loading" height="300px" shape="circle" class="mx-auto" width="250px" />
            <div v-else-if="statusDistributionData" class="flex justify-center items-center h-[300px]">
              <Chart type="doughnut" :data="statusDistributionData" :options="pieOptions" class="w-full max-w-[250px]" />
            </div>
        </BaseSectionCard>
      </div>

      <!-- Tables Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Upcoming Supervisions -->
        <BaseSectionCard class="xl:col-span-2">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-800">Jadwal Supervisi Terdekat</h3>
            <Button label="Lihat Semua" link class="!p-0" @click="router.push('/supervisi')" />
          </template>
            <DataTable 
              :value="dashboardStore.loading ? new Array(3).fill({}) : dashboardStore.upcomingSupervisions" 
              class="p-datatable-sm" 
              responsiveLayout="scroll"
            >
              <Column field="date" header="Tanggal">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" />
                  <span v-else>{{ formatDate(data.date) }}</span>
                </template>
              </Column>
              <Column field="teacher" header="Guru">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" />
                  <span v-else class="font-medium text-slate-800">{{ data.teacher }}</span>
                </template>
              </Column>
              <Column field="appraiser" header="Penilai">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" />
                  <span v-else class="text-slate-600">{{ data.appraiser }}</span>
                </template>
              </Column>
              <Column field="instrument" header="Instrumen">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" />
                  <span v-else class="text-slate-600 truncate max-w-[150px] inline-block" :title="data.instrument">{{ data.instrument }}</span>
                </template>
              </Column>
              <Column field="status" header="Status">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" width="4rem" />
                  <BaseStatusTag v-else :status="data.status" />
                </template>
              </Column>
              <Column header="Aksi" :exportable="false" style="min-width:4rem">
                <template #body="{ data }">
                  <Skeleton v-if="dashboardStore.loading" shape="circle" size="2rem" />
                  <BaseActionMenu v-else :items="getActionMenuItems(data)" />
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-6 text-slate-500">Tidak ada jadwal supervisi terdekat</div>
              </template>
            </DataTable>
        </BaseSectionCard>

        <!-- Right Column Sidebar -->
        <div class="flex flex-col gap-6">
          <!-- Weak Aspects -->
          <BaseSectionCard title="Aspek Paling Lemah">
              <div v-if="dashboardStore.loading" class="space-y-4">
                <Skeleton v-for="i in 4" :key="i" height="2rem" />
              </div>
              <ul v-else class="space-y-3">
                <li v-for="(aspect, index) in dashboardStore.weakAspects" :key="index" class="flex items-center justify-between">
                  <span class="text-sm text-slate-700">{{ aspect.name }}</span>
                  <span class="text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">{{ aspect.score }}</span>
                </li>
              </ul>
          </BaseSectionCard>

          <!-- Attention Teachers -->
          <BaseSectionCard title="Guru Perlu Perhatian">
              <div v-if="dashboardStore.loading" class="space-y-4">
                <div v-for="i in 3" :key="i" class="flex gap-3 items-center">
                  <Skeleton shape="circle" size="3rem" />
                  <div class="flex-1">
                    <Skeleton width="100%" height="1rem" class="mb-2" />
                    <Skeleton width="60%" height="0.8rem" />
                  </div>
                </div>
              </div>
              <ul v-else class="space-y-4">
                <li v-for="(teacher, index) in dashboardStore.attentionTeachers" :key="index" class="flex items-start gap-3">
                  <Avatar :label="getInitials(teacher.name)" class="bg-slate-200 text-slate-600 font-semibold" shape="circle" size="large" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-slate-800 truncate">{{ teacher.name }}</div>
                    <div class="text-xs text-slate-500 truncate mb-1">{{ teacher.mapel }}</div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold">{{ teacher.score }}</span>
                      <BaseStatusTag :status="teacher.status" class="!text-[10px] !px-1.5 !py-0.5" />
                    </div>
                  </div>
                </li>
              </ul>
          </BaseSectionCard>
        </div>
      </div>
    </template>
  </div>
</template>
