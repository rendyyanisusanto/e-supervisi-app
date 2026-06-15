<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useScoreRangeStore } from '../../stores/scoreRangeStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Tag from 'primevue/tag';

import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseActionMenu from '../../components/common/BaseActionMenu.vue';
import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';

const scoreRangeStore = useScoreRangeStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Instrumen' },
  { label: 'Rentang Nilai' }
]);

const dialogVisible = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitted = ref(false);

const colorOptions = [
  { label: 'Hijau (Success)', value: 'success' },
  { label: 'Biru (Info)', value: 'info' },
  { label: 'Kuning/Oranye (Warning)', value: 'warning' },
  { label: 'Merah (Danger)', value: 'danger' },
  { label: 'Abu-abu (Secondary)', value: 'secondary' }
];

const form = ref<any>({
  id: '',
  minScore: 0,
  maxScore: 100,
  name: '',
  color: 'success',
  description: ''
});

// Simulation state
const simScore = ref<number | null>(null);
const simResult = computed(() => {
  if (simScore.value === null) return null;
  const val = simScore.value;
  return scoreRangeStore.scoreRanges.find(r => val >= r.minScore && val <= r.maxScore);
});

onMounted(() => {
  scoreRangeStore.fetchScoreRanges();
});

const openAddDialog = () => {
  form.value = { id: '', minScore: 0, maxScore: 100, name: '', color: 'success', description: '' };
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

const saveScoreRange = async () => {
  submitted.value = true;
  
  if (form.value.minScore === null || form.value.maxScore === null || !form.value.name) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Harap isi semua field wajib', life: 3000 });
    return;
  }
  
  if (form.value.maxScore < form.value.minScore) {
    toast.add({ severity: 'error', summary: 'Validasi Gagal', detail: 'Nilai maksimum harus lebih besar dari minimum', life: 3000 });
    return;
  }

  try {
    if (dialogMode.value === 'add') {
      await scoreRangeStore.addScoreRange(form.value);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Rentang nilai ditambahkan', life: 3000 });
    } else {
      await scoreRangeStore.updateScoreRange(form.value.id, form.value);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Rentang nilai diperbarui', life: 3000 });
    }
    dialogVisible.value = false;
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Terjadi kesalahan (Mungkin ada nilai yang tumpang tindih)', life: 4000 });
  }
};

const deleteScoreRange = (data: any) => {
  confirm.require({
    message: `Hapus rentang nilai "${data.name}"?`,
    header: 'Konfirmasi',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await scoreRangeStore.deleteScoreRange(data.id);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Rentang nilai dihapus', life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus data', life: 3000 });
      }
    }
  });
};

const getActionItems = (data: any) => [
  { label: 'Edit', icon: 'pi pi-pencil', command: () => openEditDialog(data) },
  { label: 'Hapus', icon: 'pi pi-trash', command: () => deleteScoreRange(data) }
];
</script>

