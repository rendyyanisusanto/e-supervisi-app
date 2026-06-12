<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useReportStore } from '../../stores/reportStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useAuthStore } from '../../stores/authStore';
import { useSchoolProfileStore } from '../../stores/schoolProfileStore';
import { useReportSettingStore } from '../../stores/reportSettingStore';
import { usePeriodStore } from '../../stores/periodStore';
import { useToast } from 'primevue/usetoast';
import { triggerPrint } from '../../utils/print';

import Dropdown from 'primevue/dropdown';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import BasePageHeader from '../../components/common/BasePageHeader.vue';

import ReportHeader from '../../components/report/ReportHeader.vue';
import ReportFooter from '../../components/report/ReportFooter.vue';
import ReportSignatureSection from '../../components/report/ReportSignatureSection.vue';
import TeacherReportSummary from '../../components/report/TeacherReportSummary.vue';
import TeacherReportInstrumentTable from '../../components/report/TeacherReportInstrumentTable.vue';
import TeacherCompetencyChart from '../../components/competency/TeacherCompetencyChart.vue';
import ReflectionSummaryCard from '../../components/reflection/ReflectionSummaryCard.vue';

const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const reportStore = useReportStore();
const profileStore = useSchoolProfileStore();
const settingStore = useReportSettingStore();
const periodStore = usePeriodStore();
const toast = useToast();

const selectedTeacherId = ref<string | null>(null);
const selectedPeriodId = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    teacherStore.fetchTeachers(),
    profileStore.fetchProfile(),
    settingStore.fetchSettings(),
    periodStore.fetchPeriods()
  ]);
  
  if (authStore.role === 'guru') {
    selectedTeacherId.value = authStore.user?.id ? String(authStore.user.id) : null;
  }

  // Set default period
  const activePeriod = periodStore.periods.find(p => p.isActive);
  if (activePeriod) {
    selectedPeriodId.value = String(activePeriod.id);
  } else if (periodStore.periods.length > 0) {
    selectedPeriodId.value = String(periodStore.periods[0].id);
  }

  loading.value = false;
});

watch([selectedTeacherId, selectedPeriodId], async ([newTeacher, newPeriod]) => {
  if (newTeacher && newPeriod) {
    await reportStore.fetchTeacherReport(newTeacher, newPeriod);
  } else {
    reportStore.currentReport = null;
  }
});

const handlePrint = () => {
  if (!reportStore.currentReport) return;
  triggerPrint();
};

const handleExportPdf = () => {
  toast.add({ severity: 'info', summary: 'Info', detail: 'Export PDF akan tersedia setelah backend laporan disambungkan.', life: 3000 });
};

const isGuruRole = computed(() => authStore.role === 'guru');
</script>

