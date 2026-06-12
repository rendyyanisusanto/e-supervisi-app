<script setup lang="ts">
import { computed } from 'vue';
import type { SchoolProfile } from '../../types/schoolProfile';
import type { ReportSettings } from '../../types/reportSetting';

const props = defineProps<{
  profile: SchoolProfile | null;
  settings: ReportSettings | null;
}>();

const headerStyle = computed(() => props.settings?.headerStyle || 'FORMAL');
const showLogo = computed(() => props.settings?.showLogo !== false);
const showAddress = computed(() => props.settings?.showSchoolAddress !== false);
</script>

<template>
  <div class="flex items-center gap-6 mb-6" :class="{
    'border-b-2 border-black pb-4': headerStyle === 'FORMAL',
    'border-b border-slate-300 pb-4': headerStyle === 'MODERN' || headerStyle === 'SIMPLE',
    'justify-center text-center': headerStyle === 'SIMPLE',
    'items-start': headerStyle !== 'SIMPLE'
  }">
    <div v-if="showLogo && headerStyle !== 'SIMPLE'" class="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-slate-300 print:border-black overflow-hidden">
      <img v-if="profile?.logo" :src="profile.logo" alt="Logo" class="w-full h-full object-cover" />
      <i v-else class="pi pi-image text-slate-400 text-2xl print:hidden"></i>
    </div>
    
    <div :class="{'text-center w-full': headerStyle === 'SIMPLE', 'text-center flex-1': headerStyle === 'FORMAL'}">
      <h1 class="font-bold text-xl uppercase tracking-wider print:text-black" :class="{'text-2xl': headerStyle === 'FORMAL'}">
        {{ profile?.name || 'SMK IT ASY-SYADZILI' }}
      </h1>
      <p v-if="showAddress" class="text-xs text-slate-600 print:text-black mt-1 max-w-md mx-auto">
        {{ profile?.address || 'Jl. Pesantren No. 1, Sumberpasir, Pakis, Malang' }} • Telp: {{ profile?.phone || '-' }} <br/>
        Email: {{ profile?.email || '-' }} • Web: {{ profile?.website || '-' }}
      </p>
    </div>
    
    <!-- Right side empty space for balance in FORMAL style -->
    <div v-if="showLogo && headerStyle === 'FORMAL'" class="w-20 h-20 opacity-0 hidden md:block"></div>
  </div>
</template>
