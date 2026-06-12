<script setup lang="ts">
import { onMounted } from 'vue';
import { useWaTemplateStore } from '../../stores/waTemplateStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import WaLogTable from '../../components/settings/WaLogTable.vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

const store = useWaTemplateStore();
const toast = useToast();

onMounted(() => {
  store.fetchLogs();
});

const handleRetry = async (id: string) => {
  try {
    await store.retryFailedLog(id);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pesan berhasil dikirim ulang', life: 3000 });
  } catch (error) {
    // handled
  }
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Log Notifikasi WhatsApp" 
      description="Pantau riwayat pengiriman pesan WhatsApp otomatis ke guru."
      icon="pi pi-send"
    >
      <template #actions>
        <Button label="Refresh Data" icon="pi pi-refresh" severity="secondary" outlined @click="store.fetchLogs()" :loading="store.loading" />
      </template>
    </BasePageHeader>

    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <WaLogTable 
        :logs="store.logs" 
        :loading="store.loading"
        @retry="handleRetry"
      />
    </div>
  </div>
</template>
