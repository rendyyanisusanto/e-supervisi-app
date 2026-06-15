import { dummyTeachers } from '../data/dummyTeachers';
import { dummySubjects } from '../data/dummySubjects';
import type { Teacher } from '../types/teacher';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { CreateTeacherPayload, UpdateTeacherPayload } from '../types/dto/teacher.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { TeacherMapper } from '../mappers/teacherMapper';

// Local state for dummy mode
let teachers = [...dummyTeachers];

export const teacherService = {
  async getTeachers(query?: QueryParams): Promise<ApiListResponse<Teacher>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.teachers, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(TeacherMapper.toFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...teachers];

    // Populate main subject names
    result = result.map(teacher => {
      if (teacher.mainSubjectId) {
        const subject = dummySubjects.find(s => String(s.id) === String(teacher.mainSubjectId));
        if (subject) {
          return { ...teacher, mainSubjectName: subject.name };
        }
      }
      return teacher;
    });

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'nip', 'nik', 'email']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Teacher, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Data guru berhasil dimuat',
      data,
      meta
    };
  },
  
  async getTeacherById(id: string | number): Promise<ApiResponse<Teacher>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.teachers}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: TeacherMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    let teacher = teachers.find(t => String(t.id) === String(id));
    if (!teacher) throw new Error('Guru tidak ditemukan');
    
    if (teacher.mainSubjectId) {
      const subject = dummySubjects.find(s => String(s.id) === String(teacher?.mainSubjectId));
      if (subject) {
        teacher = { ...teacher, mainSubjectName: subject.name };
      }
    }
    
    return {
      success: true,
      message: 'Data guru berhasil dimuat',
      data: teacher
    };
  },
  
  async createTeacher(payload: CreateTeacherPayload): Promise<ApiResponse<Teacher>> {
    if (isApiMode()) {
      const apiPayload = TeacherMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.teachers, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: TeacherMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    const newTeacher: Teacher = {
      ...payload,
      id: Date.now().toString(),
      mainSubjectId: payload.mainSubjectId ? String(payload.mainSubjectId) : null,
      isActive: payload.isActive ?? true,
      roles: payload.roles || ['GURU']
    } as Teacher;
    
    teachers.push(newTeacher);
    
    return {
      success: true,
      message: 'Guru berhasil ditambahkan',
      data: newTeacher
    };
  },
  
  async updateTeacher(id: string | number, payload: UpdateTeacherPayload): Promise<ApiResponse<Teacher>> {
    if (isApiMode()) {
      const apiPayload = TeacherMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.teachers}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: TeacherMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');
    
    teachers[index] = { ...teachers[index], ...payload } as Teacher;
    
    return {
      success: true,
      message: 'Guru berhasil diperbarui',
      data: teachers[index]
    };
  },
  
  async deleteTeacher(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.teachers}/${id}`);
      return response.data;
    }

    await mockDelay(600);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');
    
    teachers = teachers.filter(t => String(t.id) !== String(id));
    
    return {
      success: true,
      message: 'Guru berhasil dihapus'
    };
  },

  async toggleTeacherStatus(id: string | number): Promise<ApiResponse<Teacher>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.teachers}/${id}/status`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: TeacherMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(400);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');
    
    teachers[index].isActive = !teachers[index].isActive;
    
    return {
      success: true,
      message: 'Status guru berhasil diperbarui',
      data: teachers[index]
    };
  },

  async updateTeacherRoles(id: string | number, payload: any): Promise<ApiResponse<Teacher>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.teachers}/${id}/roles`, { roles: payload.roles });
      return {
        success: response.data.success,
        message: response.data.message,
        data: TeacherMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');

    teachers[index].roles = payload.roles;
    if (teachers[index].userAccount) {
      teachers[index].userAccount!.roles = payload.roles;
    }

    return {
      success: true,
      message: 'Hak akses berhasil diperbarui',
      data: teachers[index]
    };
  },

  async resetPassword(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<void>>(`${endpoints.teachers}/${id}/reset-password`);
      return response.data;
    }

    await mockDelay(600);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');

    return {
      success: true,
      message: 'Password berhasil direset ke default'
    };
  },

  async uploadTeacherPhoto(id: string | number, file: File): Promise<ApiResponse<{ photo: string }>> {
    if (isApiMode()) {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.teachers}/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    await mockDelay(1000);
    const index = teachers.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Guru tidak ditemukan');

    // Mock photo path
    const mockPhotoPath = URL.createObjectURL(file);
    teachers[index].photo = mockPhotoPath;

    return {
      success: true,
      message: 'Foto guru berhasil diupload (Dummy)',
      data: { photo: mockPhotoPath }
    };
  }
};
