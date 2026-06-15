<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';


import BaseLoadingSkeleton from '../../components/common/BaseLoadingSkeleton.vue';
import BaseErrorState from '../../components/common/BaseErrorState.vue';
import BaseEmptyState from '../../components/common/BaseEmptyState.vue';

const route = useRoute();
const router = useRouter();
const instrumentStore = useInstrumentStore();
const toast = useToast();
const confirm = useConfirm();

const instrumentId = route.params.id as string;
const activeInstrument = ref<any>(null);

// Form State for Builder
// To make it easy, we map items into a reactive array of categories
interface BuilderItem {
  id: string; // temporary id for new items
  code: string;
  description: string;
  maxScore: number;
  sortOrder: number;
  isActive: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface BuilderCategory {
  name: string;
  items: BuilderItem[];
}

const categories = ref<BuilderCategory[]>([]);
const isSaving = ref(false);

const generateId = () => Math.random().toString(36).substring(2, 9);

onMounted(async () => {
  if (instrumentStore.instruments.length === 0) {
    await instrumentStore.fetchInstruments();
  }
  loadInstrument();
});

const loadInstrument = () => {
  const found = instrumentStore.instruments.find(i => i.id === instrumentId);
  if (!found) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Instrumen tidak ditemukan', life: 3000 });
    return;
  }
  activeInstrument.value = JSON.parse(JSON.stringify(found)); // deep clone
  
  // Group items by category
  const catsMap: Record<string, BuilderItem[]> = {};
  if (activeInstrument.value.items) {
    const sorted = [...activeInstrument.value.items].sort((a, b) => a.sortOrder - b.sortOrder);
    sorted.forEach((item: any) => {
      if (!catsMap[item.category]) catsMap[item.category] = [];
      catsMap[item.category].push({ ...item });
    });
  }
  
  categories.value = Object.keys(catsMap).map(name => ({
    name,
    items: catsMap[name]
  }));
};

const goBack = () => {
  router.push('/instrumen');
};

const addCategory = () => {
  categories.value.push({
    name: 'Kategori Baru',
    items: []
  });
};

const removeCategory = (index: number) => {
  confirm.require({
    message: 'Hapus kategori ini beserta semua pertanyaannya?',
    header: 'Konfirmasi',
    icon: 'pi pi-trash',
    acceptClass: 'p-button-danger',
    accept: () => {
      categories.value.splice(index, 1);
    }
  });
};

const addItem = (categoryIndex: number) => {
  const items = categories.value[categoryIndex].items;
  const lastSort = items.length > 0 ? items[items.length - 1].sortOrder : 0;
  
  items.push({
    id: `temp-${generateId()}`,
    code: '',
    description: '',
    maxScore: 4,
    sortOrder: lastSort + 1,
    isActive: true,
    isNew: true
  });
};

const removeItem = (categoryIndex: number, itemIndex: number) => {
  categories.value[categoryIndex].items.splice(itemIndex, 1);
};

const saveBuilder = async () => {
  // Validate
  let hasError = false;
  const flattenedItems: any[] = [];
  
  let globalSort = 1;
  
  for (const cat of categories.value) {
    if (!cat.name.trim()) {
      hasError = true;
      toast.add({ severity: 'error', summary: 'Validasi', detail: 'Nama kategori tidak boleh kosong', life: 3000 });
      break;
    }
    
    for (const item of cat.items) {
      if (!item.code.trim() || !item.description.trim()) {
        hasError = true;
        toast.add({ severity: 'error', summary: 'Validasi', detail: `Kode dan Pertanyaan di kategori ${cat.name} harus diisi`, life: 3000 });
        break;
      }
      
      flattenedItems.push({
        id: item.isNew ? undefined : item.id,
        category: cat.name,
        code: item.code,
        description: item.description,
        maxScore: item.maxScore || 0,
        sortOrder: globalSort++,
        isActive: item.isActive
      });
    }
    if (hasError) break;
  }
  
  if (hasError) return;
  
  try {
    isSaving.value = true;
    
    const originalInstrument = instrumentStore.instruments.find(i => i.id === instrumentId);
    const originalItems = originalInstrument?.items || [];
    
    // Find items to delete
    const itemsToDelete = originalItems.filter((oi: any) => !flattenedItems.find(fi => fi.id === oi.id));
    for (const item of itemsToDelete) {
      if (item.id) {
        await instrumentStore.deleteItem(instrumentId, item.id);
      }
    }

    // Find items to add or update
    for (const item of flattenedItems) {
      if (!item.id || String(item.id).startsWith('temp-')) {
        await instrumentStore.addItem(instrumentId, {
          category: item.category,
          code: item.code,
          description: item.description,
          maxScore: item.maxScore,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        });
      } else {
        await instrumentStore.updateItem(instrumentId, item.id, {
          category: item.category,
          code: item.code,
          description: item.description,
          maxScore: item.maxScore,
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        });
      }
    }
    
    // Also re-fetch to make sure we have the latest items with proper IDs from the backend
    await instrumentStore.fetchInstruments();
    
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Instrumen berhasil disimpan', life: 3000 });
    
    // Reload local state to remove temp IDs
    loadInstrument();
    
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Gagal menyimpan', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const totalScore = computed(() => {
  return categories.value.reduce((sum, cat) => {
    return sum + cat.items.reduce((catSum, item) => catSum + (item.maxScore || 0), 0);
  }, 0);
});

