<script setup lang="ts">
import { ref } from 'vue';
import type { WaTemplate } from '../../types/waTemplate';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';

const props = defineProps<{
  template: WaTemplate;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', template: Partial<WaTemplate>): void;
  (e: 'cancel'): void;
  (e: 'test', id: string, variables: any): void;
}>();

const localData = ref<Partial<WaTemplate>>({ ...props.template });

const categories = [
  { label: 'Supervisi', value: 'SUPERVISI' },
  { label: 'Hasil', value: 'HASIL' },
  { label: 'Refleksi', value: 'REFLEKSI' },
  { label: 'Pengingat', value: 'PENGINGAT' }
];

const handleSave = () => {
  emit('save', localData.value);
};

const insertVariable = (variable: string) => {
  localData.value.content = (localData.value.content || '') + `{${variable}}`;
};

defineExpose({ insertVariable });
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-sm font-medium">Nama Template</label>
        <InputText v-model="localData.name" class="w-full" />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Kode Unik</label>
        <InputText v-model="localData.code" class="w-full" :disabled="!isNew" />
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-sm font-medium">Kategori</label>
        <Dropdown v-model="localData.category" :options="categories" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="space-y-1 flex flex-col justify-center pt-5">
        <div class="flex items-center gap-2">
          <InputSwitch v-model="localData.isActive" />
          <label class="text-sm font-medium">Status Aktif</label>
        </div>
      </div>
    </div>

    <div class="space-y-1">
      <label class="text-sm font-medium">Isi Pesan WhatsApp</label>
      <Textarea v-model="localData.content" rows="8" class="w-full font-mono text-sm" />
    </div>

    <div class="flex justify-between items-center pt-4">
      <Button v-if="!isNew" label="Kirim Test" icon="pi pi-send" severity="secondary" outlined size="small" @click="emit('test', localData.id as string, {})" />
      <div v-else></div>
      <div class="flex gap-2">
        <Button label="Batal" severity="secondary" text @click="emit('cancel')" />
        <Button label="Simpan" icon="pi pi-save" @click="handleSave" />
      </div>
    </div>
  </div>
</template>
