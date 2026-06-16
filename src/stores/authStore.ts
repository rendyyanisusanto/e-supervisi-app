import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/app';
import { hasRole, hasAnyRole } from '../utils/roleAccess';
import type { Role } from '../constants/roles';
import { authService } from '../services/authService';
import type { AuthUserDto } from '../types/dto/auth.dto';
import { getApiErrorMessage } from '../utils/apiError';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUserDto | null>(getStorageItem<AuthUserDto | null>(STORAGE_KEYS.AUTH_USER, null));
  const token = ref<string | null>(getStorageItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  // Support both legacy role string array and individual roles
  const role = computed(() => user.value?.roles?.[0] || '');
  const displayName = computed(() => user.value?.name || '');

  const clearError = () => {
    error.value = null;
  };

  const login = async (username: string, password?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      if (!username || !password) {
        throw new Error('Username dan password harus diisi');
      }

      const response = await authService.login({ username, password });
      
      if (response.success && response.data) {
        user.value = response.data.user;
        token.value = response.data.accessToken;
        return true;
      }
      return false;
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      user.value = null;
      token.value = null;
      loading.value = false;
      router.push('/login');
    }
  };

  const updateProfile = async (formData: FormData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authService.updateProfile(formData);
      if (response.success && response.data) {
        user.value = response.data;
        return true;
      }
      return false;
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const canAccessRole = (requiredRole: Role) => {
    return hasRole(role.value, requiredRole);
  };

  const canAccessAnyRole = (requiredRoles: Role[]) => {
    return hasAnyRole(role.value, requiredRoles);
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    role,
    displayName,
    clearError,
    login,
    logout,
    updateProfile,
    canAccessRole,
    canAccessAnyRole,
  };
});
