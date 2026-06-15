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
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import ProgressBar from 'primevue/progressbar';
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
const isGeneratingPdf = ref(false);

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

const printReport = async () => {
  const element = document.getElementById('report-content');
  if (!element) return;
  
  isGeneratingPdf.value = true;
  toast.add({ severity: 'info', summary: 'Memproses', detail: 'Sedang membuat file PDF...', life: 2000 });
  
  // temporarily remove shadows, borders, margins, and padding for PDF export
  // removing padding and margin ensures the jsPDF margin is the ONLY margin, preventing offside/asymmetric layouts
  element.classList.remove('mx-auto', 'shadow-md', 'border', 'border-gray-200', 'p-8', 'md:p-12', 'mt-4');
  element.classList.add('p-0', 'm-0');
  
  // wait for DOM to update after class change
  await new Promise(resolve => setTimeout(resolve, 50));
  
  try {
    const elementWidth = element.scrollWidth;
    const elementHeight = element.scrollHeight;

    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: elementWidth,
      height: elementHeight
    });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const margin = 15; // 15mm margin
    const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
    const pdfHeight = (elementHeight * pdfWidth) / elementWidth;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let heightLeft = pdfHeight;
    
    // First page
    pdf.addImage(imgData, 'JPEG', margin, margin, pdfWidth, pdfHeight);
    heightLeft -= (pageHeight - margin * 2);
    
    let currentOffset = pageHeight - margin * 2;
    
    // Subsequent pages
    while (heightLeft > 0) {
      pdf.addPage();
      let yPosition = margin - currentOffset;
      pdf.addImage(imgData, 'JPEG', margin, yPosition, pdfWidth, pdfHeight);
      
      currentOffset += (pageHeight - margin * 2);
      heightLeft -= (pageHeight - margin * 2);
    }
    
    pdf.save(`Hasil_Supervisi_${teacher.value?.name?.replace(/\s+/g, '_') || 'Guru'}.pdf`);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'PDF berhasil diunduh', life: 3000 });
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan saat membuat PDF', life: 3000 });
  } finally {
    element.classList.remove('p-0', 'm-0');
    element.classList.add('mx-auto', 'shadow-md', 'border', 'border-gray-200', 'p-8', 'md:p-12', 'mt-4');
    isGeneratingPdf.value = false;
  }
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
          <Button label="Cetak PDF" icon="pi pi-file-pdf" @click="printReport" v-if="supervision?.status === 'SELESAI'" :loading="isGeneratingPdf" />
        </div>
      </template>
    </BasePageHeader>

    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton width="100%" height="15rem" />
      <Skeleton width="100%" height="20rem" />
    </div>

    <div id="report-content" v-else-if="supervision" class="max-w-[800px] mx-auto bg-white p-8 md:p-12 shadow-md border border-gray-200 mt-4 print:shadow-none print:border-none print:m-0 print:p-0" style="font-family: 'Times New Roman', Times, serif;">
      
      <!-- Report Header (Always visible now) -->
      <div class="mb-8">
        <ReportHeader :profile="profileStore.profile" :settings="settingStore.settings" />
        <div class="text-center mt-6 mb-8">
          <h2 class="font-bold text-xl underline underline-offset-4 mb-1 uppercase">Laporan Hasil Supervisi Akademik</h2>
        </div>
      </div>

      <!-- Identity Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8 text-base">
        <table class="w-full">
          <tbody>
            <tr>
              <td class="py-1 w-32 font-medium text-gray-700">Nama Guru</td>
              <td class="py-1 w-4 text-center">:</td>
              <td class="py-1 font-bold text-gray-900">{{ teacher?.name || 'Tidak diketahui' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">NIP/NUPTK</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ teacher?.nip || teacher?.nuptk || '-' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Mata Pelajaran</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ teacher?.mainSubjectName || '-' }}</td>
            </tr>
          </tbody>
        </table>
        
        <table class="w-full">
          <tbody>
            <tr>
              <td class="py-1 w-32 font-medium text-gray-700">Nama Penilai</td>
              <td class="py-1 w-4 text-center">:</td>
              <td class="py-1 text-gray-900">{{ supervisor?.name || 'Tidak diketahui' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Tanggal Supervisi</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ supervision.supervisionDate || supervision.scheduledDate || '-' }}</td>
            </tr>
            <tr>
              <td class="py-1 font-medium text-gray-700">Lokasi / Kelas</td>
              <td class="py-1 text-center">:</td>
              <td class="py-1 text-gray-900">{{ supervision.location || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Nilai -->
      <div class="mb-8">
        <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">I. Rincian Penilaian</h3>
        <DataTable :value="tableItems" rowGroupMode="subheader" groupRowsBy="displayGroup" sortMode="single" sortField="displayGroup" :sortOrder="1" class="text-base p-datatable-sm" showGridlines>
          <template #groupheader="slotProps">
              <span class="font-bold text-gray-900 uppercase bg-gray-100 px-2 py-1 block">{{ slotProps.data.displayGroup }}</span>
          </template>
          <Column field="itemCode" header="Kode" style="width: 10%" bodyStyle="vertical-align: top;"></Column>
          <Column field="itemDescription" header="Aspek yang Dinilai" style="width: 45%" bodyStyle="vertical-align: top;"></Column>
          <Column header="Skor" style="width: 15%" bodyStyle="vertical-align: top;" class="text-center">
            <template #body="{ data }">
              <span class="font-bold">{{ data.score !== null ? data.score : '-' }}</span>
              <span class="text-sm text-gray-600"> / {{ data.maxScore }}</span>
            </template>
          </Column>
          <Column field="note" header="Catatan" style="width: 30%" bodyStyle="vertical-align: top;">
            <template #body="{ data }">
              <span class="text-base text-gray-800 whitespace-pre-wrap">{{ data.note || '-' }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Catatan Umum & Hasil Akhir -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">II. Catatan Supervisi</h3>
          <table class="w-full text-base border-collapse border border-gray-300">
            <tbody>
              <tr v-if="supervision.initialNote">
                <td class="p-2 w-1/3 font-semibold bg-gray-50 border border-gray-300 align-top">Catatan Awal</td>
                <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ supervision.initialNote }}</td>
              </tr>
              <tr>
                <td class="p-2 w-1/3 font-semibold bg-gray-50 border border-gray-300 align-top">Kekuatan</td>
                <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ supervision.strengthNote || '-' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Area Perbaikan</td>
                <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ supervision.improvementNote || '-' }}</td>
              </tr>
              <tr>
                <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Rekomendasi</td>
                <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ supervision.recommendationNote || '-' }}</td>
              </tr>
              <tr v-if="supervision.generalNote">
                <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Lainnya</td>
                <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ supervision.generalNote }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">III. Hasil Akhir</h3>
          <div class="border border-gray-300 p-6 rounded bg-gray-50 flex flex-col items-center justify-center h-[calc(100%-2.5rem)] text-center">
            <div class="text-base font-semibold mb-2 uppercase tracking-wider text-gray-700">Nilai Supervisi</div>
            <div class="text-5xl font-bold text-gray-900 mb-3">{{ supervision.finalScore.toFixed(2) }}</div>
            <div class="text-base text-gray-600 mb-4">Total Skor: {{ supervision.totalScore }} / {{ supervision.maxScore }}</div>
            <div class="px-6 py-2 bg-primary text-white font-bold rounded-full text-lg tracking-wider">
              {{ supervision.finalStatus || 'Belum Ada Status' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="mt-8" style="page-break-inside: avoid;">
        <ReportSignatureSection 
          :profile="profileStore.profile" 
          :settings="settingStore.settings" 
          :supervisorName="supervisor?.name"
        />
      </div>

      <!-- Footer -->
      <div class="mt-16 text-center text-xs text-gray-400 border-t border-gray-200 pt-4 print:hidden">
        Dicetak dari Sistem E-Supervisi pada {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
      </div>
      
      <div class="hidden print:block mt-16">
        <ReportFooter :profile="profileStore.profile" :settings="settingStore.settings" />
      </div>

    </div>
  </div>
</template>
