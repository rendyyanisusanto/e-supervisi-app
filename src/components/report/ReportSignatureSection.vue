<script setup lang="ts">
import { computed } from 'vue';
import type { SchoolProfile } from '../../types/schoolProfile';
import type { ReportSettings } from '../../types/reportSetting';

const props = defineProps<{
  profile: SchoolProfile | null;
  settings: ReportSettings | null;
  supervisorName?: string;
}>();

const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const city = computed(() => props.profile?.city || 'Malang');

const showSupervisor = computed(() => props.settings?.showSupervisorSignature !== false);
const showCurriculum = computed(() => props.settings?.showCurriculumSignature !== false);
const showPrincipal = computed(() => props.settings?.showPrincipalSignature !== false);
</script>

<template>
  <div class="mt-12 pt-6">
    <div class="text-right mb-8 text-slate-800 print:text-black">{{ city }}, {{ currentDate }}</div>
    
    <div class="grid grid-cols-3 gap-4 text-center text-slate-800 print:text-black">
      <div v-if="showSupervisor">
        <p class="mb-16">Penilai / Supervisor,</p>
        <p class="font-bold underline">{{ supervisorName || '_________________________' }}</p>
      </div>
      <div v-else></div>

      <div v-if="showCurriculum">
        <p class="mb-16">Waka Kurikulum,</p>
        <p class="font-bold underline">{{ profile?.curriculumName || '_________________________' }}</p>
        <p class="text-xs">NIP. {{ profile?.curriculumNip || '-' }}</p>
      </div>
      <div v-else></div>

      <div v-if="showPrincipal">
        <p class="mb-16">Kepala Sekolah,</p>
        <p class="font-bold underline">{{ profile?.principalName || '_________________________' }}</p>
        <p class="text-xs">NIP. {{ profile?.principalNip || '-' }}</p>
      </div>
      <div v-else></div>
    </div>
  </div>
</template>
