<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SchoolProfile } from '../../types/schoolProfile';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';

const props = defineProps<{
  initialData: SchoolProfile | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: Partial<SchoolProfile>): void;
}>();

const formData = ref<Partial<SchoolProfile>>({});
const errors = ref<Record<string, string>>({});

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
  }
}, { immediate: true });

const validate = () => {
  errors.value = {};
  if (!formData.value.name) errors.value.name = 'Nama sekolah wajib diisi';
  if (!formData.value.npsn) errors.value.npsn = 'NPSN wajib diisi';
  if (!formData.value.address) errors.value.address = 'Alamat wajib diisi';
  if (!formData.value.principalName) errors.value.principalName = 'Nama kepala sekolah wajib diisi';
  
  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Format email tidak valid';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSave = () => {
  if (validate()) {
    emit('save', formData.value);
  }
};
</script>

<template>
  <div class="space-y-8">
    <Message v-if="Object.keys(errors).length > 0" severity="error" :closable="false">
      Harap perbaiki kesalahan pada form di bawah ini sebelum menyimpan.
    </Message>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Section 0: Kustomisasi Aplikasi -->
      <div class="space-y-4 md:col-span-2">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Kustomisasi Tampilan Aplikasi</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Nama Aplikasi</label>
            <InputText v-model="formData.appName" class="w-full" placeholder="Cth: E-Supervisi SMK" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Tagline / Caption</label>
            <InputText v-model="formData.appTagline" class="w-full" placeholder="Cth: Aplikasi Supervisi Guru" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Warna Dasar (Primary Color)</label>
            <div class="flex gap-2">
              <input type="color" v-model="formData.primaryColor" class="h-10 w-12 border border-slate-200 rounded p-1 cursor-pointer" />
              <InputText v-model="formData.primaryColor" class="w-full font-mono text-sm uppercase" />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 1: Identitas Sekolah -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Identitas Sekolah</h3>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Nama Sekolah <span class="text-red-500">*</span></label>
          <InputText v-model="formData.name" class="w-full" :class="{'p-invalid': errors.name}" />
          <small class="text-red-500" v-if="errors.name">{{ errors.name }}</small>
        </div>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">NPSN <span class="text-red-500">*</span></label>
          <InputText v-model="formData.npsn" class="w-full" :class="{'p-invalid': errors.npsn}" />
          <small class="text-red-500" v-if="errors.npsn">{{ errors.npsn }}</small>
        </div>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Alamat Lengkap <span class="text-red-500">*</span></label>
          <Textarea v-model="formData.address" rows="3" class="w-full" :class="{'p-invalid': errors.address}" />
          <small class="text-red-500" v-if="errors.address">{{ errors.address }}</small>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Kota/Kabupaten</label>
            <InputText v-model="formData.city" class="w-full" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-700">Provinsi</label>
            <InputText v-model="formData.province" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Section 2: Kontak Sekolah -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Kontak Sekolah</h3>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Nomor Telepon</label>
          <InputText v-model="formData.phone" class="w-full" />
        </div>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Email Sekolah</label>
          <InputText v-model="formData.email" type="email" class="w-full" :class="{'p-invalid': errors.email}" />
          <small class="text-red-500" v-if="errors.email">{{ errors.email }}</small>
        </div>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Website</label>
          <InputText v-model="formData.website" class="w-full" />
        </div>
      </div>

      <!-- Section 3: Pejabat Penandatangan -->
      <div class="space-y-4 md:col-span-2">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Pejabat Penandatangan</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 class="font-semibold text-slate-700">Kepala Sekolah</h4>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Nama Lengkap & Gelar <span class="text-red-500">*</span></label>
              <InputText v-model="formData.principalName" class="w-full" :class="{'p-invalid': errors.principalName}" />
              <small class="text-red-500" v-if="errors.principalName">{{ errors.principalName }}</small>
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">NIP</label>
              <InputText v-model="formData.principalNip" class="w-full" />
            </div>
          </div>

          <div class="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 class="font-semibold text-slate-700">Waka Kurikulum</h4>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Nama Lengkap & Gelar</label>
              <InputText v-model="formData.curriculumName" class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">NIP</label>
              <InputText v-model="formData.curriculumNip" class="w-full" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section 4: Footer Laporan -->
      <div class="space-y-4 md:col-span-2">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Footer Laporan Cetak</h3>
        
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-700">Teks Footer Default</label>
          <InputText v-model="formData.reportFooter" class="w-full" placeholder="Cth: Dokumen ini dicetak dari E-Supervisi SMK" />
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4 border-t">
      <Button label="Simpan Profil Sekolah" icon="pi pi-save" :loading="loading" @click="handleSave" />
    </div>
  </div>
</template>
