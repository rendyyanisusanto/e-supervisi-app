<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePeriodStore } from '../../stores/periodStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { formatDate } from '../../utils/formatDate';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Checkbox from 'primevue/checkbox';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';

const periodStore = usePeriodStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Master Data' },
  { label: 'Periode' }
]);

const searchQuery = ref('');
const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const form = ref({
  id: '',
  name: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
  isActive: false
});

onMounted(() => {
  periodStore.fetchPeriods();
});

const filteredPeriods = computed(() => {
  if (!periodStore.periods) return [];
  if (!searchQuery.value) return periodStore.periods;
  return periodStore.periods.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openAddDialog = () => {
  form.value = { id: '', name: '', startDate: null, endDate: null, isActive: false };
  dialogMode.value = 'add';
  submitted.value = false;
  dialogVisible.value = true;
};

const openEditDialog = (data: any) => {
  form.value = { 
    ...data, 
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate)
  };
  dialogMode.value = 'edit';
  submitted.value = false;
  dialogVisible.value = true;
};

const savePeriod = async () => {
  submitted.value = true;
  
  if (!form.value.name || !form.value.startDate || !form.value.endDate) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Harap isi semua field wajib', life: 3000 });
    return;
  }
  
  if (form.value.endDate < form.value.startDate) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Tanggal selesai tidak boleh sebelum tanggal mulai', life: 3000 });
    return;
  }

  const payload = {
    name: form.value.name,
    startDate: form.value.startDate.toISOString().split('T')[0],
    endDate: form.value.endDate.toISOString().split('T')[0],
    isActive: form.value.isActive
  };

  try {
    if (dialogMode.value === 'add') {
      await periodStore.addPeriod(payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Periode berhasil ditambahkan', life: 3000 });
    } else {
      await periodStore.updatePeriod(form.value.id, payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Periode berhasil diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleStatus = async (data: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin ${data.isActive ? 'menonaktifkan' : 'mengaktifkan'} periode ini? ${!data.isActive ? 'Periode aktif lainnya akan dinonaktifkan.' : ''}`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await periodStore.updatePeriod(data.id, { isActive: !data.isActive });
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status periode diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const confirmDelete = (data: any) => {
  confirm.require({
    message: 'Apakah Anda yakin ingin menghapus periode ini?',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await periodStore.deletePeriod(data.id);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Periode berhasil dihapus', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus periode', life: 3000 });
      }
    }
  });
};

const getActionItems = (data: any) => [
  { label: 'Edit', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: data.isActive ? 'Nonaktifkan' : 'Aktifkan', icon: data.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle', command: () => toggleStatus(data) },
  { separator: true },
  { label: 'Hapus', icon: 'pi pi-trash', command: () => confirmDelete(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Master Periode" 
      subtitle="Kelola periode supervisi seperti tahun ajaran, semester, atau tahap supervisi."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Periode" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="periodStore.error" 
      title="Gagal Memuat Data" 
      :description="periodStore.error" 
      @retry="periodStore.fetchPeriods" 
    />

    <Card v-else class="border-none shadow-sm">
      <template #content>
        <BaseLoadingSkeleton v-if="periodStore.loading && periodStore.periods.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari nama periode..." />

          <DataTable 
            :value="filteredPeriods" 
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="periodStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada data periode" 
                description="Belum ada data periode yang ditambahkan atau tidak ada yang cocok dengan pencarian Anda." 
                icon="pi pi-calendar"
              />
            </template>

            <Column field="name" header="Nama Periode" sortable>
              <template #body="{ data }">
                <span class="font-semibold text-slate-800">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="startDate" header="Tanggal Mulai" sortable>
              <template #body="{ data }">{{ formatDate(data.startDate) }}</template>
            </Column>
            <Column field="endDate" header="Tanggal Selesai" sortable>
              <template #body="{ data }">{{ formatDate(data.endDate) }}</template>
            </Column>
            <Column field="isActive" header="Status" sortable>
              <template #body="{ data }">
                <BaseStatusTag :status="data.isActive ? 'Aktif' : 'Tidak Aktif'" />
              </template>
            </Column>
            <Column header="Aksi" :exportable="false" style="min-width:4rem">
              <template #body="{ data }">
                <BaseActionMenu :items="getActionItems(data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="dialogVisible" :style="{width: '450px'}" :header="dialogMode === 'add' ? 'Tambah Periode' : 'Edit Periode'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="flex flex-col gap-1">
          <label for="name" class="block text-sm font-medium text-slate-700">Nama Periode <span class="text-red-500">*</span></label>
          <InputText id="name" v-model.trim="form.name" required autofocus :class="[{'p-invalid': submitted && !form.name}, 'w-full']" />
          <small class="text-red-500" v-if="submitted && !form.name">Nama periode wajib diisi.</small>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label for="startDate" class="block text-sm font-medium text-slate-700">Tanggal Mulai <span class="text-red-500">*</span></label>
            <DatePicker id="startDate" v-model="form.startDate" dateFormat="dd/mm/yy" :class="[{'p-invalid': submitted && !form.startDate}, 'w-full']" />
            <small class="text-red-500" v-if="submitted && !form.startDate">Wajib diisi.</small>
          </div>
          <div class="flex flex-col gap-1">
            <label for="endDate" class="block text-sm font-medium text-slate-700">Tanggal Selesai <span class="text-red-500">*</span></label>
            <DatePicker id="endDate" v-model="form.endDate" dateFormat="dd/mm/yy" :class="[{'p-invalid': submitted && (!form.endDate || (form.startDate && form.endDate < form.startDate))}, 'w-full']" />
            <small class="text-red-500" v-if="submitted && !form.endDate">Wajib diisi.</small>
          </div>
        </div>

        <div class="field flex items-center mt-4">
          <Checkbox id="isActive" v-model="form.isActive" :binary="true" />
          <label for="isActive" class="ml-2 text-sm text-slate-700 cursor-pointer">Set sebagai Periode Aktif</label>
        </div>
        <small v-if="form.isActive" class="text-blue-600 block mt-1">Periode aktif akan menjadi default saat membuat supervisi baru. Periode aktif sebelumnya akan dinonaktifkan.</small>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="savePeriod" :loading="periodStore.loading" />
      </template>
    </Dialog>
  </div>
</template>
