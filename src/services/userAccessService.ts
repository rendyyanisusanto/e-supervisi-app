import type { UserAccess } from '../types/userAccess';
import { teacherService } from './teacherService';
import { mockDelay } from './mockDelay';
import type { Role } from '../constants/roles';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import { paginateArray, filterBySearch } from '../utils/pagination';

export const userAccessService = {
  async getUsers(query?: QueryParams): Promise<ApiListResponse<UserAccess>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<UserAccess>>(endpoints.settings.users, { params: query });
      return response.data;
    }

    // For dummy purposes, we fetch teachers and map them
    const teachersRes = await teacherService.getTeachers();
    let result = teachersRes.data.map(t => ({
      ...t,
      lastLogin: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString() // Random date within last 5 days
    }));

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'nip', 'name']);
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 100);

    return {
      success: true,
      message: 'Data pengguna berhasil dimuat',
      data,
      meta
    };
  },

  async updateUserRoles(userId: string | number, roles: string[]): Promise<ApiResponse<UserAccess>> {
    if (isApiMode()) {
      const response = await httpClient.put<ApiResponse<UserAccess>>(`${endpoints.settings.users}/${userId}/roles`, { roles });
      return response.data;
    }

    await mockDelay(500);
    // Use teacherService to update the userAccount embedded in teacher
    const teachersRes = await teacherService.getTeachers();
    const teacher = teachersRes.data.find(t => String(t.id) === String(userId));
    if (!teacher) throw new Error('User not found');
    
    if (!teacher.userAccount) {
      teacher.userAccount = { username: `user_${userId}`, roles: roles as Role[], isActive: true };
    } else {
      teacher.userAccount.roles = roles as Role[];
    }
    
    const updatedRes = await teacherService.updateTeacher(userId, { userAccount: teacher.userAccount } as any);
    const userAccess: UserAccess = { ...updatedRes.data, lastLogin: new Date().toISOString() } as UserAccess;
    
    return {
      success: true,
      message: 'Hak akses berhasil diperbarui',
      data: userAccess
    };
  },

  async toggleUserStatus(userId: string | number): Promise<ApiResponse<UserAccess>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<UserAccess>>(`${endpoints.settings.users}/${userId}/toggle-status`);
      return response.data;
    }

    await mockDelay(400);
    const teachersRes = await teacherService.getTeachers();
    const teacher = teachersRes.data.find(t => String(t.id) === String(userId));
    if (!teacher || !teacher.userAccount) throw new Error('User account not found');
    
    teacher.userAccount.isActive = !teacher.userAccount.isActive;
    const updatedRes = await teacherService.updateTeacher(userId, { userAccount: teacher.userAccount } as any);
    const userAccess: UserAccess = { ...updatedRes.data } as UserAccess;

    return {
      success: true,
      message: `Status akun berhasil di${teacher.userAccount.isActive ? 'aktifkan' : 'nonaktifkan'}`,
      data: userAccess
    };
  },

  async resetPassword(userId: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<void>>(`${endpoints.settings.users}/${userId}/reset-password`);
      return response.data;
    }

    await mockDelay(800);
    // In a real app, this would call an API endpoint to reset password
    // Here we just mock the delay.
    return {
      success: true,
      message: 'Password berhasil direset (dummy mode)'
    };
  }
};
