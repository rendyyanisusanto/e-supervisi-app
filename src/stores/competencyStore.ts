import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TeacherCompetency } from '../types/competency';
import { competencyService } from '../services/competencyService';

export const useCompetencyStore = defineStore('competency', () => {
  const currentCompetency = ref<TeacherCompetency | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchTeacherCompetency = async (teacherId: string, periodId: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentCompetency.value = await competencyService.getTeacherCompetency(teacherId, periodId);
    } catch (e: any) {
      error.value = e.message || 'Gagal memuat peta kompetensi guru';
    } finally {
      loading.value = false;
    }
  };

  return {
    currentCompetency,
    loading,
    error,
    fetchTeacherCompetency
  };
});
