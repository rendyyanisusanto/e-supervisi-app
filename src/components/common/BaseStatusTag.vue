<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import { getStatusSeverity, getStatusClass } from '../../utils/statusColor';

const props = defineProps<{
  status: string;
}>();

const severity = computed(() => getStatusSeverity(props.status));
const customClass = computed(() => getStatusClass(props.status));
</script>

<template>
  <Tag :value="status" :severity="severity" :class="[customClass, 'font-medium']" rounded></Tag>
</template>
