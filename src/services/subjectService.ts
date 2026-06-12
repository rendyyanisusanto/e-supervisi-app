import { dummySubjects } from '../data/dummySubjects';
import type { Subject } from '../types/subject';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { CreateSubjectPayload, UpdateSubjectPayload } from '../types/dto/subject.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { SubjectMapper } from '../mappers/subjectMapper';

// Local state for dummy mode
let subjects = [...dummySubjects];

export const subjectService = {
  async getSubjects(query?: QueryParams): Promise<ApiListResponse<Subject>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.subjects, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(SubjectMapper.toFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...subjects];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'code']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Subject, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Data mata pelajaran berhasil dimuat',
      data,
      meta
    };
  },
  
  async getSubjectById(id: string | number): Promise<ApiResponse<Subject>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.subjects}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SubjectMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    const subject = subjects.find(s => String(s.id) === String(id));
    if (!subject) throw new Error('Mata pelajaran tidak ditemukan');
    
    return {
      success: true,
      message: 'Data mata pelajaran berhasil dimuat',
      data: subject
    };
  },
  
  async createSubject(payload: CreateSubjectPayload): Promise<ApiResponse<Subject>> {
    if (isApiMode()) {
      const apiPayload = SubjectMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.subjects, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SubjectMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const newSubject: Subject = {
      ...payload,
      id: Date.now().toString(),
      isActive: payload.isActive ?? true
    };
    
    subjects.push(newSubject);
    
    return {
      success: true,
      message: 'Mata pelajaran berhasil ditambahkan',
      data: newSubject
    };
  },
  
  async updateSubject(id: string | number, payload: UpdateSubjectPayload): Promise<ApiResponse<Subject>> {
    if (isApiMode()) {
      const apiPayload = SubjectMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.subjects}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SubjectMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = subjects.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Mata pelajaran tidak ditemukan');
    
    subjects[index] = { ...subjects[index], ...payload } as Subject;
    
    return {
      success: true,
      message: 'Mata pelajaran berhasil diperbarui',
      data: subjects[index]
    };
  },
  
  async deleteSubject(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.subjects}/${id}`);
      return response.data;
    }

    await mockDelay(500);
    const index = subjects.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Mata pelajaran tidak ditemukan');
    
    subjects = subjects.filter(s => String(s.id) !== String(id));
    
    return {
      success: true,
      message: 'Mata pelajaran berhasil dihapus'
    };
  },

  async toggleSubjectStatus(id: string | number): Promise<ApiResponse<Subject>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.subjects}/${id}/status`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SubjectMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(400);
    const index = subjects.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Mata pelajaran tidak ditemukan');
    
    subjects[index].isActive = !subjects[index].isActive;
    
    return {
      success: true,
      message: 'Status mata pelajaran berhasil diperbarui',
      data: subjects[index]
    };
  }
};
