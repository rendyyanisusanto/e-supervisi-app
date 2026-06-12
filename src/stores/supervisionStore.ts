import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Supervision } from '../types/supervision';
import { supervisionService } from '../services/supervisionService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateSupervisionPayload, UpdateSupervisionPayload, EvaluateSupervisionPayload } from '../types/dto/supervision.dto';
import type { QueryParams } from '../types/api';

export const useSupervisionStore = defineStore('supervision', () => {
  const supervisions = ref<Supervision[]>([]);
  const currentSupervision = ref<Supervision | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const completedSupervisions = computed(() => {
    return supervisions.value.filter(s => s.status === 'SELESAI');
  });

  async function fetchSupervisions(query?: QueryParams) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.getSupervisions(query);
      if (res.success) {
        supervisions.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Failed to fetch supervisions');
    } finally {
      loading.value = false;
    }
  }

  async function fetchSupervisionById(id: string | number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.getSupervisionById(id);
      if (res.success) {
        currentSupervision.value = res.data as unknown as Supervision;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Failed to fetch supervision details');
    } finally {
      loading.value = false;
    }
  }

  async function createSupervision(data: CreateSupervisionPayload) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.createSupervision(data);
      if (res.success) {
        supervisions.value.unshift(res.data);
        return res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Failed to create supervision');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function updateSchedule(id: string | number, data: any) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.updateSchedule(id, data);
      if (res.success && res.data) {
        const index = supervisions.value.findIndex(s => String(s.id) === String(id));
        if (index !== -1) supervisions.value[index] = res.data;
        if (currentSupervision.value && String(currentSupervision.value.id) === String(id)) {
          currentSupervision.value = res.data;
        }
        return res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal memperbarui jadwal');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function saveDraft(id: string | number, data: any) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.saveDraft(id, data);
      if (res.success && res.data) {
        const index = supervisions.value.findIndex(s => String(s.id) === String(id));
        if (index !== -1) supervisions.value[index] = res.data;
        if (currentSupervision.value && String(currentSupervision.value.id) === String(id)) {
          currentSupervision.value = res.data as unknown as Supervision;
        }
        return res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal menyimpan draft');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function submitFinal(id: string | number, data: any) {
    loading.value = true;
    error.value = null;
    try {
      const res = await supervisionService.submitFinal(id, data);
      if (res.success && res.data) {
        const index = supervisions.value.findIndex(s => String(s.id) === String(id));
        if (index !== -1) supervisions.value[index] = res.data;
        if (currentSupervision.value && String(currentSupervision.value.id) === String(id)) {
          currentSupervision.value = res.data as unknown as Supervision;
        }
        return res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal submit final');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  }

  async function cancelSupervision(id: string | number) {
    try {
      await supervisionService.cancelSupervision(id);
      const index = supervisions.value.findIndex(s => String(s.id) === String(id));
      if (index !== -1) {
        supervisions.value[index].status = 'DIBATALKAN';
      }
      if (currentSupervision.value && String(currentSupervision.value.id) === String(id)) {
        currentSupervision.value.status = 'DIBATALKAN';
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err, 'Gagal membatalkan supervisi'));
    }
  }

  return {
    supervisions,
    currentSupervision,
    completedSupervisions,
    loading,
    error,
    clearError,
    fetchSupervisions,
    fetchSupervisionById,
    createSupervision,
    updateSchedule,
    saveDraft,
    submitFinal,
    cancelSupervision
  };
});
