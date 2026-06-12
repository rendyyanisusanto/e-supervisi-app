<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{
  title: string;
  description: string;
}>();

defineEmits(['retry']);
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 min-h-[300px]">
    <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
      <i class="pi pi-exclamation-triangle text-2xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ title }}</h3>
    <p class="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">{{ description }}</p>
    <Button label="Coba Lagi" icon="pi pi-refresh" severity="danger" @click="$emit('retry')" outlined />
  </div>
</template>
