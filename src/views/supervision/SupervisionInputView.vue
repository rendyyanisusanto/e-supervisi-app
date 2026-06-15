<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import InstrumentItemScoreCard from '../../components/supervision/InstrumentItemScoreCard.vue';
import ScoreSummaryPanel from '../../components/supervision/ScoreSummaryPanel.vue';
import InstrumentCategoryTabs from '../../components/supervision/InstrumentCategoryTabs.vue';
import SupervisionStatusTag from '../../components/supervision/SupervisionStatusTag.vue';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { calculateTotalScore, calculateMaxScore, calculateFinalScore, getScoreStatus } from '../../utils/score';
// We should import score ranges, for dummy let's use fixed or fetch
import { dummyScoreRanges } from '../../data/dummyScoreRanges';

const route = useRoute();
const router = useRouter();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const toast = useToast();
const confirm = useConfirm();

const supervisionId = route.params.id as string;
const activeCategory = ref('');
const isSaving = ref(false);
const showPreviewDialog = ref(false);

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Input Penilaian' }
]);

onMounted(async () => {
  await Promise.all([
    teacherStore.fetchTeachers(),
    instrumentStore.fetchInstruments(),
    supervisionStore.fetchSupervisionById(supervisionId)
  ]);

  if (supervisionStore.currentSupervision) {
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0];
    }
  } else {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Data supervisi tidak ditemukan', life: 3000 });
    router.push('/supervisi');
  }
});

const supervision = computed(() => supervisionStore.currentSupervision);
const loading = computed(() => supervisionStore.loading);

const categories = computed(() => {
  if (!supervision.value) return [];
  const cats = new Set(supervision.value.items.map(item => item.instrumentName || item.itemCategory));
  return Array.from(cats);
});

const itemsInActiveCategory = computed(() => {
  if (!supervision.value) return [];
  return supervision.value.items.filter(item => (item.instrumentName || item.itemCategory) === activeCategory.value);
});

