<script setup lang="ts">
import { ref } from 'vue';
import type { WaLog } from '../../types/waTemplate';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

defineProps<{
  logs: WaLog[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'retry', id: string): void;
}>();

const getSeverity = (status: string) => {
  if (status === 'SENT') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'danger';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID');
};

const selectedLog = ref<WaLog | null>(null);
const showDialog = ref(false);

const openDetail = (log: WaLog) => {
  selectedLog.value = log;
  showDialog.value = true;
};
</script>

<template>
  <div>
    <DataTable :value="logs" :loading="loading" :paginator="true" :rows="10" 
               class="p-datatable-sm border border-slate-200 rounded-xl overflow-hidden">
      
      <Column field="createdAt" header="Waktu Dibuat" sortable>
        <template #body="{ data }">
          <span class="text-sm">{{ formatDate(data.createdAt) }}</span>
        </template>
      </Column>
      
      <Column field="templateName" header="Template" sortable>
        <template #body="{ data }">
          <span class="text-sm font-medium">{{ data.templateName }}</span>
        </template>
      </Column>

      <Column field="recipientName" header="Penerima" sortable>
        <template #body="{ data }">
          <div class="text-sm">
            <div class="font-medium text-slate-800">{{ data.recipientName }}</div>
            <div class="text-xs text-slate-500">{{ data.phone }}</div>
          </div>
        </template>
      </Column>

      <Column field="status" header="Status" sortable>
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getSeverity(data.status)" />
        </template>
      </Column>

      <Column header="Aksi" :exportable="false" style="min-width:8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-eye" outlined rounded severity="secondary" size="small" @click="openDetail(data)" v-tooltip.top="'Lihat Detail'" />
            <Button v-if="data.status === 'FAILED'" icon="pi pi-refresh" outlined rounded severity="warning" size="small" @click="emit('retry', data.id)" v-tooltip.top="'Coba Lagi'" />
          </div>
        </template>
      </Column>
      
      <template #empty>
        <div class="text-center p-6 text-slate-500">
          Belum ada log pengiriman WhatsApp.
        </div>
      </template>
    </DataTable>

    <Dialog v-model:visible="showDialog" header="Detail Pesan WhatsApp" :modal="true" class="w-full max-w-2xl">
      <div class="space-y-4" v-if="selectedLog">
        <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div class="text-xs text-slate-500 font-semibold mb-1">Penerima</div>
            <div class="font-medium">{{ selectedLog.recipientName }} ({{ selectedLog.phone }})</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-semibold mb-1">Status</div>
            <Tag :value="selectedLog.status" :severity="getSeverity(selectedLog.status)" />
          </div>
          <div>
            <div class="text-xs text-slate-500 font-semibold mb-1">Waktu Dibuat</div>
            <div>{{ formatDate(selectedLog.createdAt) }}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-semibold mb-1">Waktu Terkirim</div>
            <div>{{ formatDate(selectedLog.sentAt) }}</div>
          </div>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">Isi Pesan:</div>
          <div class="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap text-sm text-slate-800 border border-slate-200 font-mono">
            {{ selectedLog.message }}
          </div>
        </div>

        <div v-if="selectedLog.response">
          <div class="text-sm font-semibold mb-2">Response Sistem (Dummy):</div>
          <div class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs font-mono break-all">
            {{ selectedLog.response }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
