<script setup lang="ts">
import Breadcrumb from 'primevue/breadcrumb';

defineProps<{
  title: string;
  subtitle?: string;
  breadcrumbs?: any[];
}>();
</script>

<template>
  <div class="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
    <div>
      <Breadcrumb v-if="breadcrumbs && breadcrumbs.length" :model="breadcrumbs" class="!bg-transparent !p-0 !border-none mb-2 text-sm" />
      <h1 class="text-2xl font-bold text-slate-800">{{ title }}</h1>
      <p v-if="subtitle" class="text-slate-500 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style>
/* Override primevue breadcrumb separator */
.p-breadcrumb ul li.p-breadcrumb-chevron {
  color: #94a3b8;
  font-size: 0.75rem;
}
</style>
