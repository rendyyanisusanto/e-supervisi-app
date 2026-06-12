<script setup lang="ts">
import type { Supervision } from '../../types/supervision';

defineProps<{
  supervisions: Supervision[];
}>();

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const getPredicate = (score: number | null) => {
  if (score === null) return '-';
  if (score < 70) return 'Perlu Pembinaan';
  if (score < 80) return 'Cukup';
  if (score < 90) return 'Baik';
  return 'Sangat Baik';
};
</script>

<template>
  <div class="mb-8">
    <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Rincian Hasil Supervisi</h3>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-100 print:bg-slate-200">
            <th class="p-3 border border-slate-300 font-semibold text-slate-700 text-sm">Tanggal</th>
            <th class="p-3 border border-slate-300 font-semibold text-slate-700 text-sm">Instrumen</th>
            <th class="p-3 border border-slate-300 font-semibold text-slate-700 text-sm">Penilai</th>
            <th class="p-3 border border-slate-300 font-semibold text-slate-700 text-sm text-center">Skor Akhir</th>
            <th class="p-3 border border-slate-300 font-semibold text-slate-700 text-sm">Predikat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in supervisions" :key="s.id" class="hover:bg-slate-50 print:hover:bg-transparent">
            <td class="p-3 border border-slate-300 text-sm">{{ formatDate((s as any).supervisionDate || s.updatedAt) }}</td>
            <td class="p-3 border border-slate-300 text-sm font-medium">{{ (s as any).instrumentName || s.instrumentIds?.join(', ') || '-' }}</td>
            <td class="p-3 border border-slate-300 text-sm">{{ (s as any).supervisorName || 'Penilai' }}</td>
            <td class="p-3 border border-slate-300 text-sm text-center font-bold">{{ s.finalScore?.toFixed(1) || '-' }}</td>
            <td class="p-3 border border-slate-300 text-sm font-semibold"
                :class="{
                  'text-green-600': s.finalScore && s.finalScore >= 90,
                  'text-blue-600': s.finalScore && s.finalScore >= 80 && s.finalScore < 90,
                  'text-orange-500': s.finalScore && s.finalScore >= 70 && s.finalScore < 80,
                  'text-red-600': s.finalScore && s.finalScore < 70
                }">
              {{ getPredicate(s.finalScore) }}
            </td>
          </tr>
          <tr v-if="supervisions.length === 0">
            <td colspan="5" class="p-6 text-center text-slate-500 italic border border-slate-300">
              Belum ada hasil supervisi yang diselesaikan
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
