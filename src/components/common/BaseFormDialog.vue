<template>
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    :header="title" 
    :modal="true" 
    :style="{ width: width || '500px' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :draggable="false"
  >
    <div class="py-4">
      <p v-if="description" class="text-sm text-gray-500 mb-6">{{ description }}</p>
      
      <form @submit.prevent="onSubmit" class="space-y-4">
        <slot></slot>
      </form>
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
          :label="submitLabel || 'Simpan'" 
          icon="pi pi-check" 
          @click="onSubmit" 
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
  title: string;
  description?: string;
  width?: string;
  submitLabel?: string;
  loading?: boolean;
}>();

const emit = defineEmits(['update:visible', 'submit', 'cancel']);

const onSubmit = () => {
  emit('submit');
};

const onCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};
</script>
