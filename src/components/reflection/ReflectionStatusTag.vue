<script setup lang="ts">
import { computed } from 'vue';
import type { ReflectionStatus } from '../../types/reflection';

const props = defineProps<{
  status?: ReflectionStatus | string;
}>();

const config = computed(() => {
  switch (props.status) {
    case 'BELUM_DIISI':
      return { class: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Belum Diisi', icon: 'pi pi-clock' };
    case 'SUDAH_DIISI':
      return { class: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Sudah Diisi', icon: 'pi pi-check' };
    case 'SUDAH_DIBACA':
      return { class: 'bg-green-100 text-green-700 border-green-200', label: 'Sudah Dibaca', icon: 'pi pi-check-circle' };
    default:
      return { class: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Belum Diisi', icon: 'pi pi-clock' };
  }
});
</script>

<template>
  <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
       :class="config.class">
    <i :class="[config.icon, 'mr-1 text-[10px]']"></i>
    {{ config.label }}
  </div>
</template>
