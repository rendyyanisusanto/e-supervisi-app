<script setup lang="ts">
import { onMounted } from 'vue';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import SchoolProfileForm from '../../components/settings/SchoolProfileForm.vue';
import LogoUploader from '../../components/settings/LogoUploader.vue';
import { useToast } from 'primevue/usetoast';

const store = useSchoolProfileStore();
const toast = useToast();

onMounted(() => {
  store.fetchProfile();
});

const handleSave = async (data: any) => {
  try {
    await store.updateProfile(data);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil sekolah berhasil disimpan', life: 3000 });
  } catch (error) {
    // Error handled by store
  }
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Profil Sekolah" 
      description="Atur identitas sekolah yang digunakan pada aplikasi dan dokumen cetak."
      icon="pi pi-building"
    />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1">
        <LogoUploader :currentLogo="store.profile?.logo" />
      </div>
      
      <div class="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <SchoolProfileForm 
          :initialData="store.profile" 
          :loading="store.loading"
          @save="handleSave"
        />
      </div>
    </div>
  </div>
</template>
