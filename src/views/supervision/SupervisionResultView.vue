<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useInstrumentStore } from '../../stores/instrumentStore';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';
import { useReportSettingStore } from '../../stores/reportSettingStore';
import { useAuthStore } from '../../stores/authStore';
import { useReflectionStore } from '../../stores/reflectionStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import ReportHeader from '../../components/report/ReportHeader.vue';
import ReportFooter from '../../components/report/ReportFooter.vue';
import ReportSignatureSection from '../../components/report/ReportSignatureSection.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toJpeg } from 'html-to-image';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
const route = useRoute();
const router = useRouter();
const supervisionStore = useSupervisionStore();
const teacherStore = useTeacherStore();
const instrumentStore = useInstrumentStore();
const profileStore = useSchoolProfileStore();
const settingStore = useReportSettingStore();
const authStore = useAuthStore();
const reflectionStore = useReflectionStore();
const toast = useToast();
const isGeneratingPdf = ref(false);

const supervisionId = route.params.id as string;

const breadcrumbs = ref([
  { label: 'E-Supervisi', to: '/' },
  { label: 'Supervisi', to: '/supervisi' },
  { label: 'Hasil Supervisi' }
]);

const nestedTableItems = computed(() => {
  if (!supervision.value) return {};
  
  const instruments: Record<string, Record<string, any[]>> = {};
  
  supervision.value.items.forEach(item => {
    const inst = item.instrumentName || 'Umum';
    const cat = item.itemCategory || 'Tanpa Kategori';
    
    if (!instruments[inst]) instruments[inst] = {};
    if (!instruments[inst][cat]) instruments[inst][cat] = [];
    
    instruments[inst][cat].push(item);
  });
  
  return instruments;
});

const teacherHistory = ref<any[]>([]);

