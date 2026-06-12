<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useReportSettingStore } from '../../stores/reportSettingStore';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import ReportFormatPreview from '../../components/settings/ReportFormatPreview.vue';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import type { ReportSettings } from '../../types/reportSetting';

const reportStore = useReportSettingStore();
const profileStore = useSchoolProfileStore();
const toast = useToast();

const localSettings = ref<Partial<ReportSettings>>({});

const paperSizes = [
  { label: 'A4', value: 'A4' },
  { label: 'F4 / Folio', value: 'F4' }
];

const headerStyles = [
  { label: 'Formal (Kop Surat Resmi)', value: 'FORMAL' },
  { label: 'Modern (Kiri, Garis Tipis)', value: 'MODERN' },
  { label: 'Simpel (Tengah, Tanpa Logo)', value: 'SIMPLE' }
];

onMounted(async () => {
  await Promise.all([
    reportStore.fetchSettings(),
    profileStore.fetchProfile()
  ]);
  if (reportStore.settings) {
    localSettings.value = { ...reportStore.settings };
  }
});

const handleSave = async () => {
  try {
    await reportStore.updateSettings(localSettings.value);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Format laporan berhasil disimpan', life: 3000 });
  } catch (error) {
    // error handled in store
  }
};

const handleReset = async () => {
  try {
    await reportStore.resetSettings();
    if (reportStore.settings) {
      localSettings.value = { ...reportStore.settings };
    }
    toast.add({ severity: 'info', summary: 'Reset', detail: 'Format laporan dikembalikan ke default', life: 3000 });
  } catch (error) {
    // error handled in store
  }
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Format Laporan" 
      description="Konfigurasi tata letak dokumen cetak, kop surat, dan tanda tangan digital."
      icon="pi pi-file-pdf"
    >
      <template #actions>
        <Button label="Reset Default" icon="pi pi-refresh" severity="secondary" outlined @click="handleReset" :loading="reportStore.loading" />
        <Button label="Simpan Pengaturan" icon="pi pi-save" @click="handleSave" :loading="reportStore.loading" />
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Editor Column -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Toggle Tampilan -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 border-b pb-2">Elemen Laporan</h3>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Tampilkan Logo Sekolah</span>
            <InputSwitch v-model="localSettings.showLogo" />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Tampilkan Alamat & Kontak</span>
            <InputSwitch v-model="localSettings.showSchoolAddress" />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Gunakan QR Validasi Dummy</span>
            <InputSwitch v-model="localSettings.useQrValidation" />
          </div>
        </div>

        <!-- Tanda Tangan -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 border-b pb-2">Tanda Tangan</h3>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Kepala Sekolah</span>
            <InputSwitch v-model="localSettings.showPrincipalSignature" />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Waka Kurikulum</span>
            <InputSwitch v-model="localSettings.showCurriculumSignature" />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">Supervisor / Penilai</span>
            <InputSwitch v-model="localSettings.showSupervisorSignature" />
          </div>
        </div>

        <!-- Konfigurasi Lanjut -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 border-b pb-2">Layout Dokumen</h3>
          
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Gaya Header / Kop</label>
            <Dropdown v-model="localSettings.headerStyle" :options="headerStyles" optionLabel="label" optionValue="value" class="w-full" />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Ukuran Kertas</label>
            <Dropdown v-model="localSettings.paperSize" :options="paperSizes" optionLabel="label" optionValue="value" class="w-full" />
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Format Nomor Dokumen</label>
            <InputText v-model="localSettings.documentNumberFormat" class="w-full" />
            <small class="text-slate-500 block">Vars: {jenis}, {bulan}, {tahun}, {nomor}</small>
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Watermark Text (Opsional)</label>
            <InputText v-model="localSettings.watermarkText" class="w-full" placeholder="Cth: DRAFT SEMENTARA" />
          </div>
        </div>

      </div>
      
      <!-- Preview Column -->
      <div class="lg:col-span-7 bg-slate-100 border border-slate-200 rounded-xl p-6 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[600px]">
        <div class="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
          <div class="origin-top flex justify-center" style="transform: scale(0.85);">
            <ReportFormatPreview 
              v-if="localSettings.headerStyle" 
              :settings="localSettings as ReportSettings" 
              :profile="profileStore.profile" 
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
