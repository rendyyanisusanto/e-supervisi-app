<script setup lang="ts">
import Tag from 'primevue/tag';
import { computed } from 'vue';

const props = defineProps<{
  status: string;
}>();

const severity = computed(() => {
  switch (props.status?.toUpperCase()) {
    case 'SELESAI': return 'success';
    case 'TERJADWAL': return 'info';
    case 'DRAFT': return 'warning';
    case 'DIBATALKAN': return 'danger';
    default: return 'secondary';
  }
});
</script>

<template>
  <Tag :value="status" :severity="severity" class="font-medium text-xs px-2 py-1" />
</template>
