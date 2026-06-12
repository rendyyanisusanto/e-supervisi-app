import { dummyClassrooms } from '../data/dummyClassrooms';
import { dummyTeachers } from '../data/dummyTeachers';
import type { Classroom } from '../types/classroom';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { CreateClassroomPayload, UpdateClassroomPayload } from '../types/dto/classroom.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { ClassroomMapper } from '../mappers/classroomMapper';

// Local state for dummy mode
let classrooms = [...dummyClassrooms];

export const classroomService = {
  async getClassrooms(query?: QueryParams): Promise<ApiListResponse<Classroom>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.classrooms, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(ClassroomMapper.toFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...classrooms];

    // Populate homeroom teacher names
    result = result.map(classroom => {
      if (classroom.homeroomTeacherId) {
        const teacher = dummyTeachers.find(t => String(t.id) === String(classroom.homeroomTeacherId));
        if (teacher) {
          return { ...classroom, homeroomTeacherName: teacher.name };
        }
      }
      return classroom;
    });

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'grade', 'major']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Classroom, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Data kelas berhasil dimuat',
      data,
      meta
    };
  },
  
  async getClassroomById(id: string | number): Promise<ApiResponse<Classroom>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.classrooms}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ClassroomMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    let classroom = classrooms.find(c => String(c.id) === String(id));
    if (!classroom) throw new Error('Kelas tidak ditemukan');
    
    if (classroom.homeroomTeacherId) {
      const teacher = dummyTeachers.find(t => String(t.id) === String(classroom?.homeroomTeacherId));
      if (teacher) {
        classroom = { ...classroom, homeroomTeacherName: teacher.name };
      }
    }
    
    return {
      success: true,
      message: 'Data kelas berhasil dimuat',
      data: classroom
    };
  },
  
  async createClassroom(payload: CreateClassroomPayload): Promise<ApiResponse<Classroom>> {
    if (isApiMode()) {
      const apiPayload = ClassroomMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.classrooms, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ClassroomMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const newClassroom: Classroom = {
      ...payload,
      id: Date.now().toString(),
      isActive: payload.isActive ?? true
    };
    
    classrooms.push(newClassroom);
    
    return {
      success: true,
      message: 'Kelas berhasil ditambahkan',
      data: newClassroom
    };
  },
  
  async updateClassroom(id: string | number, payload: UpdateClassroomPayload): Promise<ApiResponse<Classroom>> {
    if (isApiMode()) {
      const apiPayload = ClassroomMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.classrooms}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ClassroomMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = classrooms.findIndex(c => String(c.id) === String(id));
    if (index === -1) throw new Error('Kelas tidak ditemukan');
    
    classrooms[index] = { ...classrooms[index], ...payload } as Classroom;
    
    return {
      success: true,
      message: 'Kelas berhasil diperbarui',
      data: classrooms[index]
    };
  },
  
  async deleteClassroom(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.classrooms}/${id}`);
      return response.data;
    }

    await mockDelay(500);
    const index = classrooms.findIndex(c => String(c.id) === String(id));
    if (index === -1) throw new Error('Kelas tidak ditemukan');
    
    classrooms = classrooms.filter(c => String(c.id) !== String(id));
    
    return {
      success: true,
      message: 'Kelas berhasil dihapus'
    };
  },

  async toggleClassroomStatus(id: string | number): Promise<ApiResponse<Classroom>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.classrooms}/${id}/status`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ClassroomMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(400);
    const index = classrooms.findIndex(c => String(c.id) === String(id));
    if (index === -1) throw new Error('Kelas tidak ditemukan');
    
    classrooms[index].isActive = !classrooms[index].isActive;
    
    return {
      success: true,
      message: 'Status kelas berhasil diperbarui',
      data: classrooms[index]
    };
  }
};
