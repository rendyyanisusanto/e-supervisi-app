<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
}>();

defineEmits(['action']);
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed min-h-[300px]">
    <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
      <i :class="[icon || 'pi pi-folder-open', 'text-2xl']"></i>
    </div>
    <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ title }}</h3>
    <p class="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">{{ description }}</p>
    <Button v-if="actionLabel" :label="actionLabel" @click="$emit('action')" outlined />
    <slot name="action"></slot>
  </div>
</template>