const totalItems = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.items.length, 0);
});
</script>

<template>
  <div class="pb-20">
    <BaseErrorState 
      v-if="instrumentStore.error" 
      title="Gagal Memuat Data" 
      :description="instrumentStore.error" 
      @retry="loadInstrument" 
    />
    
    <BaseLoadingSkeleton v-else-if="instrumentStore.loading && !activeInstrument" type="card" />
    
    <div v-else-if="activeInstrument">
      <!-- Fixed Header Actions -->
      <div class="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 -mx-6 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-sm">
        <div class="flex items-center gap-4">
          <Button icon="pi pi-arrow-left" text rounded @click="goBack" aria-label="Kembali" />
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{ activeInstrument.code }}</span>
              <h1 class="text-xl font-bold text-slate-800">{{ activeInstrument.name }}</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">Form Builder &bull; Total: {{ totalItems }} Item (Skor Maks: {{ totalScore }})</p>
          </div>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <Button label="Batal" icon="pi pi-times" severity="secondary" text @click="loadInstrument" />
          <Button label="Simpan Perubahan" icon="pi pi-save" @click="saveBuilder" :loading="isSaving" class="w-full md:w-auto" />
        </div>
      </div>

      <!-- Builder Area -->
      <div class="w-full space-y-6">
        
        <BaseEmptyState 
          v-if="categories.length === 0" 
          title="Instrumen Kosong" 
          description="Mulai membuat form dengan menambahkan kategori pertama." 
          icon="pi pi-file-edit"
        >
          <template #action>
            <Button label="Tambah Kategori" icon="pi pi-plus" @click="addCategory" />
          </template>
        </BaseEmptyState>

        <div v-for="(cat, catIndex) in categories" :key="catIndex" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:border-blue-300">
          <!-- Category Header -->
          <div class="bg-blue-50/50 p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div class="flex-1">
              <InputText v-model="cat.name" placeholder="Nama Kategori (Cth: Kegiatan Pendahuluan)" class="w-full text-lg font-semibold bg-transparent border-transparent hover:border-slate-300 focus:bg-white focus:border-blue-500 transition-colors px-2 py-1" />
            </div>
            <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Hapus Kategori" @click="removeCategory(catIndex)" />
          </div>

          <!-- Items List -->
          <div class="p-4 space-y-3 bg-slate-50/30">
            <div v-for="(item, itemIndex) in cat.items" :key="item.id" class="flex flex-col md:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-slate-200 hover:shadow-md transition-shadow group relative">
              
              <!-- Drag Handle (Visual only for now) -->
              <div class="text-slate-300 mt-2 cursor-grab hidden md:block">
                <i class="pi pi-bars"></i>
              </div>

              <div class="flex flex-col w-full gap-2">
                <!-- Mobile Only Header for Item -->
                <div class="flex justify-between items-center md:hidden mb-1 border-b border-slate-100 pb-2">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider"><i class="pi pi-bars mr-2"></i>Indikator</span>
                  <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="removeItem(catIndex, itemIndex)" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-start">
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-500 mb-1">Kode</label>
                    <InputText v-model="item.code" placeholder="Cth: A.1" class="w-full" />
                  </div>
                  
                  <div class="md:col-span-8">
                    <label class="block text-xs font-medium text-slate-500 mb-1">Pertanyaan / Indikator</label>
                    <Textarea v-model="item.description" placeholder="Tulis indikator di sini..." class="w-full" rows="1" autoResize />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-500 mb-1">Skor Maks</label>
                    <InputNumber v-model="item.maxScore" :min="1" class="w-full" />
                  </div>
                </div>
              </div>

              <!-- Desktop Delete Item Action -->
              <div class="hidden md:block">
                <Button icon="pi pi-times" severity="danger" text rounded class="opacity-0 group-hover:opacity-100 transition-opacity mt-6" @click="removeItem(catIndex, itemIndex)" />
              </div>
            </div>

            <!-- Add Item Button -->
            <div class="pt-2">
              <Button label="Tambah Indikator" icon="pi pi-plus" text size="small" @click="addItem(catIndex)" />
            </div>
          </div>
        </div>

        <!-- Add Category Footer -->
        <div v-if="categories.length > 0" class="flex justify-center mt-8 pt-4">
          <Button label="Tambah Kategori Baru" icon="pi pi-plus" outlined size="large" class="w-full md:w-auto" @click="addCategory" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Optional: to make transparent inputs look clean */
:deep(.p-inputtext.bg-transparent) {
  box-shadow: none;
}
:deep(.p-inputtext.bg-transparent:hover) {
  box-shadow: none;
}
</style>
