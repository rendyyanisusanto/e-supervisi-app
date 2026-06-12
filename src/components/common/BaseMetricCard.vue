<script setup lang="ts">
import Card from 'primevue/card';
import Skeleton from 'primevue/skeleton';

const props = defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  loading?: boolean;
}>();
</script>

<template>
  <Card class="h-full border-none shadow-sm hover:shadow-md transition-shadow">
    <template #content>
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-500 mb-1">{{ title }}</h3>
          
          <Skeleton v-if="loading" width="4rem" height="2rem" class="mb-2" />
          <div v-else class="text-3xl font-bold text-slate-800 mb-1">{{ value }}</div>
          
          <Skeleton v-if="loading" width="8rem" height="1rem" />
          <p v-else-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
        </div>
        
        <div v-if="icon" class="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
          <i :class="[icon, 'text-primary text-xl']"></i>
        </div>
      </div>
    </template>
  </Card>
</template>
