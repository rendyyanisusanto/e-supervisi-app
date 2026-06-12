import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ReportSettings } from '../types/reportSetting';
import { reportSettingService } from '../services/reportSettingService';
import { getApiErrorMessage } from '../utils/apiError';
import type { UpdateReportSettingPayload } from '../types/dto/settings.dto';

export const useReportSettingStore = defineStore('reportSetting', () => {
  const settings = ref<ReportSettings | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchSettings = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportSettingService.getReportSettings();
      if (res.success) {
        settings.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat format laporan');
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (data: UpdateReportSettingPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportSettingService.updateReportSettings(data);
      if (res.success) {
        settings.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memperbarui format laporan');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const resetSettings = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportSettingService.resetReportSettings();
      if (res.success) {
        settings.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mereset format laporan');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  return {
    settings,
    loading,
    error,
    clearError,
    fetchSettings,
    updateSettings,
    resetSettings
  };
});
