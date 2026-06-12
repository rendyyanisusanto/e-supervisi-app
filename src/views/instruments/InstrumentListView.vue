<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import InputNumber from 'primevue/inputnumber';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseToolbarFilter from '../../components/common/BaseToolbarFilter.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';

const instrumentStore = useInstrumentStore();
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Instrumen' }
]);

const searchQuery = ref('');
const selectedType = ref<string | null>(null);
const expandedRows = ref({});

const getGroupedItems = (items: any[]) => {
  if (!items) return {};
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const groups: Record<string, any[]> = {};
  sorted.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });
  return groups;
};

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const typeOptions = [
  { label: 'Administrasi', value: 'ADMINISTRASI' },
  { label: 'Perencanaan', value: 'PERENCANAAN' },
  { label: 'Pelaksanaan', value: 'PELAKSANAAN' },
  { label: 'ATP', value: 'ATP' },
  { label: 'Asesmen', value: 'ASESMEN' },
  { label: 'Refleksi', value: 'REFLEKSI' },
  { label: 'Lainnya', value: 'LAINNYA' }
];

const form = ref<any>({
  id: '',
  code: '',
  name: '',
  type: 'ADMINISTRASI',
  description: '',
  isActive: true
});

const quickAddVisible = ref(false);
const quickAddInstrumentId = ref('');
const quickAddItemForm = ref<any>({
  category: '',
  code: '',
  description: '',
  maxScore: 4,
  sortOrder: 1,
  isActive: true
});

const openQuickAdd = (instrumentId: string) => {
  quickAddInstrumentId.value = instrumentId;
  quickAddItemForm.value = { category: '', code: '', description: '', maxScore: 4, sortOrder: 1, isActive: true };
  quickAddVisible.value = true;
};

const saveQuickAddItem = async () => {
  if (!quickAddItemForm.value.category || !quickAddItemForm.value.description) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Kategori dan Pertanyaan wajib diisi', life: 3000 });
    return;
  }
  
  try {
    await instrumentStore.addItem(quickAddInstrumentId.value, quickAddItemForm.value);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Indikator berhasil ditambahkan', life: 3000 });
    quickAddVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Gagal menambahkan indikator', life: 3000 });
  }
};

onMounted(() => {
  instrumentStore.fetchInstruments();
});

const filteredInstruments = computed(() => {
  if (!instrumentStore.instruments) return [];
  let result = instrumentStore.instruments;
  
  if (selectedType.value) result = result.filter(i => i.type === selectedType.value);
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(i => 
      i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
    );
  }
  
  return result;
});

const openAddDialog = () => {
  form.value = { id: '', code: '', name: '', type: 'ADMINISTRASI', description: '', isActive: true };
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

const saveInstrument = async () => {
  submitted.value = true;
  
  if (!form.value.name || !form.value.code) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Harap isi semua field wajib', life: 3000 });
    return;
  }

  try {
    if (dialogMode.value === 'add') {
      await instrumentStore.addInstrument(form.value);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Instrumen ditambahkan', life: 3000 });
    } else {
      await instrumentStore.updateInstrument(form.value.id, form.value);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Instrumen diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan', life: 3000 });
  }
};

const toggleStatus = async (data: any) => {
  confirm.require({
    message: `Apakah Anda yakin ingin ${data.isActive ? 'menonaktifkan' : 'mengaktifkan'} instrumen ini?`,
    header: 'Konfirmasi',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await instrumentStore.updateInstrument(data.id, { isActive: !data.isActive });
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Status diperbarui', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memperbarui status', life: 3000 });
      }
    }
  });
};

const duplicateInstrument = async (data: any) => {
  confirm.require({
    message: `Duplikasi instrumen "${data.name}"? (Item belum diduplikasi di versi dummy ini)`,
    header: 'Duplikasi Instrumen',
    icon: 'pi pi-copy',
    accept: async () => {
      try {
        const payload = { ...data, id: undefined, items: undefined, name: `${data.name} (Copy)`, code: `${data.code}-COPY` };
        await instrumentStore.addInstrument(payload);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Instrumen diduplikasi', life: 3000 });
      } catch (error: any) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: error.message, life: 3000 });
      }
    }
  });
};

const getTotalMaxScore = (instrument: any) => {
  if (!instrument || !instrument.items) return 0;
  return instrument.items.reduce((sum: number, item: any) => sum + (item.isActive ? item.maxScore : 0), 0);
};

