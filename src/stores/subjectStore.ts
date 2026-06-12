import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Subject } from '../types/subject';
import { subjectService } from '../services/subjectService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateSubjectPayload, UpdateSubjectPayload } from '../types/dto/subject.dto';

export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchSubjects = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await subjectService.getSubjects();
      if (res.success) {
        subjects.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data mapel');
    } finally {
      loading.value = false;
    }
  };

  const addSubject = async (data: CreateSubjectPayload) => {
    try {
      const res = await subjectService.createSubject(data);
      if (res.success) {
        await fetchSubjects();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateSubject = async (id: string | number, data: UpdateSubjectPayload) => {
    try {
      const res = await subjectService.updateSubject(id, data);
      if (res.success) {
        await fetchSubjects();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteSubject = async (id: string | number) => {
    try {
      await subjectService.deleteSubject(id);
      await fetchSubjects();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string | number) => {
    try {
      const res = await subjectService.toggleSubjectStatus(id);
      if (res.success) {
        await fetchSubjects();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  return {
    subjects,
    loading,
    error,
    clearError,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleStatus
  };
});