onMounted(async () => {
  await Promise.all([
    teacherStore.fetchTeachers(),
    instrumentStore.fetchInstruments(),
    profileStore.fetchProfile(),
    settingStore.fetchSettings(),
    supervisionStore.fetchSupervisionById(supervisionId),
    supervisionStore.fetchSupervisions(), // Fetch all so we can filter by teacher
    reflectionStore.fetchReflectionBySupervision(supervisionId)
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
const isGuru = computed(() => authStore.role === 'guru');

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

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
    const topElement = document.getElementById('pdf-top-section');
    const bottomElement = document.getElementById('pdf-bottom-section');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15; // 15mm margin
    const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let currentY = margin;
    
    // 1. Capture and add Top Section (Header + Identity)
    if (topElement) {
      const topWidth = topElement.scrollWidth;
      const topHeight = topElement.scrollHeight;
      const topImg = await toJpeg(topElement, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff', width: topWidth, height: topHeight });
      const imgHeight = (topHeight * pdfWidth) / topWidth;
      pdf.addImage(topImg, 'JPEG', margin, currentY, pdfWidth, imgHeight);
      currentY += imgHeight + 5;
    }
    
    // 2. Render native table using jsPDF-AutoTable (Handles page breaks flawlessly)
    autoTable(pdf, {
      html: '#rincian-table',
      startY: currentY,
      theme: 'grid',
      styles: { font: 'times', fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
      headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0, 0, 0] },
      margin: { left: margin, right: margin, bottom: margin, top: margin },
      didParseCell: function(data) {
        if (data.cell.colSpan === 4) {
          const cellText = (data.cell.text && data.cell.text.length > 0) ? data.cell.text[0].trim() : '';
          if (cellText.startsWith('>')) {
            // Category row
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.fontStyle = 'bolditalic';
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.halign = 'left';
          } else {
            // Instrument row
            data.cell.styles.fillColor = [220, 220, 220];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.halign = 'left';
          }
        }
      }
    });
    
    // Get Y position after table ends
    currentY = (pdf as any).lastAutoTable.finalY + 10;
    
    // 3. Capture and add Bottom Section (Notes + Signatures)
    if (bottomElement) {
      const bottomWidth = bottomElement.scrollWidth;
      const bottomHeight = bottomElement.scrollHeight;
      const bottomImg = await toJpeg(bottomElement, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff', width: bottomWidth, height: bottomHeight });
      const imgHeight = (bottomHeight * pdfWidth) / bottomWidth;
      
      // If bottom section exceeds remaining space on the page, create a new page
      if (currentY + imgHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.addImage(bottomImg, 'JPEG', margin, currentY, pdfWidth, imgHeight);
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
          <Button v-if="isGuru && supervision?.status === 'SELESAI'" label="Isi Refleksi" icon="pi pi-file-edit" @click="router.push(`/refleksi/${supervision.id}`)" severity="primary" />
          <Button v-else-if="supervision?.status === 'SELESAI'" label="Lihat Refleksi" icon="pi pi-eye" @click="router.push(`/refleksi/${supervision.id}`)" severity="info" outlined />
        </div>
      </template>
    </BasePageHeader>

    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton width="100%" height="15rem" />
      <Skeleton width="100%" height="20rem" />
    </div>

    <div id="report-content" v-else-if="supervision" class="max-w-[800px] mx-auto bg-white p-8 md:p-12 shadow-md border border-gray-200 mt-4 print:shadow-none print:border-none print:m-0 print:p-0" style="font-family: 'Times New Roman', Times, serif;">
      
      <div id="pdf-top-section">
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
      </div>

      <!-- Table Nilai -->
      <div class="mb-8">
        <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">I. Rincian Penilaian</h3>
        <table id="rincian-table" class="w-full border-collapse border border-gray-800 text-base">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-800 p-2 text-center w-16">Kode</th>
              <th class="border border-gray-800 p-2 text-left">Aspek yang Dinilai</th>
              <th class="border border-gray-800 p-2 text-center w-28">Skor</th>
              <th class="border border-gray-800 p-2 text-left w-64">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(categories, instName) in nestedTableItems" :key="instName">
              <!-- Instrument Header -->
              <tr data-type="instrument" class="bg-gray-100">
                <td colspan="4" class="border border-gray-800 p-2 font-bold text-gray-900 uppercase">
                  {{ instName }}
                </td>
              </tr>
              <template v-for="(items, catName) in categories" :key="catName">
                <!-- Category Header -->
                <tr data-type="category" v-if="catName !== 'Tanpa Kategori' && catName !== instName">
                  <td colspan="4" class="border border-gray-800 p-2 font-bold italic text-gray-900 pl-6 bg-gray-50">
                    > {{ catName }}
                  </td>
                </tr>
                <!-- Items -->
                <tr v-for="item in items" :key="item.id">
                  <td class="border border-gray-800 p-2 align-top text-center">{{ item.itemCode }}</td>
                  <td class="border border-gray-800 p-2 align-top" :class="{'pl-10': catName !== 'Tanpa Kategori' && catName !== instName}">
                    {{ item.itemDescription }}
                  </td>
                  <td class="border border-gray-800 p-2 align-top text-center">
                    <span class="font-bold">{{ item.score !== null ? item.score : '-' }}</span>
                    <span class="text-sm text-gray-600"> / {{ item.maxScore }}</span>
                  </td>
                  <td class="border border-gray-800 p-2 align-top whitespace-pre-wrap">{{ item.note || '-' }}</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <div id="pdf-bottom-section">
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

      <!-- Refleksi Guru -->
      <div class="mb-12" v-if="reflectionStore.currentReflection && reflectionStore.currentReflection.status !== 'BELUM_DIISI'">
        <h3 class="font-bold text-lg mb-3 border-b-2 border-gray-800 pb-1 uppercase">IV. Refleksi Guru</h3>
        <table class="w-full text-base border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td class="p-2 w-1/3 font-semibold bg-gray-50 border border-gray-300 align-top">Kekuatan yang Dirasakan</td>
              <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ reflectionStore.currentReflection.strengthReflection || '-' }}</td>
            </tr>
            <tr>
              <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Kendala yang Dialami</td>
              <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ reflectionStore.currentReflection.obstacleReflection || '-' }}</td>
            </tr>
            <tr>
              <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Rencana Perbaikan</td>
              <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ reflectionStore.currentReflection.improvementPlan || '-' }}</td>
            </tr>
            <tr>
              <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Dukungan yang Dibutuhkan</td>
              <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ reflectionStore.currentReflection.supportNeeded || '-' }}</td>
            </tr>
            <tr v-if="reflectionStore.currentReflection.targetDate">
              <td class="p-2 font-semibold bg-gray-50 border border-gray-300 align-top">Target Waktu Perbaikan</td>
              <td class="p-2 border border-gray-300 whitespace-pre-wrap">{{ formatDate(reflectionStore.currentReflection.targetDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signatures -->
      <div class="mt-8" style="page-break-inside: avoid;">
        <ReportSignatureSection 
          :profile="profileStore.profile" 
          :settings="settingStore.settings" 
          :supervisorName="supervisor?.name"
        />
        </div>
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
