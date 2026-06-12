<script setup lang="ts">
import { computed } from 'vue';
import type { ReportSettings } from '../../types/reportSetting';
import type { SchoolProfile } from '../../types/schoolProfile';

const props = defineProps<{
  settings: ReportSettings;
  profile: SchoolProfile | null;
}>();

const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const dummyDocNumber = computed(() => {
  let format = props.settings.documentNumberFormat || '';
  return format
    .replace('{jenis}', 'RPR')
    .replace('{bulan}', 'VI')
    .replace('{tahun}', '2026')
    .replace('{nomor}', '001');
});
</script>

<template>
  <div class="bg-white border shadow-md relative overflow-hidden text-slate-800 text-sm max-w-2xl mx-auto flex flex-col" :class="settings.paperSize === 'F4' ? 'min-h-[800px]' : 'min-h-[700px]'">
    <!-- Watermark -->
    <div v-if="settings.watermarkText" class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
      <div class="text-[8rem] font-bold rotate-[-45deg] whitespace-nowrap">{{ settings.watermarkText }}</div>
    </div>

    <div class="relative z-10 flex flex-col h-full p-8 md:p-10">
      <!-- Header Area -->
      <div class="flex items-center gap-6 mb-6" :class="{
        'border-b-2 border-black pb-4': settings.headerStyle === 'FORMAL',
        'border-b border-slate-300 pb-4': settings.headerStyle === 'MODERN' || settings.headerStyle === 'SIMPLE',
        'justify-center text-center': settings.headerStyle === 'SIMPLE',
        'items-start': settings.headerStyle !== 'SIMPLE'
      }">
        <div v-if="settings.showLogo && settings.headerStyle !== 'SIMPLE'" class="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-slate-300">
          <i class="pi pi-image text-slate-400 text-2xl"></i>
        </div>
        
        <div :class="{'text-center w-full': settings.headerStyle === 'SIMPLE', 'text-center flex-1': settings.headerStyle === 'FORMAL'}">
          <h1 class="font-bold text-xl uppercase tracking-wider" :class="{'text-2xl': settings.headerStyle === 'FORMAL'}">
            {{ profile?.name || 'Nama Sekolah' }}
          </h1>
          <p v-if="settings.showSchoolAddress" class="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            {{ profile?.address || 'Alamat Sekolah' }} • Telp: {{ profile?.phone || '-' }} <br/>
            Email: {{ profile?.email || '-' }} • Web: {{ profile?.website || '-' }}
          </p>
        </div>
        
        <!-- Right side empty space for balance in FORMAL style -->
        <div v-if="settings.showLogo && settings.headerStyle === 'FORMAL'" class="w-20 h-20 opacity-0 hidden md:block"></div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 space-y-4">
        <div class="text-center mb-6">
          <h2 class="font-bold text-lg underline underline-offset-4 mb-1">LAPORAN SUPERVISI AKADEMIK</h2>
          <p class="text-sm font-medium">Nomor: {{ dummyDocNumber }}</p>
        </div>
        
        <div class="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 mb-6">
          <div class="grid grid-cols-[120px_10px_1fr]">
            <span class="font-medium">Nama Guru</span><span>:</span><span>Ahmad Fauzi, S.Pd</span>
            <span class="font-medium">Mata Pelajaran</span><span>:</span><span>Informatika</span>
            <span class="font-medium">Kelas / Semester</span><span>:</span><span>X TKJ / Ganjil</span>
            <span class="font-medium">Nilai Akhir</span><span>:</span><span class="font-bold">88.5 (Baik)</span>
          </div>
        </div>

        <p class="text-justify indent-8">
          Berdasarkan hasil supervisi akademik yang dilaksanakan pada tanggal 10 Juni 2026, guru bersangkutan telah melaksanakan kegiatan pembelajaran dengan baik. Media pembelajaran interaktif digunakan secara optimal untuk memfasilitasi pemahaman siswa.
        </p>
        <p class="text-justify indent-8">
          Terdapat beberapa aspek yang perlu ditingkatkan, antara lain diferensiasi pembelajaran untuk mengakomodasi beragam tingkat kemampuan awal siswa di dalam kelas.
        </p>
      </div>

      <!-- Signatures Area -->
      <div class="mt-12 pt-6">
        <div class="text-right mb-8">Malang, {{ currentDate }}</div>
        
        <div class="grid grid-cols-3 gap-4 text-center">
          <div v-if="settings.showSupervisorSignature">
            <p class="mb-16">Penilai / Supervisor,</p>
            <p class="font-bold underline">Rendy Yani S.</p>
            <p class="text-xs">NIP. 198001012005011001</p>
          </div>
          <div v-else></div>

          <div v-if="settings.showCurriculumSignature">
            <p class="mb-16">Waka Kurikulum,</p>
            <p class="font-bold underline">{{ profile?.curriculumName || 'Nama Waka' }}</p>
            <p class="text-xs">NIP. {{ profile?.curriculumNip || '-' }}</p>
          </div>
          <div v-else></div>

          <div v-if="settings.showPrincipalSignature">
            <p class="mb-16">Kepala Sekolah,</p>
            <p class="font-bold underline">{{ profile?.principalName || 'Nama Kepsek' }}</p>
            <p class="text-xs">NIP. {{ profile?.principalNip || '-' }}</p>
          </div>
          <div v-else></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center flex justify-between items-center">
        <span>{{ settings.footerText || profile?.reportFooter || '' }}</span>
        <div v-if="settings.useQrValidation" class="w-8 h-8 bg-slate-200 flex items-center justify-center">
          <i class="pi pi-qrcode text-slate-600"></i>
        </div>
      </div>
    </div>
  </div>
</template>
