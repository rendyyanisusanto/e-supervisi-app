<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

defineProps<{
  searchPlaceholder?: string;
  searchValue?: string;
}>();

defineEmits(['update:searchValue']);
</script>

<template>
  <Toolbar class="mb-4 border-none bg-transparent p-0">
    <template #start>
      <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search text-slate-400" />
          <InputText 
            :value="searchValue" 
            @input="$emit('update:searchValue', ($event.target as HTMLInputElement).value)"
            :placeholder="searchPlaceholder || 'Cari...'" 
            class="w-full md:w-64" 
          />
        </IconField>
        <slot name="filters"></slot>
      </div>
    </template>
    <template #end>
      <div class="flex items-center gap-2 mt-3 md:mt-0 w-full md:w-auto justify-end">
        <slot name="actions"></slot>
      </div>
    </template>
  </Toolbar>
</template>
