<script setup lang="ts">
import type { TeacherReflection } from '../../types/reflection';
import ReflectionStatusTag from './ReflectionStatusTag.vue';

defineProps<{
  reflection: TeacherReflection;
}>();
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <div class="flex justify-between items-start mb-4">
      <h3 class="font-bold text-lg text-slate-800">Refleksi Guru</h3>
      <ReflectionStatusTag :status="reflection.status" />
    </div>

    <div v-if="reflection.status !== 'BELUM_DIISI'" class="space-y-4">
      <div>
        <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kekuatan & Hal Positif</h4>
        <p class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{{ reflection.strengthReflection || '-' }}</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kendala yang Dialami</h4>
        <p class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{{ reflection.obstacleReflection || '-' }}</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rencana Perbaikan</h4>
        <p class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{{ reflection.improvementPlan || '-' }}</p>
      </div>
      <div v-if="reflection.supportNeeded">
        <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dukungan yang Dibutuhkan</h4>
        <p class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{{ reflection.supportNeeded }}</p>
      </div>
      <div v-if="reflection.targetDate" class="pt-2 border-t border-slate-100 flex justify-between items-center">
        <span class="text-xs font-semibold text-slate-500">Target Waktu Perbaikan:</span>
        <span class="text-sm font-medium text-blue-600"><i class="pi pi-calendar mr-1 text-xs"></i> {{ reflection.targetDate }}</span>
      </div>
    </div>
    
    <div v-else class="text-center py-6">
      <i class="pi pi-inbox text-4xl text-slate-300 mb-3 block"></i>
      <p class="text-slate-500">Refleksi belum diisi oleh guru.</p>
    </div>
  </div>
</template>
