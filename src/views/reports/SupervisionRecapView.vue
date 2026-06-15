<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useReportStore } from '../../stores/reportStore';
import { usePeriodStore } from '../../stores/periodStore';
import { useRouter } from 'vue-router';
import { formatDate } from '../../utils/formatDate';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';

const router = useRouter();
const reportStore = useReportStore();
const periodStore = usePeriodStore();

const selectedPeriod = ref<any>(null);
const searchQuery = ref('');

onMounted(async () => {
  await periodStore.fetchPeriods();
  if ((periodStore as any).activePeriod) {
    selectedPeriod.value = (periodStore as any).activePeriod;
  } else if (periodStore.periods.length > 0) {
    selectedPeriod.value = periodStore.periods[0];
  }
  
  if (selectedPeriod.value) {
    await loadData(selectedPeriod.value.id);
  }
});

watch(selectedPeriod, async (newVal) => {
  if (newVal) {
    await loadData(newVal.id);
  }
});

const loadData = async (periodId: string) => {
  await reportStore.fetchSupervisionRecap(periodId);
};

const summary = computed(() => reportStore.currentRecapSummary);
const byInstrument = computed(() => reportStore.currentRecapByInstrument);
const teacherCoverage = computed(() => reportStore.currentRecapTeacherCoverage);
const supervisionsData = computed(() => reportStore.currentRecapData);

const filteredData = computed(() => {
  let result = supervisionsData.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((r: any) => 
      r.teacherName?.toLowerCase().includes(q) || 
      r.supervisorName?.toLowerCase().includes(q) ||
      r.instrumentName?.toLowerCase().includes(q)
    );
  }
  return result;
});

