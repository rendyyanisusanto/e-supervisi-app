<script setup lang="ts">
import type { TeacherReportSummary } from '../../types/teacherReport';

defineProps<{
  summary: TeacherReportSummary;
}>();
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
    <div class="border border-gray-200 rounded-xl p-4 text-center">
      <div class="text-sm text-slate-500 font-semibold mb-1">Rata-rata Nilai</div>
      <div class="text-3xl font-bold text-blue-600">{{ summary.averageScore.toFixed(1) }}</div>
    </div>
    <div class="border border-gray-200 rounded-xl p-4 text-center">
      <div class="text-sm text-slate-500 font-semibold mb-1">Predikat Umum</div>
      <div class="text-xl font-bold text-slate-800 mt-2">{{ summary.generalStatus }}</div>
    </div>
    <div class="border border-gray-200 rounded-xl p-4 text-center">
      <div class="text-sm text-slate-500 font-semibold mb-1">Nilai Tertinggi</div>
      <div class="text-3xl font-bold text-green-600">{{ summary.highestScore.toFixed(1) }}</div>
    </div>
    <div class="border border-gray-200 rounded-xl p-4 text-center">
      <div class="text-sm text-slate-500 font-semibold mb-1">Total Supervisi</div>
      <div class="text-3xl font-bold text-slate-800">{{ summary.totalSupervisions }}</div>
    </div>
  </div>
</template>
