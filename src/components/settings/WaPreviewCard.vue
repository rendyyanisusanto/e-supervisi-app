<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

// Simple simulation of variables
const simulatedContent = computed(() => {
  if (!props.content) return 'Belum ada konten pesan.';
  
  return props.content
    .replace(/{nama_guru}/g, 'Budi Santoso')
    .replace(/{nama_penilai}/g, 'Rendy Yani')
    .replace(/{nama_instrumen}/g, 'Pelaksanaan Pembelajaran')
    .replace(/{tanggal}/g, '10 Juni 2026')
    .replace(/{jam}/g, '08:00')
    .replace(/{periode}/g, 'Ganjil 2026/2027')
    .replace(/{nilai}/g, '88.5')
    .replace(/{status}/g, 'Baik')
    .replace(/{target_tanggal}/g, '15 Juni 2026')
    .replace(/{nama_sekolah}/g, 'SMK IT Asy-Syadzili')
    .replace(/{link}/g, 'http://localhost:5173/supervisi/SUP-001');
});
</script>

<template>
  <div class="bg-[#e5ddd5] p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden min-h-[300px]">
    <!-- WA Background Pattern Simulation -->
    <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
    
    <div class="relative z-10 flex flex-col gap-4 max-w-sm mx-auto h-full justify-center">
      <!-- Sender Bubble -->
      <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-800 self-start relative max-w-[90%]">
        <p class="whitespace-pre-wrap leading-relaxed">{{ simulatedContent }}</p>
        <span class="text-[10px] text-slate-400 absolute right-2 bottom-1">08:00</span>
      </div>
    </div>
  </div>
</template>
