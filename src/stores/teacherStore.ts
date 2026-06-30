import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Teacher } from '../types/teacher';
import { teacherService } from '../services/teacherService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateTeacherPayload, UpdateTeacherPayload } from '../types/dto/teacher.dto';

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([]);
  const selectedTeacher = ref<Teacher | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchTeachers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await teacherService.getTeachers({ limit: 1000 });
      if (res.success) {
        teachers.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data guru');
    } finally {
      loading.value = false;
    }
  };

  const fetchTeacherById = async (id: string | number) => {
    detailLoading.value = true;
    selectedTeacher.value = null;
    try {
      const res = await teacherService.getTeacherById(id);
      if (res.success) {
        selectedTeacher.value = res.data ?? null;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err, 'Gagal mengambil detail guru'));
    } finally {
      detailLoading.value = false;
    }
  };

  const addTeacher = async (data: CreateTeacherPayload) => {
    try {
      const res = await teacherService.createTeacher(data);
      if (res.success) {
        await fetchTeachers();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateTeacher = async (id: string | number, data: UpdateTeacherPayload) => {
    try {
      const res = await teacherService.updateTeacher(id, data);
      if (res.success) {
        await fetchTeachers();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteTeacher = async (id: string | number) => {
    try {
      await teacherService.deleteTeacher(id);
      await fetchTeachers();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string | number) => {
    try {
      const res = await teacherService.toggleTeacherStatus(id);
      if (res.success) {
        await fetchTeachers();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const uploadPhoto = async (id: string | number, file: File) => {
    try {
      const res = await teacherService.uploadTeacherPhoto(id, file);
      if (res.success) {
        await fetchTeachers(); // Reload data to show photo
      }
      return res;
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const importTeachers = async (file: File) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await teacherService.importExcel(file);
      if (res.success) {
        await fetchTeachers();
      }
      return res;
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengimport guru');
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    teachers,
    selectedTeacher,
    loading,
    detailLoading,
    error,
    clearError,
    fetchTeachers,
    fetchTeacherById,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    toggleStatus,
    uploadPhoto,
    importTeachers
  };
});
