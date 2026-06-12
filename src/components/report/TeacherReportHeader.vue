<script setup lang="ts">
import type { Teacher } from '../../types/teacher';

defineProps<{
  teacher: Teacher;
  periodName: string;
}>();
</script>

<template>
  <div class="border-b-2 border-slate-800 pb-6 mb-8 print:border-b-4 print:pb-4 print:mb-6">
    <div class="flex items-center gap-6">
      <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
        <i class="pi pi-building text-4xl text-blue-600"></i>
      </div>
      <div class="flex-1">
        <h1 class="text-2xl font-bold uppercase tracking-wider text-slate-800">Rapor Supervisi Guru</h1>
        <h2 class="text-lg font-semibold text-slate-600 mt-1">SMK Negeri 1 Contoh</h2>
        <p class="text-slate-500 mt-1">Periode Penilaian: {{ periodName }}</p>
      </div>
      <div class="text-right border-l-2 border-slate-200 pl-6 no-print">
        <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status Dokumen</div>
        <div class="text-sm font-bold text-green-600 mt-1"><i class="pi pi-check-circle mr-1"></i> FINAL</div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl print:bg-transparent print:p-0 print:gap-2">
      <div class="flex">
        <div class="w-32 text-slate-500 font-semibold">Nama Guru</div>
        <div class="flex-1 font-bold text-slate-800">: {{ teacher.name }}</div>
      </div>
      <div class="flex">
        <div class="w-32 text-slate-500 font-semibold">NIP / NUPTK</div>
        <div class="flex-1 font-bold text-slate-800">: {{ teacher.nip || '-' }}</div>
      </div>
      <div class="flex items-center gap-2">
        <i class="pi pi-book text-slate-400"></i>
        <span class="text-slate-600 w-24">Mapel</span>
        <span class="font-medium text-slate-800">: {{ teacher.mainSubjectId || '-' }}</span>
      </div>
      <div class="flex">
        <div class="w-32 text-slate-500 font-semibold">Tugas Tambahan</div>
        <div class="flex-1 font-bold text-slate-800">: {{ teacher.position || '-' }}</div>
      </div>
    </div>
  </div>
</template>
