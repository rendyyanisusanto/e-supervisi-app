<script setup lang="ts">
import { computed } from 'vue';
import type { SchoolProfile } from '../../types/schoolProfile';
import type { ReportSettings } from '../../types/reportSetting';

const props = defineProps<{
  profile: SchoolProfile | null;
  settings: ReportSettings | null;
}>();

const footerText = computed(() => {
  return props.settings?.footerText || props.profile?.reportFooter || 'Dicetak dari Sistem E-Supervisi SMK';
});
</script>

<template>
  <div class="mt-8 pt-4 border-t border-slate-200 print:border-black text-xs text-slate-500 print:text-black text-center flex justify-between items-center">
    <span>{{ footerText }}</span>
    <div v-if="settings?.useQrValidation" class="w-8 h-8 bg-slate-200 print:bg-white print:border print:border-black flex items-center justify-center">
      <i class="pi pi-qrcode text-slate-600 print:text-black"></i>
    </div>
  </div>
</template>
