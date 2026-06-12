<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    :header="title || 'Konfirmasi'" 
    :modal="true" 
    :style="{ width: '450px' }"
    :breakpoints="{ '575px': '90vw' }"
    :closable="!loading"
    :draggable="false"
  >
    <div class="flex items-start gap-4 py-4">
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        :class="severity === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'"
      >
        <i class="pi text-xl" :class="icon || 'pi-exclamation-triangle'"></i>
      </div>
      <div>
        <p class="text-gray-800 m-0">{{ message }}</p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          text 
          severity="secondary" 
          @click="onCancel" 
          :disabled="loading" 
        />
        <Button 
          :label="confirmLabel || 'Ya, Lanjutkan'" 
          :icon="confirmIcon || 'pi-check'" 
          :severity="severity" 
          @click="onConfirm" 
          :loading="loading" 
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

defineProps<{
  visible: boolean;
  message: string;
  title?: string;
  icon?: string;
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  confirmLabel?: string;
  confirmIcon?: string;
  loading?: boolean;
}>();

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};
</script>