<template>
  <div class="flex flex-col gap-4 relative print:gap-0 print:p-0">
    <div class="no-print">
      <BasePageHeader 
        title="Rapor Supervisi Guru" 
        subtitle="Cetak dan analisis laporan komprehensif hasil supervisi dan refleksi guru."
        icon="pi pi-file-pdf"
      >
        <div class="flex gap-2" v-if="reportStore.currentReport">
          <Button label="Print (A4)" icon="pi pi-print" severity="secondary" @click="handlePrint" />
          <Button label="Export PDF" icon="pi pi-download" @click="handleExportPdf" />
        </div>
      </BasePageHeader>

      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div class="font-medium text-slate-700">Pilih Guru:</div>
        <Dropdown 
          v-model="selectedTeacherId" 
          :options="teacherStore.teachers" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Pilih Guru" 
          class="w-full sm:w-80" 
          :disabled="isGuruRole"
          filter
        />

        <div class="font-medium text-slate-700 ml-0 sm:ml-4">Periode:</div>
        <Dropdown 
          v-model="selectedPeriodId" 
          :options="periodStore.periods" 
          optionLabel="name" 
          optionValue="id" 
          placeholder="Pilih Periode" 
          class="w-full sm:w-64" 
        />
      </div>
    </div>

    <!-- Print Layout Root -->
    <div id="print-area" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10 lg:p-12 print:shadow-none print:border-none print:m-0" v-if="reportStore.currentReport">
      <ReportHeader :profile="profileStore.profile" :settings="settingStore.settings" />
      
      <div class="text-center mb-6 no-print print:block">
        <h2 class="font-bold text-lg underline underline-offset-4 mb-1">LAPORAN SUPERVISI GURU</h2>
      </div>

      <div class="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 mb-6">
        <div class="grid grid-cols-[120px_10px_1fr]">
          <span class="font-medium">Nama Guru</span><span>:</span><span class="font-bold">{{ reportStore.currentReport.teacher.name }}</span>
          <span class="font-medium">NIP</span><span>:</span><span>{{ reportStore.currentReport.teacher.nip || '-' }}</span>
          <span class="font-medium">Mata Pelajaran</span><span>:</span><span>{{ reportStore.currentReport.teacher.mainSubjectId || '-' }}</span>
          <span class="font-medium">Periode</span><span>:</span><span>Semester Ganjil 2026/2027</span>
        </div>
      </div>

      <TeacherReportSummary :summary="reportStore.currentReport.summary" />
      
      <TeacherReportInstrumentTable :supervisions="reportStore.currentReport.supervisions" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 print:block print:space-y-8">
        <!-- Peta Kompetensi Mini -->
        <div class="print:break-inside-avoid">
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Peta Kompetensi</h3>
          <div class="h-64 border rounded-xl p-4 bg-slate-50 print:bg-white print:border-slate-300">
            <TeacherCompetencyChart :competency="reportStore.currentReport.competency" :flat="true" />
          </div>
        </div>

        <!-- Catatan Penilai -->
        <div class="print:break-inside-avoid">
          <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Catatan Kepala Sekolah / Kurikulum</h3>
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 print:bg-white">
            <div>
              <span class="font-semibold text-slate-700 block mb-1">Kesimpulan Umum:</span>
              <p class="text-slate-600 text-sm">{{ reportStore.currentReport.curriculumConclusion }}</p>
            </div>
            <div>
              <span class="font-semibold text-slate-700 block mb-1">Rekomendasi Pembinaan:</span>
              <p class="text-slate-600 text-sm">{{ reportStore.currentReport.curriculumRecommendation }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Refleksi Guru -->
      <div class="mb-8 print:break-inside-avoid" v-if="reportStore.currentReport.reflections.length > 0">
        <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Refleksi Mandiri Guru</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
          <ReflectionSummaryCard v-for="ref in reportStore.currentReport.reflections" :key="ref.id" :reflection="ref" class="print:border-slate-300 print:shadow-none" />
        </div>
      </div>
      <div class="mb-8 print:break-inside-avoid p-6 text-center border border-dashed border-slate-300 rounded-xl" v-else>
        <span class="text-slate-500 italic">Guru belum mengisi lembar refleksi untuk periode ini.</span>
      </div>

      <!-- Tanda Tangan -->
      <ReportSignatureSection 
        :profile="profileStore.profile" 
        :settings="settingStore.settings" 
        class="print:break-inside-avoid"
      />

      <ReportFooter :profile="profileStore.profile" :settings="settingStore.settings" />
    </div>

    <!-- Loading / Empty -->
    <div v-else-if="loading || reportStore.loading" class="no-print">
      <Skeleton width="100%" height="40rem" class="rounded-xl" />
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center no-print">
      <i class="pi pi-file text-5xl text-slate-300 mb-4 block"></i>
      <h3 class="text-xl font-bold text-slate-700 mb-2">Pilih Guru</h3>
      <p class="text-slate-500">Silakan pilih guru dari dropdown di atas untuk melihat dan mencetak rapor.</p>
    </div>

  </div>
</template>
