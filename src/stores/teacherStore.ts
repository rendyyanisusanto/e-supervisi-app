import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Teacher } from '../types/teacher';
import { teacherService } from '../services/teacherService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateTeacherPayload, UpdateTeacherPayload } from '../types/dto/teacher.dto';

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchTeachers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await teacherService.getTeachers();
      if (res.success) {
        teachers.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data guru');
    } finally {
      loading.value = false;
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

  return {
    teachers,
    loading,
    error,
    clearError,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    toggleStatus,
    uploadPhoto
  };
});
