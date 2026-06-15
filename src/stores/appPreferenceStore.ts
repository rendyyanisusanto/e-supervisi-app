import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AppPreference } from '../types/appPreference';
import { appPreferenceService } from '../services/appPreferenceService';

export const useAppPreferenceStore = defineStore('appPreference', () => {
  const preferences = ref<AppPreference | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPreferences = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await appPreferenceService.getPreferences();
      preferences.value = res.data ?? null;
    } catch (e: any) {
      error.value = e.message || 'Gagal memuat preferensi sistem';
    } finally {
      loading.value = false;
    }
  };

  const updatePreferences = async (data: Partial<AppPreference>) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await appPreferenceService.updatePreferences(data as any);
      preferences.value = res.data ?? null;
    } catch (e: any) {
      error.value = e.message || 'Gagal memperbarui preferensi';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const resetPreferences = async () => {
    loading.value = true;
    error.value = null;
    try {
      // const res = await appPreferenceService.resetPreferences();
      // preferences.value = res.data ?? null;
    } catch (e: any) {
      error.value = e.message || 'Gagal mereset preferensi';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    resetPreferences
  };
});
