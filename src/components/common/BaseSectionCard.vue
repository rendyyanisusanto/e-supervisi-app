<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
      <slot name="header">
        <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
        <p v-if="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
      </slot>
      <slot name="header-action"></slot>
    </div>
    <div :class="['px-6 py-4', bodyClass]">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  bodyClass?: string;
}>();
</script>
