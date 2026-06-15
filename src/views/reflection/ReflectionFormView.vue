<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReflectionStore } from '../../stores/reflectionStore';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from 'primevue/usetoast';

import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import BasePageHeader from '../../components/common/BasePageHeader.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const reflectionStore = useReflectionStore();
const supervisionStore = useSupervisionStore();

const supervisionId = route.params.id as string;
const loading = ref(true);
const isSaving = ref(false);

const form = ref({
  strengthReflection: '',
  obstacleReflection: '',
  improvementPlan: '',
  supportNeeded: '',
  targetDate: ''
});

onMounted(async () => {
  loading.value = true;
  await supervisionStore.fetchSupervisionById(supervisionId);
  await reflectionStore.fetchReflectionBySupervision(supervisionId);
  
  if (reflectionStore.currentReflection) {
    const r = reflectionStore.currentReflection;
    form.value = {
      strengthReflection: r.strengthReflection || '',
      obstacleReflection: r.obstacleReflection || '',
      improvementPlan: r.improvementPlan || '',
      supportNeeded: r.supportNeeded || '',
      targetDate: r.targetDate || ''
    };
  }
  loading.value = false;
});

const isGuru = computed(() => authStore.role === 'guru');
const isReadonly = computed(() => !isGuru.value);

const isValid = computed(() => {
  return form.value.strengthReflection.trim() !== '' &&
         form.value.obstacleReflection.trim() !== '' &&
         form.value.improvementPlan.trim() !== '';
});

const handleSubmit = async () => {
  if (!isValid.value) return;
  isSaving.value = true;
  try {
    await reflectionStore.saveReflection(supervisionId, {
      strengthReflection: form.value.strengthReflection,
      obstacleReflection: form.value.obstacleReflection,
      improvementPlan: form.value.improvementPlan,
      supportNeeded: form.value.supportNeeded,
      targetDate: form.value.targetDate || undefined,
    });
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Refleksi berhasil dikirim!', life: 3000 });
    setTimeout(() => {
      router.push('/refleksi');
    }, 1500);
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.message || 'Gagal menyimpan refleksi', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};

const handleMarkAsRead = async () => {
  isSaving.value = true;
  try {
    if (reflectionStore.currentReflection?.id) {
      await reflectionStore.markAsRead(reflectionStore.currentReflection.id);
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Refleksi ditandai sudah dibaca', life: 3000 });
    }
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengubah status', life: 3000 });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <BasePageHeader 
      title="Isi Refleksi Guru" 
      subtitle="Pengisian refleksi mandiri berdasarkan hasil supervisi."
      icon="pi pi-file-edit"
      :showBack="true"
      backTo="/refleksi"
    />

    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2"><Skeleton width="100%" height="25rem" /></div>
      <div class="lg:col-span-1"><Skeleton width="100%" height="15rem" /></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Kolom Utama: Form Refleksi -->
      <div class="lg:col-span-2">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Formulir Refleksi</h3>
          
          <div v-if="isReadonly && reflectionStore.currentReflection?.status === 'BELUM_DIISI'" class="p-6 text-center text-slate-500">
            <i class="pi pi-clock text-4xl mb-3 text-slate-300"></i>
            <p>Guru belum mengisi refleksi untuk supervisi ini.</p>
          </div>

          <div v-else class="space-y-5">
            <div class="flex flex-col gap-2">
              <label class="font-medium text-slate-700">1. Apa kekuatan pembelajaran/perangkat Anda berdasarkan hasil supervisi? <span class="text-red-500">*</span></label>
              <Textarea v-model="form.strengthReflection" rows="3" :disabled="isReadonly" placeholder="Ceritakan kekuatan yang Anda rasakan..." />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-medium text-slate-700">2. Apa kendala yang Anda alami? <span class="text-red-500">*</span></label>
              <Textarea v-model="form.obstacleReflection" rows="3" :disabled="isReadonly" placeholder="Ceritakan kendala selama pembelajaran..." />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-medium text-slate-700">3. Apa rencana perbaikan yang akan Anda lakukan? <span class="text-red-500">*</span></label>
              <Textarea v-model="form.improvementPlan" rows="3" :disabled="isReadonly" placeholder="Langkah konkret perbaikan..." />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-medium text-slate-700">4. Dukungan apa yang Anda butuhkan dari sekolah/kurikulum?</label>
              <Textarea v-model="form.supportNeeded" rows="3" :disabled="isReadonly" placeholder="Dukungan sarana, pelatihan, dll..." />
            </div>

            <div class="flex flex-col gap-2 w-full md:w-1/2">
              <label class="font-medium text-slate-700">5. Target Tanggal Perbaikan</label>
              <InputText type="date" v-model="form.targetDate" :disabled="isReadonly" />
            </div>

            <div class="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
              <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push('/refleksi')" />
              
              <template v-if="isGuru">
                <Button label="Kirim Refleksi" icon="pi pi-send" :loading="isSaving" :disabled="!isValid" @click="handleSubmit" />
              </template>
              
              <template v-else-if="reflectionStore.currentReflection?.status === 'SUDAH_DIISI'">
                <Button label="Tandai Sudah Dibaca" icon="pi pi-check" :loading="isSaving" @click="handleMarkAsRead" severity="success" />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Ringkasan Supervisi -->
      <div class="lg:col-span-1">
        <div class="sticky top-6 bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
          <h3 class="font-bold text-lg mb-4 text-blue-900 border-b border-blue-200 pb-2">Informasi Supervisi</h3>
          
          <div class="space-y-4" v-if="supervisionStore.currentSupervision">
            <div>
              <div class="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">Instrumen</div>
              <div class="font-medium text-blue-900">{{ supervisionStore.currentSupervision.instrumentIds.join(', ') }}</div>
            </div>
            <div>
              <div class="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">Nilai Akhir</div>
              <div class="text-3xl font-bold text-blue-700">{{ supervisionStore.currentSupervision.finalScore?.toFixed(1) || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">Catatan Penilai</div>
              <div class="text-sm text-blue-800 bg-white/50 p-3 rounded-lg border border-blue-100 italic">
                "{{ supervisionStore.currentSupervision.improvementNote || 'Tidak ada catatan perbaikan.' }}"
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