const getActionItems = (data: any) => [
  { label: 'Form Builder', icon: 'pi pi-sparkles', command: () => router.push(`/instrumen/${data.id}/builder`) },
  { separator: true },
  { label: 'Edit Info', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: 'Duplikasi', icon: 'pi pi-copy', command: () => duplicateInstrument(data) },
  { label: data.isActive ? 'Nonaktifkan' : 'Aktifkan', icon: data.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle', command: () => toggleStatus(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Instrumen Supervisi" 
      subtitle="Kelola instrumen penilaian, kategori, dan detail indikator."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Instrumen" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="instrumentStore.error" 
      title="Gagal Memuat Data" 
      :description="instrumentStore.error" 
      @retry="instrumentStore.fetchInstruments" 
    />

    <Card v-else class="border-none shadow-sm">
      <template #content>
        <BaseLoadingSkeleton v-if="instrumentStore.loading && instrumentStore.instruments.length === 0" type="table" />
        
        <div v-else>
          <BaseToolbarFilter v-model:searchValue="searchQuery" searchPlaceholder="Cari instrumen...">
            <template #filters>
              <Select v-model="selectedType" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Semua Jenis" showClear class="w-full md:w-48" />
            </template>
          </BaseToolbarFilter>

          <DataTable 
            :value="filteredInstruments" 
            v-model:expandedRows="expandedRows"
            :paginator="true" 
            :rows="10" 
            dataKey="id" 
            responsiveLayout="scroll"
            :loading="instrumentStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada instrumen" 
                description="Belum ada data instrumen yang sesuai." 
                icon="pi pi-file-edit"
              />
            </template>

            <Column expander style="width: 3rem" />
            <Column field="code" header="Kode" sortable>
              <template #body="{ data }">
                <span class="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-600">{{ data.code }}</span>
              </template>
            </Column>
            <Column field="name" header="Nama Instrumen" sortable>
              <template #body="{ data }">
                <div class="flex flex-col">
                  <span class="font-semibold text-slate-800">{{ data.name }}</span>
                  <span class="text-xs text-slate-500 truncate max-w-xs">{{ data.description }}</span>
                </div>
              </template>
            </Column>
            <Column field="type" header="Jenis" sortable />
            <Column header="Indikator Penilaian">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <span class="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm">{{ data.items?.length || 0 }} Item</span>
                  <span class="text-xs text-slate-500">(Max: {{ getTotalMaxScore(data) }})</span>
                </div>
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

            <template #expansion="slotProps">
              <div class="p-4 bg-slate-50/50 rounded-lg border border-slate-200 mt-2 mb-4 mx-2">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold text-slate-800 text-lg">Preview Indikator: {{ slotProps.data.name }}</h4>
                  <div class="flex gap-2">
                    <Button label="Tambah Cepat" icon="pi pi-plus" size="small" outlined @click="openQuickAdd(slotProps.data.id)" />
                    <Button label="Buka Form Builder" icon="pi pi-sparkles" size="small" @click="router.push(`/instrumen/${slotProps.data.id}/builder`)" />
                  </div>
                </div>
                
                <BaseEmptyState 
                  v-if="!slotProps.data.items || slotProps.data.items.length === 0" 
                  title="Belum ada indikator" 
                  description="Silakan buka Form Builder untuk menambahkan indikator." 
                  icon="pi pi-list" 
                />
                <div v-else class="space-y-4">
                  <div v-for="(items, category) in getGroupedItems(slotProps.data.items)" :key="category" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h5 class="font-bold text-blue-700 border-b pb-2 mb-3">{{ category }}</h5>
                    <ul class="space-y-3">
                      <li v-for="item in items" :key="item.id" class="flex items-start gap-3 text-sm hover:bg-slate-50 p-2 -mx-2 rounded transition-colors">
                        <span class="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-10 text-center shrink-0">{{ item.code }}</span>
                        <span class="text-slate-800 flex-1 leading-relaxed">{{ item.description }}</span>
                        <span class="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded shrink-0">Skor Maks: {{ item.maxScore }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- Dialog Add/Edit Instrument -->
    <Dialog v-model:visible="dialogVisible" :style="{width: '600px'}" :header="dialogMode === 'add' ? 'Tambah Instrumen' : 'Edit Info Instrumen'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Kode Instrumen <span class="text-red-500">*</span></label>
            <InputText class="w-full" v-model.trim="form.code" required autofocus :class="{'p-invalid': submitted && !form.code}" />
            <small class="text-red-500" v-if="submitted && !form.code">Wajib diisi.</small>
          </div>
          <div class="flex flex-col gap-1 col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-slate-700">Jenis <span class="text-red-500">*</span></label>
            <Select class="w-full" v-model="form.type" :options="typeOptions" optionLabel="label" optionValue="value" :class="{'p-invalid': submitted && !form.type}" />
          </div>
        </div>
        
        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Nama Instrumen <span class="text-red-500">*</span></label>
          <InputText class="w-full" v-model.trim="form.name" required :class="{'p-invalid': submitted && !form.name}" />
          <small class="text-red-500" v-if="submitted && !form.name">Wajib diisi.</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Deskripsi Singkat</label>
          <Textarea class="w-full" v-model="form.description" rows="3" />
        </div>

        <div class="flex flex-col gap-1 flex items-center mt-4">
          <Checkbox id="isActive" v-model="form.isActive" :binary="true" />
          <label for="isActive" class="ml-2 text-sm text-slate-700 cursor-pointer">Status Aktif</label>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="saveInstrument" :loading="instrumentStore.loading" />
      </template>
    </Dialog>

    <!-- Dialog Quick Add Item -->
    <Dialog v-model:visible="quickAddVisible" :style="{width: '500px'}" header="Tambah Indikator Cepat" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Kategori <span class="text-red-500">*</span></label>
          <InputText class="w-full" v-model.trim="quickAddItemForm.category" required autofocus placeholder="Contoh: Kegiatan Awal" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Kode Indikator</label>
          <InputText class="w-full" v-model.trim="quickAddItemForm.code" placeholder="Contoh: A.1" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Pertanyaan / Indikator <span class="text-red-500">*</span></label>
          <Textarea class="w-full" v-model.trim="quickAddItemForm.description" rows="3" required />
        </div>
        <div class="flex flex-col gap-1 w-1/2">
          <label class="block text-sm font-medium text-slate-700">Skor Maksimal <span class="text-red-500">*</span></label>
          <InputNumber class="w-full" v-model="quickAddItemForm.maxScore" :min="1" required />
        </div>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="quickAddVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="saveQuickAddItem" :loading="instrumentStore.loading" />
      </template>
    </Dialog>
  </div>
</template>
