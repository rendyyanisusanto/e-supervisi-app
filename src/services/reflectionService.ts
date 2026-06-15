import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import { mockDelay } from './mockDelay';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { UpdateReflectionPayload as SubmitReflectionPayload } from '../types/dto/reflection.dto';
import type { TeacherReflection as ReflectionDto } from '../types/reflection';
import { ReflectionMapper } from '../mappers/reflectionMapper';

export const reflectionService = {
  async getReflections(query?: QueryParams): Promise<ApiListResponse<ReflectionDto>> {
    if (isApiMode()) {
      const response = await httpClient.get<any>(endpoints.reflections, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map((d: any) => ReflectionMapper.toReflectionDto(d)),
        meta: response.data.meta
      };
    }
    await mockDelay(400);
    return { success: true, message: 'Dummy mode', data: [], meta: { page: 1, totalPages: 1, limit: 10, total: 0 } };
  },

  async getReflectionBySupervisionId(supervisionId: string | number): Promise<ApiResponse<ReflectionDto>> {
    if (isApiMode()) {
      const response = await httpClient.get<any>(`${endpoints.reflections}/supervision/${supervisionId}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data ? ReflectionMapper.toReflectionDto(response.data.data) : null as any
      };
    }
    await mockDelay(300);
    return { success: true, message: 'Dummy mode', data: null as any };
  },

  async submitReflection(supervisionId: string | number, payload: SubmitReflectionPayload): Promise<ApiResponse<ReflectionDto>> {
    if (isApiMode()) {
      const mapped = ReflectionMapper.toSubmitApiPayload(payload);
      const response = await httpClient.post<any>(`${endpoints.reflections}/supervision/${supervisionId}`, mapped);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReflectionMapper.toReflectionDto(response.data.data)
      };
    }
    await mockDelay(500);
    return { success: true, message: 'Dummy save', data: payload as any };
  },

  async markAsRead(id: string | number): Promise<ApiResponse<ReflectionDto>> {
    if (isApiMode()) {
      const response = await httpClient.patch<any>(`${endpoints.reflections}/${id}/read`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReflectionMapper.toReflectionDto(response.data.data)
      };
    }
    await mockDelay(300);
    return { success: true, message: 'Dummy mark as read', data: null as any };
  }
};
