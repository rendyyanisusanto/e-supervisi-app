<script setup lang="ts">
import { ref, watch } from 'vue';
import type { AppPreference } from '../../types/appPreference';
import InputSwitch from 'primevue/inputswitch';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';

const props = defineProps<{
  initialData: AppPreference | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: Partial<AppPreference>): void;
  (e: 'reset'): void;
}>();

const formData = ref<Partial<AppPreference>>({});

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
  }
}, { immediate: true });

const handleSave = () => {
  emit('save', formData.value);
};
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- General Preferences -->
      <div class="space-y-6">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Preferensi Umum</h3>
        
        <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div class="font-semibold text-slate-800">Gunakan Periode Aktif Secara Otomatis</div>
            <div class="text-sm text-slate-500">Mencegah sistem bertanya periode saat load data awal.</div>
          </div>
          <InputSwitch v-model="formData.autoUseActivePeriod" />
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div class="font-semibold text-slate-800">Autosave Penilaian</div>
            <div class="text-sm text-slate-500">Menyimpan draf nilai otomatis saat diinput (Debounce).</div>
          </div>
          <InputSwitch v-model="formData.autoSaveAssessment" />
        </div>
      </div>

      <!-- Assessment Preferences -->
      <div class="space-y-6">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Preferensi Penilaian</h3>
        
        <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div class="font-semibold text-slate-800">Wajibkan Catatan Jika Skor Rendah</div>
            <div class="text-sm text-slate-500">Penilai harus memberi catatan jika nilai <= ambang batas.</div>
          </div>
          <InputSwitch v-model="formData.requireNoteForLowScore" />
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <div class="font-semibold text-slate-800">Ambang Batas Skor Rendah</div>
            <div class="text-sm text-slate-500">Skor (1-4) yang dianggap rendah.</div>
          </div>
          <InputNumber v-model="formData.lowScoreThreshold" inputId="minmax" :min="1" :max="4" class="w-20" />
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="space-y-6 md:col-span-2">
        <h3 class="text-lg font-bold text-slate-800 border-b pb-2">Preferensi Notifikasi</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div class="font-semibold text-slate-800">Aktifkan Notifikasi WhatsApp</div>
              <div class="text-sm text-slate-500">Kirim pesan dummy otomatis ke WA sesuai event.</div>
            </div>
            <InputSwitch v-model="formData.enableWaNotification" />
          </div>

          <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div class="font-semibold text-slate-800">Aktifkan Pengingat Refleksi</div>
              <div class="text-sm text-slate-500">Munculkan notifikasi jika guru belum mengisi refleksi.</div>
            </div>
            <InputSwitch v-model="formData.enableReflectionReminder" />
          </div>
        </div>
      </div>

    </div>

    <div class="flex justify-between pt-4 border-t">
      <Button label="Reset ke Default" icon="pi pi-refresh" severity="secondary" outlined @click="emit('reset')" :loading="loading" />
      <Button label="Simpan Preferensi" icon="pi pi-save" :loading="loading" @click="handleSave" />
    </div>
  </div>
</template>
