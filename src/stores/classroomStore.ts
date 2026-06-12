import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Classroom } from '../types/classroom';
import { classroomService } from '../services/classroomService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateClassroomPayload, UpdateClassroomPayload } from '../types/dto/classroom.dto';

export const useClassroomStore = defineStore('classroom', () => {
  const classrooms = ref<Classroom[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchClassrooms = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await classroomService.getClassrooms();
      if (res.success) {
        classrooms.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data kelas');
    } finally {
      loading.value = false;
    }
  };

  const addClassroom = async (data: CreateClassroomPayload) => {
    try {
      const res = await classroomService.createClassroom(data);
      if (res.success) {
        await fetchClassrooms();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateClassroom = async (id: string | number, data: UpdateClassroomPayload) => {
    try {
      const res = await classroomService.updateClassroom(id, data);
      if (res.success) {
        await fetchClassrooms();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteClassroom = async (id: string | number) => {
    try {
      await classroomService.deleteClassroom(id);
      await fetchClassrooms();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string | number) => {
    try {
      const res = await classroomService.toggleClassroomStatus(id);
      if (res.success) {
        await fetchClassrooms();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  return {
    classrooms,
    loading,
    error,
    clearError,
    fetchClassrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    toggleStatus
  };
});
