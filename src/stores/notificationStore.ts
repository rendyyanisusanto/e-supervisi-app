import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { getApiErrorMessage } from '../utils/apiError';
import type { QueryParams } from '../types/api';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

  const fetchNotifications = async (query?: QueryParams) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await notificationService.getNotifications(query);
      if (res.success) {
        notifications.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat notifikasi');
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        const index = notifications.value.findIndex(n => String(n.id) === String(id));
        if (index !== -1) notifications.value[index].isRead = true;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        notifications.value.forEach(n => n.isRead = true);
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e);
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    clearError,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
});