const groupedItemsInActiveCategory = computed(() => {
  const groups: Record<string, any[]> = {};
  itemsInActiveCategory.value.forEach(item => {
    const cat = item.itemCategory || 'Umum';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
});

const teacher = computed(() => teacherStore.teachers.find(t => t.id === supervision.value?.teacherId));
const supervisor = computed(() => teacherStore.teachers.find(t => t.id === supervision.value?.supervisorId));
const instruments = computed(() => {
  if (!supervision.value?.instrumentIds) return [];
  return supervision.value.instrumentIds.map(id => instrumentStore.instruments.find(i => i.id === id)).filter(Boolean);
});
const instrumentNames = computed(() => instruments.value.map(i => i?.name).join(', '));

// Realtime calculation watch
watch(() => supervision.value?.items, (newItems) => {
  if (!supervision.value || !newItems) return;
  
  supervision.value.totalScore = calculateTotalScore(newItems);
  supervision.value.maxScore = calculateMaxScore(newItems);
  supervision.value.finalScore = calculateFinalScore(supervision.value.totalScore, supervision.value.maxScore);
  supervision.value.finalStatus = getScoreStatus(supervision.value.finalScore, dummyScoreRanges);
}, { deep: true });

const saveDraft = async () => {
  if (!supervision.value) return;
  isSaving.value = true;
  try {
    const payload = {
      items: supervision.value.items.map(i => ({
        supervisionItemId: Number(i.id),
        score: i.score,
        note: i.note
      })),
      strengthNote: supervision.value.strengthNote,
      improvementNote: supervision.value.improvementNote,
      generalNote: supervision.value.generalNote,
      recommendationNote: supervision.value.recommendationNote,
      conclusionNote: supervision.value.conclusionNote
    };
    await supervisionStore.saveDraft(supervisionId, payload);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Draft penilaian berhasil disimpan', life: 3000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Gagal menyimpan draft', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const handlePreview = () => {
  const isComplete = supervision.value?.items.every(i => i.score !== null);
  if (!isComplete) {
    confirm.require({
      message: 'Masih ada item yang belum dinilai. Anda tidak bisa melakukan submit final sebelum semua item terisi.',
      header: 'Peringatan',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Mengerti',
      rejectProps: { style: { display: 'none' } }
    });
    return;
  }
  showPreviewDialog.value = true;
};

const submitFinal = async () => {
  if (!supervision.value) return;
  isSaving.value = true;
  try {
    const payload = {
      items: supervision.value.items.map(i => ({
        supervisionItemId: Number(i.id),
        score: i.score,
        note: i.note
      })),
      strengthNote: supervision.value.strengthNote,
      improvementNote: supervision.value.improvementNote,
      generalNote: supervision.value.generalNote,
      recommendationNote: supervision.value.recommendationNote,
      conclusionNote: supervision.value.conclusionNote,
      supervisionDate: new Date().toISOString()
    };
    await supervisionStore.submitFinal(supervisionId, payload);
    showPreviewDialog.value = false;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian supervisi berhasil disubmit final', life: 3000 });
    setTimeout(() => {
      router.push(`/supervisi/${supervisionId}/hasil`);
    }, 1000);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message || 'Gagal submit final', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const lowScoreItemsCount = computed(() => {
  if (!supervision.value) return 0;
  return supervision.value.items.filter(i => i.score !== null && i.score < i.maxScore).length;
});
</script>

<template>
  <div class="flex flex-col gap-4 relative">
    
    <BasePageHeader 
      title="Input Penilaian" 
      :subtitle="instrumentNames || 'Instrumen Supervisi'"
      :breadcrumbs="breadcrumbs"
    />

    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 flex flex-col gap-4">
        <Skeleton width="100%" height="8rem" />
        <Skeleton width="100%" height="20rem" />
      </div>
      <div class="lg:col-span-1">
        <Skeleton width="100%" height="25rem" />
      </div>
    </div>

    <div v-else-if="supervision" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Kolom Utama Kiri -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        
        <!-- Identitas Supervisi -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-bold text-lg">Informasi Supervisi</h3>
            <SupervisionStatusTag :status="supervision.status" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3">
            <div>
              <div class="text-sm text-gray-500">Guru yang Dinilai</div>
              <div class="font-medium flex items-center gap-2 mt-1">
                <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {{ teacher?.name.charAt(0) || 'G' }}
                </div>
                {{ teacher?.name || 'Tidak diketahui' }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Penilai</div>
              <div class="font-medium flex items-center gap-2 mt-1">
                <i class="pi pi-user text-gray-400"></i>
                {{ supervisor?.name || 'Tidak diketahui' }}
              </div>
            </div>
            <div v-if="supervision.supervisionType === 'TERJADWAL'">
              <div class="text-sm text-gray-500">Jadwal</div>
              <div class="font-medium">{{ supervision.scheduledDate }} {{ supervision.scheduledTime }}</div>
            </div>
            <div v-if="supervision.location">
              <div class="text-sm text-gray-500">Lokasi Penilaian</div>
              <div class="font-medium flex items-center gap-2 mt-1">
                <i class="pi pi-map-marker text-gray-400"></i>
                {{ supervision.location }}
              </div>
            </div>
            <div v-if="supervision.initialNote" class="md:col-span-2 mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div class="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                <i class="pi pi-info-circle"></i> Catatan Awal
              </div>
              <div class="text-sm text-yellow-700 whitespace-pre-wrap">{{ supervision.initialNote }}</div>
            </div>
          </div>
        </div>

        <!-- Instrumen Penilaian -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-4">Input Skor</h3>
          
          <InstrumentCategoryTabs 
            :categories="categories" 
            v-model:activeCategory="activeCategory" 
          />

          <div class="flex flex-col gap-6">
            <div v-for="(group, catName) in groupedItemsInActiveCategory" :key="catName" class="flex flex-col gap-2">
              <div v-if="catName && catName !== 'Umum'" class="font-semibold text-blue-900 bg-blue-50 px-4 py-2.5 rounded-lg border border-blue-200 flex items-center gap-2 mb-2 shadow-sm">
                <i class="pi pi-tags text-blue-500"></i> {{ catName }}
              </div>
              <InstrumentItemScoreCard 
                v-for="item in group" 
                :key="item.id" 
                :item="item" 
                @update:item="(newItem) => { Object.assign(item, newItem) }"
              />
            </div>
          </div>
        </div>

        <!-- Catatan Umum -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-4">Catatan Umum Penilai</h3>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">Kekuatan / Hal Positif</label>
              <Textarea v-model="supervision.strengthNote" rows="3" placeholder="Tuliskan kekuatan guru yang perlu dipertahankan..." />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Area yang Perlu Diperbaiki</label>
              <Textarea v-model="supervision.improvementNote" rows="3" placeholder="Tuliskan hal-hal yang masih kurang dan perlu perbaikan..." />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Rekomendasi / Tindak Lanjut</label>
              <Textarea v-model="supervision.recommendationNote" rows="3" placeholder="Rekomendasi untuk guru ke depannya..." />
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan Sticky -->
      <div class="lg:col-span-1">
        <div class="sticky top-6">
          <ScoreSummaryPanel 
            :supervision="supervision" 
            :isSaving="isSaving"
            @save-draft="saveDraft"
            @preview="handlePreview"
          />
        </div>
      </div>

    </div>
    
    <!-- Dialog Preview Submit -->
    <Dialog v-model:visible="showPreviewDialog" modal header="Preview & Submit Final" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }">
      <div class="flex flex-col gap-4" v-if="supervision">
        <div class="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex gap-3 items-start">
          <i class="pi pi-exclamation-triangle mt-1"></i>
          <div>
            <p class="font-bold mb-1">Perhatian</p>
            <p class="text-sm">Setelah submit final, data tidak dapat diubah lagi. Pastikan semua nilai dan catatan sudah benar.</p>
          </div>
        </div>

        <div class="border rounded-lg p-4 bg-gray-50 grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500">Total Skor</div>
            <div class="text-xl font-bold">{{ supervision.totalScore }} / {{ supervision.maxScore }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Nilai Akhir</div>
            <div class="text-xl font-bold text-primary">{{ supervision.finalScore.toFixed(2) }} ({{ supervision.finalStatus }})</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Item Belum Maksimal</div>
            <div class="font-medium text-orange-600">{{ lowScoreItemsCount }} item</div>
          </div>
        </div>

        <div v-if="!supervision.strengthNote && !supervision.improvementNote && !supervision.recommendationNote" class="text-red-500 text-sm">
          <i class="pi pi-info-circle mr-1"></i> Disarankan untuk mengisi minimal satu catatan umum sebelum submit.
        </div>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="showPreviewDialog = false" severity="secondary" outlined />
        <Button label="Ya, Submit Final" icon="pi pi-check" @click="submitFinal" :loading="isSaving" severity="success" autofocus />
      </template>
    </Dialog>

  </div>
</template>
