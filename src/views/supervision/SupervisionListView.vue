<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FilterMatchMode } from '@primevue/core/api';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { usePeriodStore } from '../../stores/periodStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const periodStore = usePeriodStore();
const confirm = useConfirm();
const toast = useToast();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Data Supervisi' }
]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  periodId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const statusOptions = [
  { label: 'Semua Status', value: null },
  { label: 'Terjadwal', value: 'TERJADWAL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Selesai', value: 'SELESAI' },
  { label: 'Dibatalkan', value: 'DIBATALKAN' }
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
    periodStore.fetchPeriods()
  ]);
});

const getTeacherName = (id: string) => teacherStore.teachers.find(t => t.id === id)?.name || id;
const getSupervisorName = (id: string) => teacherStore.teachers.find(t => t.id === id)?.name || 'Admin';
const getInstrumentName = (ids: string[] | string) => {
  if (!ids) return '-';
  const idArray = Array.isArray(ids) ? ids : [ids];
  return idArray.map(id => instrumentStore.instruments.find(i => i.id === id)?.name || id).join(', ');
};

const formatScore = (supervision: any) => {
  if (supervision.status === 'SELESAI') {
    return supervision.finalScore;
  }
  return '-';
};

const getMenuItems = (data: any) => {
  const items: any[] = [];
  
  if (!data) return items;

  if (data.status === 'TERJADWAL') {
    items.push({ label: 'Input Nilai', icon: 'pi pi-pencil', command: () => router.push(`/supervisi/${data.id}/input`) });
    items.push({ label: 'Lihat Detail', icon: 'pi pi-eye', command: () => router.push(`/supervisi/${data.id}/hasil`) });
    items.push({ label: 'Batalkan', icon: 'pi pi-times', command: () => confirmCancel(data) });
  } else if (data.status === 'DRAFT') {
    items.push({ label: 'Lanjutkan Penilaian', icon: 'pi pi-pencil', command: () => router.push(`/supervisi/${data.id}/input`) });
    items.push({ label: 'Lihat Detail', icon: 'pi pi-eye', command: () => router.push(`/supervisi/${data.id}/hasil`) });
    items.push({ label: 'Batalkan', icon: 'pi pi-times', command: () => confirmCancel(data) });
  } else if (data.status === 'SELESAI') {
    items.push({ label: 'Lihat Hasil', icon: 'pi pi-file', command: () => router.push(`/supervisi/${data.id}/hasil`) });
    items.push({ label: 'Cetak', icon: 'pi pi-print', command: () => printResult() });
  } else if (data.status === 'DIBATALKAN') {
    items.push({ label: 'Lihat Detail', icon: 'pi pi-eye', command: () => router.push(`/supervisi/${data.id}/hasil`) });
  }
  return items;
};

const confirmCancel = (data: any) => {
  confirm.require({
    message: 'Apakah Anda yakin ingin membatalkan supervisi ini?',
    header: 'Konfirmasi Pembatalan',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Ya, Batalkan',
    rejectLabel: 'Tidak',
    accept: async () => {
      try {
        await supervisionStore.cancelSupervision(data.id);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Supervisi berhasil dibatalkan', life: 3000 });
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal membatalkan supervisi', life: 3000 });
      }
    }
  });
};

const printResult = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Fitur cetak akan tersedia segera.', life: 3000 });
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <BasePageHeader 
      title="Data Supervisi" 
      subtitle="Pantau jadwal, draft, dan hasil supervisi guru."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <div class="flex gap-2">
          <Button label="Mulai Supervisi" icon="pi pi-plus" @click="router.push('/supervisi/mulai')" />
        </div>
      </template>
    </BasePageHeader>

    <Card class="border-none shadow-sm">
      <template #content>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div class="flex gap-2 w-full md:w-auto">
            <Dropdown v-model="filters.periodId.value" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="Pilih Periode" class="w-full md:w-48" />
            <Dropdown v-model="filters.status.value" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Status" class="w-full md:w-40" />
          </div>
          <IconField iconPosition="left" class="w-full md:w-auto">
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters.global.value" placeholder="Cari guru atau instrumen..." class="w-full md:w-64" />
          </IconField>
        </div>

        <DataTable 
          :value="supervisionStore.supervisions" 
          :paginator="true" 
          :rows="10" 
          dataKey="id" 
          v-model:filters="filters"
          :globalFilterFields="['teacherId', 'supervisorId', 'status', 'periodId']"
          :loading="supervisionStore.loading"
          emptyMessage="Tidak ada data supervisi."
          responsiveLayout="scroll"
        >
          <template #empty v-if="!supervisionStore.loading">
            <div class="p-4 text-center text-gray-500">
              Data supervisi tidak ditemukan.
            </div>
          </template>

          <Column header="Tanggal" sortable field="scheduledDate">
            <template #body="{ data }">
              <span v-if="data.status === 'TERJADWAL'">{{ data.scheduledDate }} ({{ data.scheduledTime }})</span>
              <span v-else>{{ data.supervisionDate || data.scheduledDate || '-' }}</span>
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
              <span>{{ getInstrumentName(data.instrumentId || data.instrumentIds) }}</span>
            </template>
          </Column>

          <Column header="Penilai" field="supervisorId" sortable>
            <template #body="{ data }">
              <span>{{ getSupervisorName(data.supervisorId) }}</span>
            </template>
          </Column>

          <Column header="Status" field="status" sortable>
            <template #body="{ data }">
              <BaseStatusTag :status="data.status" />
            </template>
          </Column>
          
          <Column header="Nilai" field="finalScore" sortable>
            <template #body="{ data }">
              <span class="font-medium" :class="data.status === 'SELESAI' ? 'text-primary' : 'text-gray-400'">
                {{ formatScore(data) }}
              </span>
            </template>
          </Column>

          <Column :exportable="false" style="min-width: 8rem" bodyClass="text-center">
            <template #body="{ data }">
              <BaseActionMenu :items="getMenuItems(data)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
