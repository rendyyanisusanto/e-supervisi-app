import { dummyNotifications } from '../data/dummyNotifications';
import type { Notification } from '../types/notification';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import { paginateArray } from '../utils/pagination';
import { NotificationMapper } from '../mappers/notificationMapper';

// Local state for dummy mode
let notifications = [...dummyNotifications].sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

export const notificationService = {
  async getNotifications(query?: QueryParams): Promise<ApiListResponse<Notification>> {
    if (isApiMode()) {
      try {
        const response = await httpClient.get<ApiListResponse<any>>(endpoints.notifications, { params: query });
        return {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data.map(NotificationMapper.toFrontend),
          meta: response.data.meta
        };
      } catch (e) {
        // Fallback for notifications if not fully setup
        return { success: true, message: 'Gagal ambil notif', data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...notifications];

    if (query?.userId) {
      // Return global notifications (userId undefined) or specific user notifications
      result = result.filter(n => !n.userId || n.userId === query.userId);
    }
    
    if (query?.isRead !== undefined) {
      // Use proper boolean check
      const isReadParam = query.isRead === 'true' || query.isRead === true;
      result = result.filter(n => n.isRead === isReadParam);
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Data notifikasi berhasil dimuat',
      data,
      meta
    };
  },
  
  async markAsRead(id: string | number): Promise<ApiResponse<Notification>> {
    if (isApiMode()) {
      try {
        const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.notifications}/${id}/read`);
        return {
          success: response.data.success,
          message: response.data.message,
          data: NotificationMapper.toFrontend(response.data.data)
        };
      } catch (e) {
        return { success: true, message: 'Gagal' };
      }
    }

    await mockDelay(300);
    const index = notifications.findIndex(n => String(n.id) === String(id));
    if (index === -1) throw new Error('Notifikasi tidak ditemukan');
    
    notifications[index] = { ...notifications[index], isRead: true };
    
    return {
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
      data: notifications[index]
    };
  },
  
  async markAllAsRead(userId: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      try {
        const response = await httpClient.patch<ApiResponse<void>>(`${endpoints.notifications}/read-all`);
        return response.data;
      } catch (e) {
        return { success: true, message: 'Gagal' };
      }
    }

    await mockDelay(500);
    
    notifications = notifications.map(n => {
      // Mark as read if it belongs to the user or is a global notification
      if (!n.userId || String(n.userId) === String(userId)) {
        return { ...n, isRead: true };
      }
      return n;
    });
    
    return {
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca'
    };
  },
  
  async getUnreadCount(userId: string | number): Promise<ApiResponse<{count: number}>> {
    if (isApiMode()) {
      try {
        // Optimistic, no distinct unread count endpoint in backend yet?
        // Let's just fetch notifications and count, or we can use the main fetch
        const response = await httpClient.get<ApiListResponse<any>>(endpoints.notifications, { params: { isRead: 'false' }});
        return {
          success: true,
          message: 'Berhasil',
          data: { count: response.data.meta.total }
        };
      } catch (e) {
        return { success: true, message: 'Gagal', data: { count: 0 } };
      }
    }

    await mockDelay(200);
    const count = notifications.filter(
      n => (!n.userId || String(n.userId) === String(userId)) && !n.isRead
    ).length;
    
    return {
      success: true,
      message: 'Jumlah notifikasi belum dibaca berhasil dimuat',
      data: { count }
    };
  }
};
