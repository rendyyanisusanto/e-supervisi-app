import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TeacherReflection } from '../types/reflection';
import { reflectionService } from '../services/reflectionService';
import { getApiErrorMessage } from '../utils/apiError';
import type { UpdateReflectionPayload as SubmitReflectionPayload } from '../types/dto/reflection.dto';
import type { QueryParams } from '../types/api';

export const useReflectionStore = defineStore('reflection', () => {
  const reflections = ref<TeacherReflection[]>([]);
  const currentReflection = ref<TeacherReflection | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchReflections = async (query?: QueryParams) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reflectionService.getReflections(query);
      if (res.success) {
        reflections.value = res.data ?? [];
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengambil data refleksi');
    } finally {
      loading.value = false;
    }
  };

  const fetchReflectionBySupervision = async (supervisionId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reflectionService.getReflectionBySupervisionId(supervisionId);
      if (res.success) {
        currentReflection.value = res.data ?? null;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
    } finally {
      loading.value = false;
    }
  };

  const saveReflection = async (supervisionId: string | number, data: SubmitReflectionPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reflectionService.submitReflection(supervisionId, data);
      if (res.success) {
        currentReflection.value = res.data ?? null;
      }
      await fetchReflections();
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      const res = await reflectionService.markAsRead(id);
      if (res.success) {
        const index = reflections.value.findIndex(r => String(r.id) === String(id));
        if (index !== -1) {
          reflections.value[index] = res.data!;
        }
        if (currentReflection.value && String(currentReflection.value.id) === String(id)) {
          currentReflection.value = res.data ?? null;
        }
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
    }
  };

  return {
    reflections,
    currentReflection,
    loading,
    error,
    clearError,
    fetchReflections,
    fetchReflectionBySupervision,
    saveReflection,
    markAsRead
  };
});
