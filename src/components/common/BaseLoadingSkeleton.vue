<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

withDefaults(defineProps<{
  type?: 'table' | 'form' | 'card';
  rows?: number;
}>(), {
  type: 'table',
  rows: 5
});
</script>

<template>
  <div v-if="type === 'table'" class="w-full">
    <div class="flex justify-between items-center mb-4">
      <Skeleton width="30%" height="2rem" />
      <Skeleton width="15%" height="2rem" />
    </div>
    <div class="border border-slate-200 rounded-lg overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 p-4 flex gap-4">
        <Skeleton width="5%" height="1.5rem" />
        <Skeleton width="20%" height="1.5rem" />
        <Skeleton width="30%" height="1.5rem" />
        <Skeleton width="25%" height="1.5rem" />
        <Skeleton width="20%" height="1.5rem" />
      </div>
      <div v-for="i in rows" :key="i" class="p-4 flex gap-4 border-b border-slate-100 last:border-0">
        <Skeleton width="5%" height="2rem" />
        <Skeleton width="20%" height="2rem" />
        <Skeleton width="30%" height="2rem" />
        <Skeleton width="25%" height="2rem" />
        <Skeleton width="20%" height="2rem" />
      </div>
    </div>
  </div>

  <div v-else-if="type === 'form'" class="w-full space-y-6">
    <div v-for="i in rows" :key="i" class="space-y-2">
      <Skeleton width="20%" height="1.2rem" />
      <Skeleton width="100%" height="2.5rem" />
    </div>
  </div>

  <div v-else-if="type === 'card'" class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <div v-for="i in rows" :key="i" class="border border-slate-200 rounded-xl p-4">
      <div class="flex gap-4 items-center mb-4">
        <Skeleton shape="circle" size="3rem" />
        <div class="flex-1">
          <Skeleton width="70%" height="1.2rem" class="mb-2" />
          <Skeleton width="40%" height="1rem" />
        </div>
      </div>
      <Skeleton width="100%" height="4rem" />
    </div>
  </div>
</template>
