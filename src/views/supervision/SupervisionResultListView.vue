<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FilterMatchMode } from '@primevue/core/api';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { usePeriodStore } from '../../stores/periodStore';
import { useReflectionStore } from '../../stores/reflectionStore';
import { useAuthStore } from '../../stores/authStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import ReflectionStatusTag from '../../components/reflection/ReflectionStatusTag.vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const router = useRouter();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const periodStore = usePeriodStore();
const reflectionStore = useReflectionStore();
const authStore = useAuthStore();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Daftar Hasil' }
]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  periodId: { value: null, matchMode: FilterMatchMode.EQUALS },
  finalStatus: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const statusOptions = [
  { label: 'Semua Status', value: null },
  { label: 'Optimal', value: 'Optimal' },
  { label: 'Baik', value: 'Baik' },
  { label: 'Cukup', value: 'Cukup' },
  { label: 'Perlu Pembinaan', value: 'Perlu Pembinaan' },
  { label: 'Kurang', value: 'Kurang' }
];

const periodOptions = computed(() => {
  return [
    { label: 'Semua Periode', value: null },
    ...periodStore.periods.map(p => ({ label: p.name, value: p.id }))
  ];
});

onMounted(async () => {
  await Promise.all([
    supervisionStore.fetchSupervisions(),
    teacherStore.fetchTeachers(),
    instrumentStore.fetchInstruments(),
    periodStore.fetchPeriods(),
    reflectionStore.fetchReflections()
  ]);
});

const getReflection = (supervisionId: string) => reflectionStore.reflections.find(r => r.supervisionId === supervisionId);
const getReflectionStatus = (supervisionId: string) => getReflection(supervisionId)?.status || 'BELUM_DIISI';
const isGuru = computed(() => authStore.role === 'guru');

const getTeacherName = (id: string) => teacherStore.teachers.find(t => t.id === id)?.name || id;
const getSupervisorName = (id: string) => teacherStore.teachers.find(t => t.id === id)?.name || 'Admin';
const getInstrumentName = (ids: string[] | string) => {
  if (!ids) return '-';
  const idArray = Array.isArray(ids) ? ids : [ids];
  return idArray.map(id => instrumentStore.instruments.find(i => i.id === id)?.name || id).join(', ');
};
</script>

<template>
  <div class="flex flex-col gap-4">
    
    <BasePageHeader 
      title="Daftar Hasil Supervisi" 
      subtitle="Rekapitulasi hasil supervisi yang telah selesai dinilai."
      :breadcrumbs="breadcrumbs"
    />

    <Card class="border-none shadow-sm">
      <template #content>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div class="flex gap-2 w-full md:w-auto">
            <Dropdown v-model="filters.periodId.value" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="Pilih Periode" class="w-full md:w-48" />
            <Dropdown v-model="filters.finalStatus.value" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Status Nilai" class="w-full md:w-40" />
          </div>
          <IconField iconPosition="left" class="w-full md:w-auto">
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters.global.value" placeholder="Cari guru atau instrumen..." class="w-full md:w-64" />
          </IconField>
        </div>

        <DataTable 
          :value="supervisionStore.completedSupervisions" 
          :paginator="true" 
          :rows="10" 
          dataKey="id" 
          v-model:filters="filters"
          :globalFilterFields="['teacherId', 'supervisorId', 'finalStatus', 'periodId']"
          :loading="supervisionStore.loading"
          emptyMessage="Tidak ada data hasil supervisi."
          responsiveLayout="scroll"
        >
          <template #empty v-if="!supervisionStore.loading">
            <div class="p-4 text-center text-gray-500">
              Data hasil supervisi tidak ditemukan.
            </div>
          </template>

          <Column header="Tanggal" sortable field="supervisionDate">
            <template #body="{ data }">
              <span>{{ data.supervisionDate || data.scheduledDate || '-' }}</span>
            </template>
          </Column>

          <Column header="Guru" field="teacherId" sortable>
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {{ getTeacherName(data.teacherId).charAt(0) }}
                </div>
                <span>{{ getTeacherName(data.teacherId) }}</span>
              </div>
            </template>
          </Column>

          <Column header="Instrumen" field="instrumentIds" sortable>
            <template #body="{ data }">
              <span>{{ getInstrumentName(data.instrumentIds) }}</span>
            </template>
          </Column>

          <Column header="Penilai" field="supervisorId" sortable>
            <template #body="{ data }">
              <span>{{ getSupervisorName(data.supervisorId) }}</span>
            </template>
          </Column>

          <Column header="Hasil Supervisi" field="finalScore" sortable>
            <template #body="{ data }">
              <div class="flex flex-col">
                <div class="flex items-baseline gap-1">
                  <span class="font-bold text-primary">{{ data.finalScore.toFixed(2) }}</span>
                  <span class="text-xs text-gray-500">({{ data.totalScore }}/{{ data.maxScore }})</span>
                </div>
                <span class="font-medium text-xs mt-1" :class="data.finalStatus === 'Kurang' || data.finalStatus === 'Perlu Pembinaan' ? 'text-red-600' : 'text-green-600'">
                  {{ data.finalStatus }}
                </span>
              </div>
            </template>
          </Column>

          <Column header="Refleksi">
            <template #body="{ data }">
              <template v-if="getReflectionStatus(data.id) === 'BELUM_DIISI'">
                <Button 
                  v-if="isGuru"
                  label="Isi Refleksi"
                  icon="pi pi-pencil" 
                  severity="primary"
                  outlined rounded size="small"
                  @click="router.push(`/refleksi/${data.id}`)" 
                />
                <ReflectionStatusTag v-else status="BELUM_DIISI" />
              </template>
              <template v-else>
                <!-- Clickable tag for better UX, or just tag as requested -->
                <div class="cursor-pointer hover:opacity-80 transition-opacity" @click="router.push(`/refleksi/${data.id}`)" title="Lihat/Edit Refleksi">
                  <ReflectionStatusTag :status="getReflectionStatus(data.id)" />
                </div>
              </template>
            </template>
          </Column>

          <Column :exportable="false" style="min-width: 6rem" bodyClass="text-center">
            <template #body="{ data }">
              <Button icon="pi pi-eye" outlined rounded @click="router.push(`/supervisi/${data.id}/hasil`)" title="Lihat Detail" class="mr-2" />
              <Button icon="pi pi-print" severity="secondary" outlined rounded title="Cetak" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
