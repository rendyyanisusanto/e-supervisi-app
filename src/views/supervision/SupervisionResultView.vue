<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';
import { useReportSettingStore } from '../../stores/reportSettingStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import ReportHeader from '../../components/report/ReportHeader.vue';
import ReportFooter from '../../components/report/ReportFooter.vue';
import ReportSignatureSection from '../../components/report/ReportSignatureSection.vue';
import { triggerPrint } from '../../utils/print';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { calculateCategoryScores } from '../../utils/score';
import { dummyScoreRanges } from '../../data/dummyScoreRanges';

const route = useRoute();
const router = useRouter();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const profileStore = useSchoolProfileStore();
const settingStore = useReportSettingStore();
const toast = useToast();

const supervisionId = route.params.id as string;

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Hasil Supervisi' }
]);

const categoryScores = computed(() => {
  if (!supervision.value) return [];
  return calculateCategoryScores(supervision.value.items, dummyScoreRanges);
});

const tableItems = computed(() => {
  if (!supervision.value) return [];
  return supervision.value.items.map(item => ({
    ...item,
    displayGroup: item.instrumentName || item.itemCategory
  }));
});

const teacherHistory = ref<any[]>([]);

onMounted(async () => {
  await Promise.all([
    teacherStore.fetchTeachers(),
    instrumentStore.fetchInstruments(),
    profileStore.fetchProfile(),
    settingStore.fetchSettings(),
    supervisionStore.fetchSupervisionById(supervisionId),
    supervisionStore.fetchSupervisions() // Fetch all so we can filter by teacher
  ]);

  if (!supervisionStore.currentSupervision) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Data supervisi tidak ditemukan', life: 3000 });
    router.push('/supervisi');
  } else {
    // Populate teacher history
    teacherHistory.value = supervisionStore.supervisions
      .filter(s => s.teacherId === supervisionStore.currentSupervision?.teacherId && s.id !== supervisionId && s.status === 'SELESAI')
      .slice(0, 3); // latest 3
  }
});

const supervision = computed(() => supervisionStore.currentSupervision);
const loading = computed(() => supervisionStore.loading);

const teacher = computed(() => teacherStore.teachers.find(t => t.id === supervision.value?.teacherId));
const supervisor = computed(() => teacherStore.teachers.find(t => t.id === supervision.value?.supervisorId));
const instruments = computed(() => {
  if (!supervision.value?.instrumentIds) return [];
  return supervision.value.instrumentIds.map(id => instrumentStore.instruments.find(i => i.id === id)).filter(Boolean);
});
const instrumentNames = computed(() => instruments.value.map(i => i?.name).join(', '));

