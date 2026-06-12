import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Period } from '../types/period';
import { periodService } from '../services/periodService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreatePeriodPayload, UpdatePeriodPayload } from '../types/dto/period.dto';

export const usePeriodStore = defineStore('period', () => {
  const periods = ref<Period[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchPeriods = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await periodService.getPeriods();
      if (res.success) {
        periods.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data periode');
    } finally {
      loading.value = false;
    }
  };

  const addPeriod = async (data: CreatePeriodPayload) => {
    try {
      const res = await periodService.createPeriod(data);
      if (res.success) {
        await fetchPeriods(); // refresh to get correct active states
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updatePeriod = async (id: string | number, data: UpdatePeriodPayload) => {
    try {
      const res = await periodService.updatePeriod(id, data);
      if (res.success) {
        await fetchPeriods();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deletePeriod = async (id: string | number) => {
    try {
      await periodService.deletePeriod(id);
      await fetchPeriods();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const setActivePeriod = async (id: string | number) => {
    try {
      await periodService.setActivePeriod(id);
      await fetchPeriods();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  return {
    periods,
    loading,
    error,
    clearError,
    fetchPeriods,
    addPeriod,
    updatePeriod,
    deletePeriod,
    setActivePeriod
  };
});
