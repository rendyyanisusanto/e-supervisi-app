import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, QueryParams } from '../types/api';
import { mockDelay } from './mockDelay';

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  module: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const dummyLogs: AuditLog[] = [
  { id: '1', userName: 'Admin', action: 'LOGIN', module: 'Auth', description: 'User login sukses', createdAt: new Date().toISOString() },
  { id: '2', userName: 'Admin', action: 'CREATE_SUPERVISION', module: 'Supervisi', description: 'Membuat jadwal supervisi baru', createdAt: new Date().toISOString() },
];

export const auditLogService = {
  async getAuditLogs(query?: QueryParams): Promise<ApiListResponse<AuditLog>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.auditLogs, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          userName: l.user_name,
          action: l.action,
          module: l.module,
          description: l.description,
          ipAddress: l.ip_address,
          userAgent: l.user_agent,
          createdAt: l.created_at
        })),
        meta: response.data.meta
      };
    }

    await mockDelay(400);
    return {
      success: true,
      message: 'Log audit berhasil dimuat (Dummy)',
      data: dummyLogs,
      meta: { page: 1, limit: 10, total: dummyLogs.length, totalPages: 1 }
    };
  }
};
