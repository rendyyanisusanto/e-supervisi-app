<script setup lang="ts">
import { computed } from 'vue';
import type { Supervision } from '../../types/supervision';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';

const props = defineProps<{
  supervision: Supervision;
  isSaving: boolean;
}>();

const emit = defineEmits(['save-draft', 'submit-final', 'preview']);

const totalItems = computed(() => props.supervision.items.length);
const filledItems = computed(() => props.supervision.items.filter(i => i.score !== null).length);
const progressPercent = computed(() => {
  if (totalItems.value === 0) return 0;
  return Math.round((filledItems.value / totalItems.value) * 100);
});

const isComplete = computed(() => filledItems.value === totalItems.value);
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-4">
    <h3 class="font-bold text-lg mb-4 pb-2 border-b">Ringkasan Penilaian</h3>
    
    <div class="flex flex-col gap-5">
      <!-- Progress -->
      <div class="flex flex-col gap-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Progress Pengisian</span>
          <span class="font-bold">{{ filledItems }} / {{ totalItems }} Item</span>
        </div>
        <ProgressBar :value="progressPercent" :showValue="false" style="height: 8px" />
      </div>

      <!-- Skor -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 p-3 rounded-lg text-center">
          <div class="text-xs text-blue-600 font-semibold mb-1">Skor Diperoleh</div>
          <div class="text-2xl font-bold text-blue-800">{{ supervision.totalScore }}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg text-center">
          <div class="text-xs text-gray-600 font-semibold mb-1">Skor Maksimal</div>
          <div class="text-2xl font-bold text-gray-800">{{ supervision.maxScore }}</div>
        </div>
      </div>

      <!-- Nilai Akhir -->
      <div class="bg-gray-800 text-white p-4 rounded-lg text-center shadow-inner">
        <div class="text-sm text-gray-300 mb-1">Nilai Sementara</div>
        <div class="text-4xl font-bold mb-1">{{ supervision.finalScore.toFixed(2) }}</div>
        <div class="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
          {{ supervision.finalStatus || '-' }}
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2 mt-2">
        <Button 
          label="Simpan Draft" 
          icon="pi pi-save" 
          severity="secondary" 
          outlined 
          :loading="isSaving"
          @click="emit('save-draft')" 
        />
        <Button 
          label="Preview & Submit" 
          icon="pi pi-check-circle" 
          :severity="isComplete ? 'primary' : 'warning'"
          @click="emit('preview')" 
        />
        <div v-if="!isComplete" class="text-xs text-orange-500 text-center mt-1">
          <i class="pi pi-info-circle mr-1"></i> Selesaikan semua item sebelum submit final
        </div>
      </div>
    </div>
  </div>
</template>
