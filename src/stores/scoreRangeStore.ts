import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ScoreRange } from '../types/scoreRange';
import { scoreRangeService } from '../services/scoreRangeService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateScoreRangePayload, UpdateScoreRangePayload } from '../types/dto/scoreRange.dto';

export const useScoreRangeStore = defineStore('scoreRange', () => {
  const scoreRanges = ref<ScoreRange[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchScoreRanges = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await scoreRangeService.getScoreRanges();
      if (res.success) {
        scoreRanges.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data rentang nilai');
    } finally {
      loading.value = false;
    }
  };

  const addScoreRange = async (data: CreateScoreRangePayload) => {
    try {
      const res = await scoreRangeService.createScoreRange(data);
      if (res.success) {
        await fetchScoreRanges();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateScoreRange = async (id: string | number, data: UpdateScoreRangePayload) => {
    try {
      const res = await scoreRangeService.updateScoreRange(id, data);
      if (res.success) {
        await fetchScoreRanges();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteScoreRange = async (id: string | number) => {
    try {
      await scoreRangeService.deleteScoreRange(id);
      await fetchScoreRanges();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  return {
    scoreRanges,
    loading,
    error,
    clearError,
    fetchScoreRanges,
    addScoreRange,
    updateScoreRange,
    deleteScoreRange
  };
});