<template>
  <div>
    <BasePageHeader 
      title="Rentang Nilai & Predikat" 
      subtitle="Kelola rentang nilai konversi untuk menentukan predikat supervisi secara otomatis."
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <Button label="Tambah Rentang" icon="pi pi-plus" @click="openAddDialog" />
      </template>
    </BasePageHeader>

    <BaseErrorState 
      v-if="scoreRangeStore.error" 
      title="Gagal Memuat Data" 
      :description="scoreRangeStore.error" 
      @retry="scoreRangeStore.fetchScoreRanges" 
    />

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Tabel Master Data -->
      <Card class="border-none shadow-sm lg:col-span-2">
        <template #title>
          <div class="text-lg font-semibold text-slate-800">Daftar Rentang Nilai</div>
        </template>
        <template #content>
          <BaseLoadingSkeleton v-if="scoreRangeStore.loading && scoreRangeStore.scoreRanges.length === 0" type="table" />
          
          <DataTable 
            v-else
            :value="scoreRangeStore.scoreRanges" 
            responsiveLayout="scroll"
            :loading="scoreRangeStore.loading"
          >
            <template #empty>
              <BaseEmptyState 
                title="Tidak ada rentang nilai" 
                description="Belum ada data konversi nilai. Silakan tambahkan rentang baru." 
                icon="pi pi-chart-bar"
              />
            </template>

            <Column header="Rentang Nilai">
              <template #body="{ data }">
                <span class="font-mono text-slate-800 font-semibold">{{ data.minScore }} - {{ data.maxScore }}</span>
              </template>
            </Column>
            <Column field="name" header="Predikat / Status">
              <template #body="{ data }">
                <Tag :value="data.name" :severity="data.color" rounded />
              </template>
            </Column>
            <Column field="description" header="Keterangan">
              <template #body="{ data }">
                <span class="text-sm text-slate-600">{{ data.description }}</span>
              </template>
            </Column>
            <Column header="Aksi" :exportable="false" style="width:4rem">
              <template #body="{ data }">
                <BaseActionMenu :items="getActionItems(data)" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Simulasi Predikat -->
      <Card class="border-none shadow-sm bg-slate-50 border border-slate-200 lg:col-span-1 h-fit">
        <template #title>
          <div class="flex items-center gap-2 text-slate-800">
            <i class="pi pi-desktop"></i>
            <span class="text-lg font-semibold">Simulasi Predikat</span>
          </div>
        </template>
        <template #subtitle>
          <span class="text-sm text-slate-500">Uji coba rentang nilai yang telah Anda atur.</span>
        </template>
        <template #content>
          <div class="mt-4">
            <label class="block text-sm font-medium text-slate-700 mb-2">Masukkan Nilai Dummy (0 - 100)</label>
            <div class="flex flex-col gap-4">
              <InputNumber v-model="simScore" :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="2" placeholder="Contoh: 85.5" class="w-full" inputClass="text-center font-mono text-xl w-full" />
              
              <div v-if="simScore !== null" class="mt-2 text-center p-4 rounded-xl border" :class="simResult ? `bg-${simResult.color}-50 border-${simResult.color}-200` : 'bg-slate-100 border-slate-300'">
                <div class="text-sm text-slate-500">Hasil Predikat:</div>
                <div v-if="simResult">
                  <Tag :value="simResult.name" :severity="simResult.color" class="text-lg px-4 py-2" rounded />
                  <p class="text-sm text-slate-600 mt-3">{{ simResult.description }}</p>
                </div>
                <div v-else class="text-red-500 font-medium">
                  Tidak ada rentang yang cocok untuk nilai {{ simScore }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Dialog Add/Edit -->
    <Dialog v-model:visible="dialogVisible" :style="{width: '500px'}" :header="dialogMode === 'add' ? 'Tambah Rentang Nilai' : 'Edit Rentang Nilai'" :modal="true" class="p-fluid">
      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium text-slate-700">Nilai Minimum <span class="text-red-500">*</span></label>
            <InputNumber class="w-full" v-model="form.minScore" :min="0" :max="100" :maxFractionDigits="2" required autofocus :class="{'p-invalid': submitted && form.minScore === null}" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="block text-sm font-medium text-slate-700">Nilai Maksimum <span class="text-red-500">*</span></label>
            <InputNumber class="w-full" v-model="form.maxScore" :min="0" :max="100" :maxFractionDigits="2" required :class="{'p-invalid': submitted && (form.maxScore === null || form.maxScore < form.minScore)}" />
          </div>
        </div>
        <small class="text-red-500 block -mt-2" v-if="submitted && form.maxScore < form.minScore">Nilai maksimal harus lebih besar dari minimum.</small>

        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Predikat / Status <span class="text-red-500">*</span></label>
          <InputText class="w-full" v-model.trim="form.name" required :class="{'p-invalid': submitted && !form.name}" placeholder="Contoh: Baik Sekali, Cukup, dll" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Warna Badge <span class="text-red-500">*</span></label>
          <Select class="w-full" v-model="form.color" :options="colorOptions" optionLabel="label" optionValue="value" :class="{'p-invalid': submitted && !form.color}">
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <span class="w-3 h-3 rounded-full mr-2" :class="`bg-${slotProps.value}-500`"></span>
                <div>{{ colorOptions.find(o => o.value === slotProps.value)?.label }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <span class="w-3 h-3 rounded-full mr-2" :class="`bg-${slotProps.option.value}-500`"></span>
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="block text-sm font-medium text-slate-700">Keterangan / Deskripsi Singkat</label>
          <InputText class="w-full" v-model="form.description" />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="dialogVisible = false" />
        <Button label="Simpan" icon="pi pi-check" @click="saveScoreRange" :loading="scoreRangeStore.loading" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Simulasi background and border colors for Tailwind dynamic rendering */
.bg-success-50 { background-color: #f0fdf4; }
.border-success-200 { border-color: #bbf7d0; }
.bg-success-500 { background-color: #22c55e; }

.bg-info-50 { background-color: #eff6ff; }
.border-info-200 { border-color: #bfdbfe; }
.bg-info-500 { background-color: #3b82f6; }

.bg-warning-50 { background-color: #fefce8; }
.border-warning-200 { border-color: #fef08a; }
.bg-warning-500 { background-color: #eab308; }

.bg-danger-50 { background-color: #fef2f2; }
.border-danger-200 { border-color: #fecaca; }
.bg-danger-500 { background-color: #ef4444; }

.bg-secondary-50 { background-color: #f8fafc; }
.border-secondary-200 { border-color: #e2e8f0; }
.bg-secondary-500 { background-color: #64748b; }
</style>