const handlePrint = () => {
  if (!summary.value) return;

  const doc = new jsPDF();
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Laporan Rekap Supervisi Akademik', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const periodName = selectedPeriod.value?.name || 'Semua Periode';
  doc.text(`Periode: ${periodName}`, 14, 26);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // Top Stats
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Ringkasan Pelaksanaan', 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  
  doc.text(`Total Supervisi: ${summary.value.totalSupervisions}`, 14, 49);
  doc.text(`Selesai: ${summary.value.totalCompleted}`, 80, 49);
  doc.text(`Terjadwal: ${summary.value.totalScheduled}`, 120, 49);
  doc.text(`Draft/Batal: ${summary.value.totalDraft + summary.value.totalCancelled}`, 160, 49);
  
  doc.text(`Rata-Rata Nilai Sekolah: ${summary.value.averageScore.toFixed(1)}`, 14, 55);
  
  if (teacherCoverage.value) {
    doc.text(`Cakupan Guru: ${teacherCoverage.value.supervised} dari ${teacherCoverage.value.total} guru sudah disupervisi`, 14, 61);
  }

  let finalY = 71;

  // By Instrument
  if (byInstrument.value.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Rata-Rata Nilai per Instrumen', 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Nama Instrumen', 'Digunakan', 'Rata-Rata Nilai']],
      body: byInstrument.value.map((i: any) => [
        i.name, `${i.total}x`, i.averageScore.toFixed(1)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
    finalY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Detail Table
  if (filteredData.value.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Rincian Data Supervisi', 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Tanggal', 'Guru', 'Penilai', 'Instrumen', 'Nilai', 'Status']],
      body: filteredData.value.map((r: any) => [
        r.supervisionDate ? formatDate(r.supervisionDate) : '-',
        `${r.teacherName}\nNIP: ${r.teacherNip}`,
        r.supervisorName,
        r.instrumentName,
        r.finalScore || '-',
        r.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  }

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};

const getReflectionSeverity = (status: string) => {
  if (status === 'SUDAH_DIISI') return 'success';
  return 'secondary';
};

const getReflectionLabel = (status: string) => {
  if (status === 'SUDAH_DIISI') return 'Sudah Diisi';
  return 'Belum Diisi';
};
</script>

<template>
  <div class="flex flex-col gap-6 relative print:bg-white print:m-0 print:p-0">
    <div class="no-print">
      <BasePageHeader 
        title="Laporan Rekap Supervisi" 
        subtitle="Agregasi dan ringkasan pelaksanaan supervisi akademik beserta status kelengkapan guru."
        icon="pi pi-chart-pie"
      >
        <template #actions>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span class="text-sm text-slate-600 font-semibold">Periode:</span>
              <Dropdown 
                v-model="selectedPeriod" 
                :options="periodStore.periods" 
                optionLabel="name" 
                placeholder="Pilih Periode" 
                class="w-48 !border-none !shadow-none"
                :loading="periodStore.loading"
              />
            </div>
            <Button 
              icon="pi pi-print" 
              label="Cetak / PDF" 
              severity="secondary" 
              class="bg-white !text-slate-700 !border-slate-200 hover:!bg-slate-50 shadow-sm rounded-xl px-4 py-2"
              @click="handlePrint"
              :disabled="reportStore.loading || !summary"
            />
          </div>
        </template>
      </BasePageHeader>
    </div>

    <!-- Loading State -->
    <div v-if="reportStore.loading" class="flex flex-col items-center justify-center p-12 text-slate-500">
      <i class="pi pi-spin pi-spinner text-4xl mb-4 text-blue-500"></i>
      <p class="font-medium">Menghitung rekapitulasi data...</p>
    </div>

    <div v-else-if="summary" class="space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Bagian Kiri (50%) -->
        <div class="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          <!-- Baris Atas Kiri: Total Supervisi (25%) & Rata-rata Nilai (25%) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Total Supervisi -->
            <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white">
              <template #title>
                <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                  <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <i class="pi pi-folder-open text-lg"></i>
                  </div>
                  <span class="font-bold text-base">Total Supervisi</span>
                </div>
              </template>
              <template #content>
                <div class="flex items-center justify-between mb-4 mt-2">
                  <div class="text-5xl font-black text-slate-800">{{ summary.totalSupervisions }}</div>
                  <div class="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">Kegiatan</div>
                </div>
                <!-- Ubah grid menjadi 2x2 agar muat di card yang lebih sempit -->
                <div class="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                  <div class="bg-emerald-50 text-emerald-700 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span class="text-lg font-bold">{{ summary.totalCompleted }}</span>
                    <span>Selesai</span>
                  </div>
                  <div class="bg-blue-50 text-blue-700 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span class="text-lg font-bold">{{ summary.totalScheduled }}</span>
                    <span>Terjadwal</span>
                  </div>
                  <div class="bg-orange-50 text-orange-700 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span class="text-lg font-bold">{{ summary.totalDraft }}</span>
                    <span>Draft</span>
                  </div>
                  <div class="bg-red-50 text-red-700 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span class="text-lg font-bold">{{ summary.totalCancelled }}</span>
                    <span>Batal</span>
                  </div>
                </div>
              </template>
            </Card>

            <!-- Rata-rata Nilai Sekolah -->
            <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white">
              <template #title>
                <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                  <div class="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <i class="pi pi-star-fill text-lg"></i>
                  </div>
                  <span class="font-bold text-base">Rata-Rata Nilai</span>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col items-center justify-center py-4 h-full">
                  <div class="text-6xl font-black" :class="summary.averageScore >= 91 ? 'text-emerald-500' : (summary.averageScore >= 81 ? 'text-blue-500' : 'text-orange-500')">
                    {{ summary.averageScore.toFixed(1) }}
                  </div>
                  <div class="text-slate-500 font-medium mt-2">Skala 0 - 100</div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Baris Bawah Kiri: Cakupan Guru -->
          <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white flex-1" v-if="teacherCoverage">
            <template #title>
              <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                <div class="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <i class="pi pi-users text-lg"></i>
                </div>
                <span class="font-bold text-base">Cakupan Guru</span>
              </div>
            </template>
            <template #content>
              <div class="mt-2">
                <div class="flex justify-between items-end mb-2">
                  <div class="text-3xl font-bold text-slate-800">{{ teacherCoverage.supervised }} <span class="text-sm font-medium text-slate-500">/ {{ teacherCoverage.total }}</span></div>
                  <div class="text-lg font-bold text-purple-600">{{ teacherCoverage.total > 0 ? Math.round((teacherCoverage.supervised / teacherCoverage.total) * 100) : 0 }}%</div>
                </div>
                <ProgressBar :value="teacherCoverage.total > 0 ? Math.round((teacherCoverage.supervised / teacherCoverage.total) * 100) : 0" :showValue="false" class="h-3" />
                
                <div class="mt-4 flex justify-around">
                  <div class="text-center">
                    <div class="text-xl font-bold text-emerald-600">{{ teacherCoverage.supervised }}</div>
                    <div class="text-[10px] font-semibold text-slate-500 uppercase">Sudah Disupervisi</div>
                  </div>
                  <div class="w-px bg-slate-200"></div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-red-500">{{ teacherCoverage.unsupervised }}</div>
                    <div class="text-[10px] font-semibold text-slate-500 uppercase">Belum Disupervisi</div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Bagian Kanan (50%) -->
        <div class="col-span-1 lg:col-span-2 flex flex-col h-full">
          <!-- Rata-rata per Instrumen -->
          <Card class="!rounded-2xl shadow-md border-none overflow-hidden bg-white h-full flex-1">
            <template #title>
              <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                <div class="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <i class="pi pi-list text-lg"></i>
                </div>
                <span class="font-bold text-base">Rata-Rata Nilai per Instrumen</span>
              </div>
            </template>
            <template #content>
              <DataTable :value="byInstrument" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
                <Column field="name" header="Nama Instrumen">
                  <template #body="{ data }">
                    <span class="font-medium text-slate-700">{{ data.name }}</span>
                  </template>
                </Column>
                <Column field="total" header="Digunakan" style="width: 100px; text-align: center;">
                  <template #body="{ data }">
                    <span class="text-slate-600 font-semibold">{{ data.total }}x</span>
                  </template>
                </Column>
                <Column field="averageScore" header="Rata-Rata" style="width: 100px;">
                  <template #body="{ data }">
                    <span class="font-bold" :class="data.averageScore >= 91 ? 'text-emerald-600' : 'text-blue-600'">{{ data.averageScore.toFixed(1) }}</span>
                  </template>
                </Column>
                <template #empty>
                  <div class="text-center p-4 text-slate-500">Tidak ada data instrumen.</div>
                </template>
              </DataTable>
            </template>
          </Card>
        </div>
      </div>

      <!-- Bottom Row: Detail Table -->
      <Card class="!rounded-2xl shadow-md border-none overflow-hidden bg-white">
        <template #title>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3 text-slate-800">
              <i class="pi pi-table text-slate-600 text-xl"></i>
              <span class="font-bold text-lg">Rincian Data Supervisi</span>
            </div>
            <div class="no-print">
              <span class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <InputText v-model="searchQuery" placeholder="Cari Guru / Penilai..." class="pl-10 !rounded-full !bg-slate-50 border-slate-200" />
              </span>
            </div>
          </div>
        </template>
        <template #content>
          <div class="border border-slate-200 rounded-xl mt-2 overflow-hidden">
            <DataTable :value="filteredData" responsiveLayout="scroll" :paginator="true" :rows="10" 
                       class="p-datatable-sm w-full" 
                       stripedRows rowHover>
              <Column field="supervisionDate" header="Tanggal" sortable style="width: 120px;">
                <template #body="{ data }">
                  <span class="text-slate-600 font-medium">{{ data.supervisionDate ? formatDate(data.supervisionDate) : '-' }}</span>
                </template>
              </Column>
              <Column field="teacherName" header="Guru" sortable>
                <template #body="{ data }">
                  <div class="font-bold text-slate-800">{{ data.teacherName }}</div>
                  <div class="text-xs text-slate-500">{{ data.teacherNip }}</div>
                </template>
              </Column>
              <Column field="supervisorName" header="Penilai" sortable>
                <template #body="{ data }">
                  <span class="text-slate-600">{{ data.supervisorName }}</span>
                </template>
              </Column>
              <Column field="instrumentName" header="Instrumen" sortable>
                <template #body="{ data }">
                  <span class="text-slate-600 truncate block max-w-[150px]" :title="data.instrumentName">{{ data.instrumentName }}</span>
                </template>
              </Column>
              <Column field="finalScore" header="Nilai" sortable style="width: 90px; text-align: center;">
                <template #body="{ data }">
                  <div class="font-black text-lg" :class="data.finalScore >= 91 ? 'text-emerald-600' : (data.finalScore >= 81 ? 'text-blue-600' : (data.finalScore >= 71 ? 'text-orange-500' : 'text-red-500'))">
                    {{ data.finalScore || '-' }}
                  </div>
                </template>
              </Column>
              <Column field="status" header="Status" sortable style="width: 120px;">
                <template #body="{ data }">
                  <BaseStatusTag :status="data.status" />
                </template>
              </Column>
              <Column field="reflectionStatus" header="Refleksi" sortable style="width: 120px;">
                <template #body="{ data }">
                  <Tag :value="getReflectionLabel(data.reflectionStatus)" :severity="getReflectionSeverity(data.reflectionStatus)" rounded />
                </template>
              </Column>
              <Column header="Aksi" style="width: 60px; text-align: center;">
                <template #body="{ data }">
                  <Button 
                    icon="pi pi-eye" 
                    severity="info" 
                    text rounded 
                    aria-label="Detail"
                    @click="router.push(`/reports/supervision/${data.id}`)"
                  />
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-10 text-slate-500">
                  <i class="pi pi-inbox text-4xl mb-3 text-slate-300"></i>
                  <p class="font-medium">Tidak ada data rekapitulasi ditemukan.</p>
                </div>
              </template>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
