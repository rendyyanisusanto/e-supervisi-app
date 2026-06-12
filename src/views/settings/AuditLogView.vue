<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auditLogService } from '../../services/auditLogService';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';

const logs = ref<any[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await auditLogService.getAuditLogs();
    if (res.success) {
      logs.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load audit logs', error);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('id-ID');
};
</script>

<template>
  <div>
    <BasePageHeader 
      title="Audit Log" 
      subtitle="Riwayat aktivitas pengguna dalam sistem."
      icon="pi pi-history"
    />

    <Card class="border-none shadow-sm">
      <template #content>
        <DataTable :value="logs" :loading="loading" :paginator="true" :rows="20" class="p-datatable-sm" responsiveLayout="scroll">
          <Column field="createdAt" header="Waktu">
            <template #body="{ data }">
              <span class="text-xs text-slate-600">{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>
          <Column field="userName" header="Pengguna">
            <template #body="{ data }">
              <span class="font-medium text-slate-800">{{ data.userName || 'Sistem' }}</span>
            </template>
          </Column>
          <Column field="module" header="Modul"></Column>
          <Column field="action" header="Aksi">
            <template #body="{ data }">
              <span class="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700">{{ data.action }}</span>
            </template>
          </Column>
          <Column field="description" header="Deskripsi"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
