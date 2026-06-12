<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWaTemplateStore } from '../../stores/waTemplateStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import WaTemplateEditor from '../../components/settings/WaTemplateEditor.vue';
import WaVariableHelper from '../../components/settings/WaVariableHelper.vue';
import WaPreviewCard from '../../components/settings/WaPreviewCard.vue';
import type { WaTemplate } from '../../types/waTemplate';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const store = useWaTemplateStore();
const toast = useToast();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const selectedTemplate = ref<WaTemplate | null>(null);
const isNew = ref(false);
const editorRef = ref<any>(null);

onMounted(() => {
  store.fetchTemplates();
});

const handleAdd = () => {
  selectedTemplate.value = {
    id: '',
    code: '',
    name: '',
    description: '',
    content: '',
    isActive: true,
    category: 'PENGINGAT',
    updatedAt: ''
  } as WaTemplate;
  isNew.value = true;
};

const editTemplate = (t: WaTemplate) => {
  selectedTemplate.value = { ...t };
  isNew.value = false;
};

const handleSave = async (data: Partial<WaTemplate>) => {
  try {
    await store.saveTemplate(data);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Template WA berhasil disimpan', life: 3000 });
    selectedTemplate.value = null; // Back to list
  } catch (error) {
    // handled
  }
};

const handleTest = async (id: string, vars: any) => {
  try {
    await store.sendTest(id, vars);
    toast.add({ severity: 'success', summary: 'Terkirim', detail: 'Pesan test dummy berhasil dikirim', life: 3000 });
  } catch (error) {
    // handled
  }
};

const handleInsertVariable = (v: string) => {
  if (editorRef.value) {
    editorRef.value.insertVariable(v);
  }
};
</script>

<template>
  <div class="space-y-6">
    <BasePageHeader 
      title="Template WhatsApp" 
      description="Kelola format pesan notifikasi yang akan dikirimkan otomatis ke WhatsApp guru."
      icon="pi pi-whatsapp"
    >
      <template #actions>
        <Button label="Reset Default" icon="pi pi-refresh" severity="secondary" outlined @click="store.resetDefault()" :loading="store.loading" />
        <Button v-if="!selectedTemplate" label="Buat Template" icon="pi pi-plus" @click="handleAdd" />
      </template>
    </BasePageHeader>

    <div v-if="!selectedTemplate" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
        <span class="p-input-icon-left w-64">
          <i class="pi pi-search" />
          <InputText v-model="filters.global.value" placeholder="Cari template..." class="w-full p-inputtext-sm" />
        </span>
      </div>
      
      <DataTable 
        :value="store.templates" 
        :loading="store.loading" 
        :filters="filters" 
        class="p-datatable-sm"
        stripedRows
      >
        <Column field="name" header="Nama Template" sortable>
          <template #body="{ data }">
            <div class="font-medium text-slate-800">{{ data.name }}</div>
            <div class="text-xs text-slate-500 font-mono mt-1">{{ data.code }}</div>
          </template>
        </Column>
        <Column field="category" header="Kategori" sortable>
          <template #body="{ data }">
            <Tag :value="data.category" severity="info" />
          </template>
        </Column>
        <Column field="isActive" header="Status" sortable>
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'Aktif' : 'Nonaktif'" :severity="data.isActive ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column header="Aksi" style="min-width: 8rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" outlined rounded size="small" class="mr-2" @click="editTemplate(data)" />
            <Button :icon="data.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'" outlined rounded size="small" :severity="data.isActive ? 'warning' : 'success'" @click="store.toggleStatus(data.id)" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center p-6 text-slate-500">Template tidak ditemukan.</div>
        </template>
      </DataTable>
    </div>

    <!-- Editor View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 class="font-bold text-slate-800 border-b pb-2 mb-4">{{ isNew ? 'Buat Template Baru' : 'Edit Template' }}</h3>
          
          <WaTemplateEditor 
            ref="editorRef"
            :template="selectedTemplate" 
            :isNew="isNew"
            @save="handleSave"
            @cancel="selectedTemplate = null"
            @test="handleTest"
          />
        </div>
        
        <WaVariableHelper @select="handleInsertVariable" />
      </div>

      <div class="lg:col-span-4">
        <h3 class="font-bold text-slate-800 mb-3 ml-1">Live Preview</h3>
        <WaPreviewCard :content="selectedTemplate.content || ''" />
      </div>

    </div>
  </div>
</template>
