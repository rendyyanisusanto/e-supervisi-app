import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SchoolProfile } from '../types/schoolProfile';
import { schoolProfileService } from '../services/schoolProfileService';
import { getApiErrorMessage } from '../utils/apiError';
import type { UpdateSchoolProfilePayload } from '../types/dto/settings.dto';

export const useSchoolProfileStore = defineStore('schoolProfile', () => {
  const profile = ref<SchoolProfile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchProfile = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await schoolProfileService.getProfile();
      if (res.success) {
        profile.value = res.data ?? null;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat profil sekolah');
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (data: UpdateSchoolProfilePayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await schoolProfileService.updateProfile(data);
      if (res.success) {
        profile.value = res.data ?? null;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memperbarui profil sekolah');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const uploadLogo = async (file: File) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await schoolProfileService.uploadLogo(file);
      if (res.success) {
        profile.value = res.data ?? null;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengunggah logo');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  return {
    profile,
    loading,
    error,
    clearError,
    fetchProfile,
    updateProfile,
    uploadLogo
  };
});
