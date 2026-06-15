<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSubjectStore } from '../../stores/subjectStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';

const subjectStore = useSubjectStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Master Data' },
  { label: 'Mata Pelajaran' }
]);

const searchQuery = ref('');
const selectedGroup = ref<string | null>(null);
const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const groupOptions = [
  { label: 'Umum', value: 'Umum' },
  { label: 'Produktif', value: 'Produktif' },
  { label: 'Muatan Lokal', value: 'Muatan Lokal' },
  { label: 'Pilihan', value: 'Pilihan' }
];

const form = ref({
  id: '',
  code: '',
  name: '',
  groupName: 'Umum',
  isActive: true
});

onMounted(() => {
  subjectStore.fetchSubjects();
});

const filteredSubjects = computed(() => {
  if (!subjectStore.subjects) return [];
  let result = subjectStore.subjects;
  
  if (selectedGroup.value) {
    result = result.filter(s => s.groupName === selectedGroup.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s => 
      (s.name || '').toLowerCase().includes(q) || (s.code || '').toLowerCase().includes(q)
    );
  }
  
  return result;
});

const openAddDialog = () => {
  form.value = { id: '', code: '', name: '', groupName: 'Umum', isActive: true };
  dialogMode.value = 'add';
  submitted.value = false;
  dialogVisible.value = true;
};

const openEditDialog = (data: any) => {
  form.value = { ...data };
  dialogMode.value = 'edit';
  submitted.value = false;
  dialogVisible.value = true;
};

const saveSubject = async () => {
  submitted.value = true;
  
  if (!form.value.name || !form.value.code || !form.value.groupName) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Harap isi semua field wajib', life: 3000 });
    return;
  }

  const payload = { ...form.value };

  try {
    if (dialogMode.value === 'add') {
      await subjectStore.addSubject(payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mata Pelajaran berhasil ditambahkan', life: 3000 });
    } else {
      await subjectStore.updateSubject(form.value.id, payload);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mata Pelajaran berhasil diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleStatus = async (data: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin ${data.isActive ? 'menonaktifkan' : 'mengaktifkan'} mata pelajaran ini?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await subjectStore.updateSubject(data.id, { isActive: !data.isActive });
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const getActionItems = (data: any) => [
  { label: 'Edit', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: data.isActive ? 'Nonaktifkan' : 'Aktifkan', icon: data.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle', command: () => toggleStatus(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Mata Pelajaran" 
      subtitle="Kelola master data mata pelajaran dan kelompoknya."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Mapel" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="subjectStore.error" 
      title="Gagal Memuat Data" 
      :description="subjectStore.error" 
      @retry="subjectStore.fetchSubjects" 
    />

    <Card v-else class="border-none shadow-sm">
      <template #content>
        <BaseLoadingSkeleton v-if="subjectStore.loading && subjectStore.subjects.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari kode atau nama...">
            <template #filters>
              <Select v-model="selectedGroup" :options="groupOptions" optionLabel="label" optionValue="value" placeholder="Pilih Kelompok" showClear class="w-full md:w-48" />
            </template>
          </BaseToolbarFilter>

          <DataTable 
            :value="filteredSubjects" 
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="subjectStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada data mapel" 
                description="Belum ada data mata pelajaran yang sesuai dengan kriteria." 
                icon="pi pi-book"
              />
            </template>

            <Column field="code" header="Kode" sortable>
              <template #body="{ data }">
                <span class="font-mono bg-slate-100 px-2 py-1 rounded text-sm">{{ data.code }}</span>
              </template>
            </Column>
            <Column field="name" header="Nama Mata Pelajaran" sortable>
              <template #body="{ data }">
                <span class="font-semibold text-slate-800">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="groupName" header="Kelompok" sortable>
              <template #body="{ data }">
                <span class="text-slate-600">{{ data.groupName }}</span>
              </template>
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

    <Dialog v-model:visible="dialogVisible" :style="{width: '450px'}" :header="dialogMode === 'add' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="flex flex-col gap-1">
          <label for="code" class="block text-sm font-medium text-slate-700">Kode Mapel <span class="text-red-500">*</span></label>
          <InputText id="code" v-model.trim="form.code" required autofocus :class="[{'p-invalid': submitted && !form.code}, 'w-full']" placeholder="Contoh: INF" />
          <small class="text-red-500" v-if="submitted && !form.code">Kode mapel wajib diisi.</small>
        </div>
        
        <div class="flex flex-col gap-1">
          <label for="name" class="block text-sm font-medium text-slate-700">Nama Mata Pelajaran <span class="text-red-500">*</span></label>
          <InputText id="name" v-model.trim="form.name" required :class="[{'p-invalid': submitted && !form.name}, 'w-full']" placeholder="Contoh: Informatika" />
          <small class="text-red-500" v-if="submitted && !form.name">Nama mapel wajib diisi.</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="group" class="block text-sm font-medium text-slate-700">Kelompok <span class="text-red-500">*</span></label>
          <Select id="group" v-model="form.groupName" :options="groupOptions" optionLabel="label" optionValue="value" :class="[{'p-invalid': submitted && !form.groupName}, 'w-full']" />
        </div>

        <div class="field flex items-center mt-4">
          <Checkbox id="isActive" v-model="form.isActive" :binary="true" />
          <label for="isActive" class="ml-2 text-sm text-slate-700 cursor-pointer">Aktif</label>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="saveSubject" :loading="subjectStore.loading" />
      </template>
    </Dialog>
  </div>
</template>
