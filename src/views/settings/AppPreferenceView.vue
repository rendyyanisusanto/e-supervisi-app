<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAppPreferenceStore } from '../../stores/appPreferenceStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import AppPreferenceForm from '../../components/settings/AppPreferenceForm.vue';
import BaseConfirmAction from '../../components/common/BaseConfirmAction.vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { clearStorage } from '../../utils/storage';

const store = useAppPreferenceStore();
const toast = useToast();

const showResetConfirm = ref(false);

onMounted(() => {
  store.fetchPreferences();
});

const handleSave = async (data: any) => {
  try {
    await store.updatePreferences(data);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Preferensi sistem disimpan', life: 3000 });
  } catch (error) {
    //
  }
};

const handleReset = async () => {
  try {
    await store.resetPreferences();
    toast.add({ severity: 'info', summary: 'Reset', detail: 'Preferensi dikembalikan ke bawaan sistem', life: 3000 });
  } catch (error) {
    //
  }
};

const resetDummyData = () => {
  clearStorage();
  showResetConfirm.value = false;
  toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data Dummy berhasil direset', life: 3000 });
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Preferensi Sistem" 
      description="Atur perilaku default dari aplikasi saat digunakan oleh end-user."
      icon="pi pi-sliders-v"
    >
      <template #actions>
        <Button 
          label="Reset Data Dummy" 
          icon="pi pi-refresh" 
          severity="danger" 
          outlined 
          size="small"
          @click="showResetConfirm = true" 
        />
      </template>
    </BasePageHeader>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <AppPreferenceForm 
        :initialData="store.preferences" 
        :loading="store.loading"
        @save="handleSave"
        @reset="handleReset"
      />
    </div>

    <BaseConfirmAction
      v-model:visible="showResetConfirm"
      title="Reset Data Dummy"
      message="Apakah Anda yakin ingin mereset semua data dummy? Ini akan menghapus semua perubahan Anda dan mengembalikan aplikasi ke kondisi awal."
      icon="pi pi-exclamation-triangle"
      severity="danger"
      confirmLabel="Ya, Reset Data"
      @confirm="resetDummyData"
    />
  </div>
</template>