const printReport = () => {
  triggerPrint();
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <BasePageHeader 
      title="Detail Hasil Supervisi" 
      :subtitle="instrumentNames || 'Instrumen Supervisi'"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <div class="flex gap-2">
          <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push('/supervisi')" />
          <Button label="Cetak Laporan" icon="pi pi-print" @click="printReport" v-if="supervision?.status === 'SELESAI'" />
        </div>
      </template>
    </BasePageHeader>

    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton width="100%" height="15rem" />
      <Skeleton width="100%" height="20rem" />
    </div>

    <div v-else-if="supervision" class="flex flex-col gap-6 print:block print:bg-white print:m-0 print:p-0">
      
      <div class="hidden print:block mb-8">
        <ReportHeader :profile="profileStore.profile" :settings="settingStore.settings" />
        <div class="text-center mb-6">
          <h2 class="font-bold text-lg underline underline-offset-4 mb-1">HASIL SUPERVISI GURU</h2>
        </div>
      </div>

      <!-- Top Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Identity Card -->
        <Card class="md:col-span-2 shadow-sm border-none">
          <template #content>
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
                {{ teacher?.name.charAt(0) || 'G' }}
              </div>
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                <div>
                  <div class="text-sm text-gray-500">Guru yang Dinilai</div>
                  <div class="font-bold text-lg text-gray-800">{{ teacher?.name || 'Tidak diketahui' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">Penilai</div>
                  <div class="font-medium text-gray-800">{{ supervisor?.name || 'Tidak diketahui' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">Instrumen</div>
                  <div class="font-medium text-gray-800">{{ instrumentNames || 'Tidak diketahui' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">Tanggal Supervisi</div>
                  <div class="font-medium text-gray-800">{{ supervision.supervisionDate || supervision.scheduledDate || '-' }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Final Score Card -->
        <Card class="bg-primary text-white shadow-sm border-none overflow-hidden relative">
          <template #content>
            <div class="absolute top-0 right-0 p-4 opacity-20">
              <i class="pi pi-star-fill text-6xl"></i>
            </div>
            <div class="relative z-10 flex flex-col items-center justify-center h-full gap-2 py-2">
              <div class="text-white/80 font-medium">Nilai Akhir</div>
              <div class="text-5xl font-bold">{{ supervision.finalScore.toFixed(2) }}</div>
              <div class="bg-white/20 px-4 py-1 rounded-full font-bold tracking-wider mt-2">
                {{ supervision.finalStatus || 'Belum Ada Status' }}
              </div>
              <div class="text-sm text-white/70 mt-2">
                Total Skor: {{ supervision.totalScore }} / {{ supervision.maxScore }}
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          
          <!-- Category Scores -->
          <Card class="shadow-sm border-none">
            <template #title><h3 class="font-bold text-lg mb-2">Ringkasan per Aspek/Kategori</h3></template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div v-for="cat in categoryScores" :key="cat.category" class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-800">{{ cat.category }}</span>
                    <span class="font-bold text-primary">{{ cat.finalScore.toFixed(2) }} ({{ cat.status }})</span>
                  </div>
                  <ProgressBar :value="cat.finalScore" :showValue="false" style="height: 8px" />
                  <div class="text-right text-xs text-gray-500 mt-2">
                    Skor: {{ cat.totalScore }} / {{ cat.maxScore }}
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Detail Items -->
          <Card class="shadow-sm border-none">
            <template #title><h3 class="font-bold text-lg mb-2">Detail Penilaian per Item</h3></template>
            <template #content>
              <DataTable :value="tableItems" responsiveLayout="scroll" :paginator="true" :rows="10" rowGroupMode="subheader" groupRowsBy="displayGroup" sortMode="single" sortField="displayGroup" :sortOrder="1" showGridlines>
                <template #groupheader="slotProps">
                    <span class="font-bold text-primary bg-blue-50 px-3 py-1 rounded">{{ slotProps.data.displayGroup }}</span>
                </template>
                <Column field="itemCode" header="Kode" style="width: 10%" bodyStyle="vertical-align: top;"></Column>
                <Column field="itemDescription" header="Deskripsi Item" style="width: 45%" bodyStyle="vertical-align: top;"></Column>
                <Column header="Skor" style="width: 15%" bodyStyle="vertical-align: top;">
                  <template #body="{ data }">
                    <span class="font-bold">{{ data.score !== null ? data.score : '-' }}</span>
                    <span class="text-xs text-gray-500"> / {{ data.maxScore }}</span>
                  </template>
                </Column>
                <Column field="itemStatus" header="Status" style="width: 15%" bodyStyle="vertical-align: top;">
                  <template #body="{ data }">
                    <span v-if="data.itemStatus" class="text-sm">{{ data.itemStatus }}</span>
                    <span v-else class="text-sm text-gray-400">-</span>
                  </template>
                </Column>
                <Column field="note" header="Catatan" style="width: 15%" bodyStyle="vertical-align: top;">
                  <template #body="{ data }">
                    <span class="text-sm text-gray-600 whitespace-pre-wrap">{{ data.note || '-' }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

        </div>

        <!-- Sidebar / Notes -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <Card class="shadow-sm border-none">
            <template #title><h3 class="font-bold text-lg mb-2">Catatan Umum Penilai</h3></template>
            <template #content>
              <div class="flex flex-col gap-4">
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div class="font-bold text-green-800 mb-1 flex items-center gap-2"><i class="pi pi-thumbs-up"></i> Kekuatan / Hal Positif</div>
                  <div class="text-sm text-green-900 whitespace-pre-wrap">{{ supervision.strengthNote || 'Tidak ada catatan.' }}</div>
                </div>
                
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div class="font-bold text-orange-800 mb-1 flex items-center gap-2"><i class="pi pi-exclamation-circle"></i> Area Perbaikan</div>
                  <div class="text-sm text-orange-900 whitespace-pre-wrap">{{ supervision.improvementNote || 'Tidak ada catatan.' }}</div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div class="font-bold text-blue-800 mb-1 flex items-center gap-2"><i class="pi pi-info-circle"></i> Rekomendasi</div>
                  <div class="text-sm text-blue-900 whitespace-pre-wrap">{{ supervision.recommendationNote || 'Tidak ada catatan.' }}</div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200" v-if="supervision.generalNote">
                  <div class="font-bold text-gray-800 mb-1 flex items-center gap-2"><i class="pi pi-align-left"></i> Catatan Lainnya</div>
                  <div class="text-sm text-gray-700 whitespace-pre-wrap">{{ supervision.generalNote }}</div>
                </div>
              </div>
            </template>
          </Card>

          <Card class="shadow-sm border-none">
            <template #title><h3 class="font-bold text-lg mb-2">Riwayat Supervisi Guru</h3></template>
            <template #content>
              <div v-if="teacherHistory.length === 0" class="text-sm text-gray-500 italic">
                Belum ada riwayat supervisi sebelumnya.
              </div>
              <div v-else class="flex flex-col gap-3">
                <div v-for="hist in teacherHistory" :key="hist.id" class="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div class="text-xs text-gray-500 mb-1">{{ hist.supervisionDate }}</div>
                  <div class="font-medium text-sm">{{
                    hist.instrumentIds 
                      ? hist.instrumentIds.map((id: string) => instrumentStore.instruments.find(i => i.id === id)?.name).join(', ') 
                      : 'Instrumen'
                  }}</div>
                  <div class="flex justify-between items-center mt-1">
                    <span class="font-bold text-primary">{{ hist.finalScore.toFixed(2) }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full" :class="hist.finalStatus === 'Kurang' || hist.finalStatus === 'Perlu Pembinaan' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                      {{ hist.finalStatus }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <Card class="shadow-sm border-none">
            <template #title><h3 class="font-bold text-lg mb-2">Refleksi Guru</h3></template>
            <template #content>
              <div class="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <i class="pi pi-comment text-3xl mb-2 text-gray-400"></i>
                <p class="text-sm mb-4">Refleksi guru belum diisi.</p>
                <Button label="Isi Refleksi (Sprint 4)" severity="secondary" size="small" outlined disabled />
              </div>
            </template>
          </Card>
        </div>
      </div>

      <div class="hidden print:block mt-8">
        <ReportSignatureSection 
          :profile="profileStore.profile" 
          :settings="settingStore.settings" 
          :supervisorName="supervisor?.name"
        />
        <ReportFooter :profile="profileStore.profile" :settings="settingStore.settings" />
      </div>
    </div>
  </div>
</template>
