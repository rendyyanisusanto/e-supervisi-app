<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCompetencyStore } from '../../stores/competencyStore';
import { useTeacherStore } from '../../stores/teacherStore';
import { useAuthStore } from '../../stores/authStore';
import { usePeriodStore } from '../../stores/periodStore';

import Dropdown from 'primevue/dropdown';
import Skeleton from 'primevue/skeleton';
import BasePageHeader from '../../components/common/BasePageHeader.vue';
import TeacherCompetencyChart from '../../components/competency/TeacherCompetencyChart.vue';
import CompetencyAspectCard from '../../components/competency/CompetencyAspectCard.vue';

const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const competencyStore = useCompetencyStore();
const periodStore = usePeriodStore();

const selectedTeacherId = ref<string | null>(null);
const selectedPeriodId = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    teacherStore.fetchTeachers(),
    periodStore.fetchPeriods()
  ]);
  
  if (authStore.role === 'guru') {
    selectedTeacherId.value = authStore.user?.id ? String(authStore.user.id) : null;
  }

  // Set default period
  const activePeriod = periodStore.periods.find(p => p.isActive);
  if (activePeriod) {
    selectedPeriodId.value = String(activePeriod.id);
  } else if (periodStore.periods.length > 0) {
    selectedPeriodId.value = String(periodStore.periods[0].id);
  }

  loading.value = false;
});

watch([selectedTeacherId, selectedPeriodId], async ([newTeacher, newPeriod]) => {
  if (newTeacher && newPeriod) {
    await competencyStore.fetchTeacherCompetency(newTeacher, newPeriod);
  } else {
    competencyStore.currentCompetency = null;
  }
});

const isGuruRole = computed(() => authStore.role === 'guru');
</script>

<template>
  <div class="flex flex-col gap-4 relative">
    <BasePageHeader 
      title="Peta Kompetensi Guru" 
      subtitle="Analisis aspek kekuatan dan area pengembangan guru berdasarkan hasil supervisi."
      icon="pi pi-chart-pie"
    />

    <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-2">
      <div class="font-medium text-slate-700">Pilih Guru:</div>
      <Dropdown 
        v-model="selectedTeacherId" 
        :options="teacherStore.teachers" 
        optionLabel="name" 
        optionValue="id" 
        placeholder="Pilih Guru" 
        class="w-full sm:w-80" 
        :disabled="isGuruRole"
        filter
      />

      <div class="font-medium text-slate-700 ml-0 sm:ml-4">Periode:</div>
      <Dropdown 
        v-model="selectedPeriodId" 
        :options="periodStore.periods" 
        optionLabel="name" 
        optionValue="id" 
        placeholder="Pilih Periode" 
        class="w-full sm:w-64" 
      />
    </div>

    <div v-if="loading || competencyStore.loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1"><Skeleton width="100%" height="25rem" /></div>
      <div class="lg:col-span-2"><Skeleton width="100%" height="25rem" /></div>
    </div>

    <div v-else-if="selectedTeacherId && competencyStore.currentCompetency">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Chart -->
        <div class="lg:col-span-1">
          <TeacherCompetencyChart :competency="competencyStore.currentCompetency" />
        </div>

        <!-- Right: Detail Aspects -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-lg mb-4 text-slate-800">Insight Kompetensi</h3>
            
            <div class="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm border border-blue-100">
              Rata-rata kompetensi keseluruhan berada pada angka 
              <span class="font-bold text-blue-900">{{ competencyStore.currentCompetency.averageScore.toFixed(1) }}</span>.
              <span v-if="competencyStore.currentCompetency.strongestAspects.length > 0">
                Aspek terbaik adalah <strong>{{ competencyStore.currentCompetency.strongestAspects[0].category }}</strong>.
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <h4 class="font-semibold text-slate-600 text-sm uppercase tracking-wider mb-2">Kekuatan Utama</h4>
                <CompetencyAspectCard 
                  v-for="(aspect, idx) in competencyStore.currentCompetency.strongestAspects" 
                  :key="'s'+idx" 
                  :aspect="aspect" 
                  type="strong" 
                />
                <div v-if="competencyStore.currentCompetency.strongestAspects.length === 0" class="text-sm text-slate-400 italic">Belum ada data kekuatan.</div>
              </div>

              <div class="space-y-3">
                <h4 class="font-semibold text-slate-600 text-sm uppercase tracking-wider mb-2">Area Pengembangan</h4>
                <CompetencyAspectCard 
                  v-for="(aspect, idx) in competencyStore.currentCompetency.weakestAspects" 
                  :key="'w'+idx" 
                  :aspect="aspect" 
                  type="weak" 
                />
                <div v-if="competencyStore.currentCompetency.weakestAspects.length === 0" class="text-sm text-slate-400 italic">Belum ada area prioritas.</div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 class="font-bold text-lg mb-4 text-slate-800">Detail Semua Aspek</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CompetencyAspectCard 
                v-for="(aspect, idx) in competencyStore.currentCompetency.aspects" 
                :key="'a'+idx" 
                :aspect="aspect" 
                type="normal" 
              />
            </div>
            <div v-if="competencyStore.currentCompetency.aspects.length === 0" class="p-6 text-center text-slate-400">
              Belum ada hasil supervisi yang dinilai untuk guru ini.
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
      <i class="pi pi-user text-5xl text-slate-300 mb-4 block"></i>
      <h3 class="text-xl font-bold text-slate-700 mb-2">Pilih Guru</h3>
      <p class="text-slate-500">Silakan pilih guru dari dropdown di atas untuk melihat peta kompetensinya.</p>
    </div>
  </div>
</template>
