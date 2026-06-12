<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-8">
    <div class="mb-4 pb-2 border-b border-slate-200">
      <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
      <p v-if="description" class="text-sm text-slate-500 mt-1">{{ description }}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <slot></slot>
    </div>
  </div>
</template>
