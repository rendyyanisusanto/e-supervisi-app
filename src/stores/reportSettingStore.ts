import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ReportSettings } from '../types/reportSetting';
import { reportSettingService } from '../services/reportSettingService';
import { getApiErrorMessage } from '../utils/apiError';
import type { UpdateReportSettingsPayload as UpdateReportSettingPayload } from '../types/dto/settings.dto';

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
      settings.value = (await reportSettingService.getSettings()).data ?? null;
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat format laporan');
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (data: Partial<ReportSettings>) => {
    loading.value = true;
    error.value = null;
    try {
      settings.value = (await reportSettingService.updateSettings(data as UpdateReportSettingPayload)).data ?? null;
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
      settings.value = (await reportSettingService.resetSettings()).data ?? null;
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
