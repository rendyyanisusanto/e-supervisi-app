<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReportStore } from '../../stores/reportStore';
import { usePeriodStore } from '../../stores/periodStore';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import BaseStatusTag from '../../components/common/BaseStatusTag.vue';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { formatDate } from '../../utils/formatDate';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const router = useRouter();
const reportStore = useReportStore();
const periodStore = usePeriodStore();

const selectedPeriod = ref<any>(null);

onMounted(async () => {
  await periodStore.fetchPeriods();
  const activePeriod = periodStore.periods.find(p => p.isActive);
  if (activePeriod) {
    selectedPeriod.value = activePeriod;
    reportStore.fetchBasicSummary(activePeriod.id);
  } else if (periodStore.periods.length > 0) {
    selectedPeriod.value = periodStore.periods[0];
    reportStore.fetchBasicSummary(periodStore.periods[0].id);
  }
});

watch(selectedPeriod, (newVal) => {
  if (newVal) {
    reportStore.fetchBasicSummary(newVal.id);
  }
});

const summary = computed(() => reportStore.currentBasicSummary);
const supervisionsData = computed(() => summary.value?.tableData || []);
const monthlyRecapData = computed(() => summary.value?.monthlyRecap || []);

const handlePrint = () => {
  if (!summary.value) return;
  
  const doc = new jsPDF('p', 'mm', 'a4');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('LAPORAN SUPERVISI AKADEMIK', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${selectedPeriod.value?.name || '-'}`, 14, 28);
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Statistik Pelaksanaan', 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  
  doc.text(`Total Guru: ${summary.value.teachers.total} (Aktif: ${summary.value.teachers.active})`, 14, 49);
  doc.text(`Supervisi Selesai: ${summary.value.supervisions.completed}`, 14, 55);
  doc.text(`Supervisi Terjadwal: ${summary.value.supervisions.scheduled}`, 80, 55);
  doc.text(`Supervisi Draft: ${summary.value.supervisions.draft}`, 146, 55);
  doc.text(`Rata-rata Nilai: ${summary.value.supervisions.averageScore.toFixed(1)}`, 14, 61);

  doc.text(`Kinerja Sangat Baik: ${summary.value.performance.sangatBaik}`, 14, 67);
  doc.text(`Baik: ${summary.value.performance.baik}`, 80, 67);
  doc.text(`Cukup: ${summary.value.performance.cukup}`, 120, 67);
  doc.text(`Kurang: ${summary.value.performance.kurang}`, 160, 67);

  let finalY = 77;

  if (monthlyRecapData.value.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Rekapitulasi Bulanan', 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Bulan', 'Total', 'Selesai', 'Terjadwal', 'Draft', 'Rata-rata', 'SB', 'B', 'C', 'K']],
      body: monthlyRecapData.value.map((r: any) => [
        r.month, r.total_supervisions, r.completed, r.scheduled, r.draft, r.average_score,
        r.sangat_baik, r.baik, r.cukup, r.kurang
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
    finalY = (doc as any).lastAutoTable.finalY + 12;
  }

  if (supervisionsData.value.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Detail Data Supervisi', 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Tanggal', 'Guru', 'Penilai', 'Nilai', 'Kriteria', 'Status']],
      body: supervisionsData.value.map((r: any) => [
        r.supervision_date ? formatDate(r.supervision_date) : '-',
        r.teacher_name,
        r.supervisor_name,
        r.final_score || '-',
        r.kriteria || '-',
        r.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl, '_blank');
  
  if (!printWindow) {
    doc.save(`Laporan_Dasar_Supervisi.pdf`);
  }
};
</script>

<template>
  <div>
    <BasePageHeader 
      title="Laporan Dasar" 
      subtitle="Ringkasan eksekutif pelaksanaan supervisi."
      icon="pi pi-chart-bar"
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
            label="Cetak Laporan" 
            severity="primary" 
            class="!rounded-xl px-4 py-2 shadow-sm"
            @click="handlePrint"
            :disabled="!summary || reportStore.loading"
          />
        </div>
      </template>
    </BasePageHeader>

    <div v-if="reportStore.loading" class="flex flex-col items-center justify-center p-12 text-slate-500">
      <i class="pi pi-spin pi-spinner text-4xl mb-4 text-blue-500"></i>
      <p class="font-medium">Menganalisis & memuat data...</p>
    </div>

    <div v-else-if="summary" class="space-y-6">
      
      <!-- Layout Atas: 50% Statistik, 50% Rekap Bulanan -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <!-- KOLOM KIRI (50%): Kumpulan Card Statistik -->
        <div class="flex flex-col gap-4">
          
          <!-- Card Utama: Data Guru -->
          <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white h-full">
            <template #title>
              <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <i class="pi pi-users text-lg"></i>
                </div>
                <span class="font-bold text-base">Data Guru</span>
              </div>
            </template>
            <template #content>
              <div class="flex justify-around items-center pt-3 pb-1">
                <div class="text-center">
                  <div class="text-slate-500 font-medium text-xs mb-1 uppercase tracking-widest">Total Guru</div>
                  <div class="text-4xl font-bold text-slate-800">{{ summary.teachers.total }}</div>
                </div>
                <div class="w-px h-12 bg-slate-200"></div>
                <div class="text-center">
                  <div class="text-slate-500 font-medium text-xs mb-1 uppercase tracking-widest">Guru Aktif</div>
                  <div class="text-4xl font-bold text-blue-600">{{ summary.teachers.active }}</div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Row 2 di kolom kiri: Pelaksanaan & Kinerja -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            <!-- Card Pelaksanaan Supervisi -->
            <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white">
              <template #title>
                <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                  <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <i class="pi pi-file-check text-lg"></i>
                  </div>
                  <span class="font-bold text-base">Pelaksanaan</span>
                </div>
              </template>
              <template #content>
                <div class="space-y-4 pt-1">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500 font-medium">Selesai</span>
                    <span class="font-bold text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{{ summary.supervisions.completed }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500 font-medium">Belum</span>
                    <span class="font-bold text-xl text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">{{ summary.supervisions.scheduled + summary.supervisions.draft }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span class="text-slate-700 font-bold">Rata-rata Nilai</span>
                    <span class="font-black text-2xl text-blue-600">{{ summary.supervisions.averageScore.toFixed(1) }}</span>
                  </div>
                </div>
              </template>
            </Card>

            <!-- Card Kategori Kinerja -->
            <Card class="!rounded-2xl border-none shadow-md overflow-hidden bg-white">
              <template #title>
                <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
                  <div class="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <i class="pi pi-chart-pie text-lg"></i>
                  </div>
                  <span class="font-bold text-base">Kategori Kinerja</span>
                </div>
              </template>
              <template #content>
                <div class="grid grid-cols-2 gap-3 pt-1">
                  <div class="text-center bg-green-50 rounded-xl p-3 border border-green-100">
                    <div class="text-green-700 text-[10px] font-bold mb-1 uppercase">Sangat Baik</div>
                    <div class="font-black text-2xl text-green-600">{{ summary.performance.sangatBaik }}</div>
                  </div>
                  <div class="text-center bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div class="text-blue-700 text-[10px] font-bold mb-1 uppercase">Baik</div>
                    <div class="font-black text-2xl text-blue-600">{{ summary.performance.baik }}</div>
                  </div>
                  <div class="text-center bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <div class="text-orange-700 text-[10px] font-bold mb-1 uppercase">Cukup</div>
                    <div class="font-black text-2xl text-orange-500">{{ summary.performance.cukup }}</div>
                  </div>
                  <div class="text-center bg-red-50 rounded-xl p-3 border border-red-100">
                    <div class="text-red-700 text-[10px] font-bold mb-1 uppercase">Kurang</div>
                    <div class="font-black text-2xl text-red-600">{{ summary.performance.kurang }}</div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- KOLOM KANAN (50%): Rekapitulasi per Bulan -->
        <Card class="!rounded-2xl shadow-md border-none overflow-hidden bg-white h-full flex flex-col">
          <template #title>
            <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
              <div class="bg-amber-100 p-2 rounded-lg text-amber-600">
                <i class="pi pi-calendar text-xl"></i>
              </div>
              <span class="font-bold text-lg">Rekapitulasi Bulanan</span>
            </div>
          </template>
          <template #content>
            <div class="flex-1 overflow-hidden mt-2 border border-slate-200 rounded-xl">
              <DataTable :value="monthlyRecapData" responsiveLayout="scroll" 
                         class="p-datatable-sm w-full" 
                         stripedRows rowHover>
                <Column field="month" header="Bulan" class="font-semibold text-slate-800 whitespace-nowrap" />
                <Column field="total_supervisions" header="Total">
                  <template #body="{ data }">
                    <span class="font-bold text-slate-700">{{ data.total_supervisions }}</span>
                  </template>
                </Column>
                <Column field="completed" header="Selesai">
                  <template #body="{ data }">
                    <span class="font-bold text-emerald-600">{{ data.completed }}</span>
                  </template>
                </Column>
                <Column field="scheduled" header="Terjadwal">
                  <template #body="{ data }">
                    <span class="font-bold text-blue-600">{{ data.scheduled }}</span>
                  </template>
                </Column>
                <Column field="draft" header="Draft">
                  <template #body="{ data }">
                    <span class="font-bold text-orange-500">{{ data.draft }}</span>
                  </template>
                </Column>
                <Column field="average_score" header="Rata-rata">
                  <template #body="{ data }">
                    <span class="font-black text-blue-600">{{ data.average_score }}</span>
                  </template>
                </Column>
                <Column field="sangat_baik" header="SB">
                  <template #body="{ data }">
                    <span class="font-semibold text-green-600">{{ data.sangat_baik }}</span>
                  </template>
                </Column>
                <Column field="baik" header="B">
                  <template #body="{ data }">
                    <span class="font-semibold text-blue-500">{{ data.baik }}</span>
                  </template>
                </Column>
                <Column field="cukup" header="C">
                  <template #body="{ data }">
                    <span class="font-semibold text-orange-400">{{ data.cukup }}</span>
                  </template>
                </Column>
                <Column field="kurang" header="K">
                  <template #body="{ data }">
                    <span :class="data.kurang > 0 ? 'text-red-600 font-bold' : 'text-slate-400'">{{ data.kurang }}</span>
                  </template>
                </Column>
                <template #empty>
                  <div class="text-center py-10 text-slate-500">
                    <i class="pi pi-inbox text-4xl mb-3 text-slate-300"></i>
                    <p class="font-medium">Tidak ada data rekapitulasi.</p>
                  </div>
                </template>
              </DataTable>
            </div>
            <div class="mt-3 flex gap-3 text-[10px] text-slate-500 justify-end font-medium">
              <span>*SB = Sangat Baik</span>
              <span>*B = Baik</span>
              <span>*C = Cukup</span>
              <span>*K = Kurang</span>
            </div>
          </template>
        </Card>
      </div>

      <!-- Layout Bawah (Full Width): Data Supervisi -->
      <Card class="!rounded-2xl shadow-md border-none overflow-hidden bg-white">
        <template #title>
          <div class="flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-3">
            <div class="bg-rose-100 p-2 rounded-lg text-rose-600">
              <i class="pi pi-list text-xl"></i>
            </div>
            <span class="font-bold text-lg">Detail Data Supervisi</span>
          </div>
        </template>
        <template #content>
          <div class="border border-slate-200 rounded-xl mt-2 overflow-hidden">
            <DataTable :value="supervisionsData" responsiveLayout="scroll" :paginator="true" :rows="10" 
                       class="p-datatable-sm w-full" 
                       stripedRows rowHover>
              <Column field="supervision_date" header="Tanggal" sortable style="width: 130px;">
                <template #body="{ data }">
                  <span class="text-slate-600 font-medium">{{ data.supervision_date ? formatDate(data.supervision_date) : '-' }}</span>
                </template>
              </Column>
              <Column field="teacher_name" header="Guru" sortable>
                <template #body="{ data }">
                  <div class="font-bold text-slate-800">{{ data.teacher_name }}</div>
                </template>
              </Column>
              <Column field="supervisor_name" header="Penilai" sortable>
                <template #body="{ data }">
                  <span class="text-slate-600">{{ data.supervisor_name }}</span>
                </template>
              </Column>
              <Column field="final_score" header="Nilai" sortable style="width: 100px;">
                <template #body="{ data }">
                  <div class="font-black text-lg" :class="data.final_score >= 91 ? 'text-green-600' : (data.final_score >= 81 ? 'text-blue-600' : (data.final_score >= 71 ? 'text-orange-500' : 'text-red-500'))">
                    {{ data.final_score || '-' }}
                  </div>
                </template>
              </Column>
              <Column field="kriteria" header="Kriteria" sortable style="width: 140px;">
                <template #body="{ data }">
                  <span class="text-sm font-bold tracking-wide" :class="data.final_score >= 91 ? 'text-green-700' : (data.final_score >= 81 ? 'text-blue-700' : (data.final_score >= 71 ? 'text-orange-600' : 'text-red-700'))">
                    {{ data.kriteria }}
                  </span>
                </template>
              </Column>
              <Column field="status" header="Status" sortable style="width: 150px;">
                <template #body="{ data }">
                  <BaseStatusTag :status="data.status" />
                </template>
              </Column>
              <Column header="Aksi" style="width: 80px; text-align: center;">
                <template #body="{ data }">
                  <Button 
                    icon="pi pi-eye" 
                    severity="info" 
                    rounded 
                    aria-label="Detail"
                    v-tooltip="'Lihat Detail'"
                    @click="router.push(`/supervisi/${data.id}/hasil`)" 
                  />
                </template>
              </Column>
              <template #empty>
                <div class="text-center py-12 text-slate-500">
                  <i class="pi pi-folder-open text-5xl mb-4 text-slate-300"></i>
                  <p class="font-medium text-lg">Tidak ada data supervisi untuk periode ini.</p>
                </div>
              </template>
            </DataTable>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
