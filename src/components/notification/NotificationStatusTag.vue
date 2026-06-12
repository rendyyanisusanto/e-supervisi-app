<script setup lang="ts">
import type { Notification } from '../../types/notification';

defineProps<{
  type: Notification['type'];
}>();

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'INFO': return 'pi pi-info-circle text-blue-500';
    case 'SUCCESS': return 'pi pi-check-circle text-green-500';
    case 'WARNING': return 'pi pi-exclamation-triangle text-orange-500';
    case 'ERROR': return 'pi pi-times-circle text-red-500';
    default: return 'pi pi-bell text-slate-500';
  }
};
</script>

<template>
  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
       :class="{
         'bg-blue-50': type === 'INFO',
         'bg-green-50': type === 'SUCCESS',
         'bg-orange-50': type === 'WARNING',
         'bg-red-50': type === 'ERROR'
       }">
    <i :class="getIcon(type)"></i>
  </div>
</template>
