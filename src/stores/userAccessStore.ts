import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserAccess } from '../types/userAccess';
import { userAccessService } from '../services/userAccessService';
import { getApiErrorMessage } from '../utils/apiError';
import type { QueryParams } from '../types/api';

export const useUserAccessStore = defineStore('userAccess', () => {
  const users = ref<UserAccess[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchUsers = async (query?: QueryParams) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await userAccessService.getUsers(query);
      if (res.success) {
        users.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat data pengguna');
    } finally {
      loading.value = false;
    }
  };

  const updateRoles = async (userId: string | number, roles: string[]) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await userAccessService.updateUserRoles(userId, roles);
      if (res.success) {
        await fetchUsers(); // Refresh
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memperbarui hak akses');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const toggleStatus = async (userId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await userAccessService.toggleUserStatus(userId);
      if (res.success) {
        await fetchUsers();
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengubah status akun');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (userId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      await userAccessService.resetPassword(userId);
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mereset password');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    error,
    clearError,
    fetchUsers,
    updateRoles,
    toggleStatus,
    resetPassword
  };
});
