<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useReflectionStore } from '../../stores/reflectionStore';
import { useSupervisionStore } from '../../stores/supervisionStore';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import ReflectionStatusTag from '../../components/reflection/ReflectionStatusTag.vue';
import BasePageHeader from '../../components/common/BasePageHeader.vue';

const router = useRouter();

const authStore = useAuthStore();
const reflectionStore = useReflectionStore();
const supervisionStore = useSupervisionStore();

const loading = ref(true);
const searchQuery = ref('');

onMounted(async () => {
  loading.value = true;
  await supervisionStore.fetchSupervisions();
  await reflectionStore.fetchReflections();
  loading.value = false;
});

const mergedData = computed(() => {
  const completedSupervisions = supervisionStore.supervisions.filter(s => s.status === 'SELESAI');
  
  let result = completedSupervisions.map(s => {
    const ref = reflectionStore.reflections.find(r => r.supervisionId === s.id);
    return {
      supervisionId: s.id,
      date: s.updatedAt,
      teacherId: s.teacherId,
      instruments: s.instrumentIds.join(', '),
      finalScore: s.finalScore,
      reflectionId: ref?.id || null,
      reflectionStatus: ref?.status || 'BELUM_DIISI',
      targetDate: ref?.targetDate || null
    };
  });

  // Role filtering
  if (authStore.role === 'guru') {
    result = result.filter(r => String(r.teacherId) === String(authStore.user?.id));
  } else if (authStore.role === 'penilai') {
    // Ideally filter by supervisorId, but for dummy we show all for now, or match if supervisor
  }

  // Text search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(r => 
      r.instruments.toLowerCase().includes(q) || 
      r.reflectionStatus.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
});

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const handleAction = (data: any) => {
  router.push(`/refleksi/${data.supervisionId}`);
};
</script>

<template>
  <div class="flex flex-col gap-4 relative">
    <BasePageHeader 
      title="Refleksi Guru" 
      subtitle="Kelola dan pantau refleksi guru setelah proses supervisi selesai."
      icon="pi pi-comment"
    >
      <span class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <InputText v-model="searchQuery" placeholder="Cari..." class="pl-10 !rounded-full !bg-white border-slate-200 w-64" />
      </span>
    </BasePageHeader>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <DataTable v-if="!loading" :value="mergedData" :paginator="true" :rows="10" 
                 dataKey="supervisionId" responsiveLayout="scroll"
                 class="p-datatable-sm">
        
        <template #empty>
          <div class="p-8 text-center text-slate-500">
            <i class="pi pi-inbox text-4xl mb-3 text-slate-300"></i>
            <p>Belum ada data supervisi selesai untuk direfleksikan.</p>
          </div>
        </template>

        <Column header="Tanggal Supervisi">
          <template #body="slotProps">
            <div class="font-medium text-slate-700">{{ formatDate(slotProps.data.date) }}</div>
          </template>
        </Column>

        <Column header="Instrumen">
          <template #body="slotProps">
            <div class="text-sm text-slate-600">{{ slotProps.data.instruments }}</div>
          </template>
        </Column>

        <Column header="Skor" style="width: 100px; text-align: center;">
          <template #body="slotProps">
            <div class="font-bold text-slate-800">{{ slotProps.data.finalScore?.toFixed(1) || '-' }}</div>
          </template>
        </Column>

        <Column header="Status Refleksi" style="width: 180px;">
          <template #body="slotProps">
            <ReflectionStatusTag :status="slotProps.data.reflectionStatus" />
          </template>
        </Column>

        <Column header="Target Perbaikan">
          <template #body="slotProps">
            <div class="text-sm text-slate-600">
              <span v-if="slotProps.data.targetDate"><i class="pi pi-calendar mr-1"></i> {{ formatDate(slotProps.data.targetDate) }}</span>
              <span v-else>-</span>
            </div>
          </template>
        </Column>

        <Column header="Aksi" style="width: 120px; text-align: center;">
          <template #body="slotProps">
            <Button 
              :icon="authStore.role === 'guru' ? (slotProps.data.reflectionStatus === 'BELUM_DIISI' ? 'pi pi-pencil' : 'pi pi-file-edit') : 'pi pi-eye'" 
              :label="authStore.role === 'guru' ? (slotProps.data.reflectionStatus === 'BELUM_DIISI' ? 'Isi' : 'Edit') : 'Lihat'"
              size="small"
              :severity="slotProps.data.reflectionStatus === 'BELUM_DIISI' ? 'primary' : 'secondary'"
              outlined
              @click="handleAction(slotProps.data)" 
            />
          </template>
        </Column>
      </DataTable>

      <div v-else class="p-5">
        <Skeleton width="100%" height="3rem" class="mb-2" v-for="i in 5" :key="i" />
      </div>
    </div>
  </div>
</template>
