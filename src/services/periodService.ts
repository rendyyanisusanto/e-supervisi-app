import { dummyPeriods } from '../data/dummyPeriods';
import type { Period } from '../types/period';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { CreatePeriodPayload, UpdatePeriodPayload  } from '../types/dto/period.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { PeriodMapper } from '../mappers/periodMapper';

// Local state for dummy mode
let periods = [...dummyPeriods];

export const periodService = {
  async getPeriods(query?: QueryParams): Promise<ApiListResponse<Period>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.periods, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(PeriodMapper.toFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...periods];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'semester']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Period, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 100);

    return {
      success: true,
      message: 'Data periode berhasil dimuat',
      data,
      meta
    };
  },

  async getActivePeriod(): Promise<ApiResponse<Period | null>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.periods}/active`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: PeriodMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(300);
    const activePeriod = periods.find(p => p.isActive) || null;
    return {
      success: true,
      message: 'Data periode aktif berhasil dimuat',
      data: activePeriod
    };
  },
  
  async getPeriodById(id: string | number): Promise<ApiResponse<Period>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.periods}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: PeriodMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200, 400);
    const period = periods.find(p => String(p.id) === String(id));
    if (!period) throw new Error('Periode tidak ditemukan');
    
    return {
      success: true,
      message: 'Data periode berhasil dimuat',
      data: period
    };
  },
  
  async createPeriod(payload: CreatePeriodPayload): Promise<ApiResponse<Period>> {
    if (isApiMode()) {
      const apiPayload = PeriodMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.periods, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: PeriodMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    const newPeriod: Period = {
      ...payload,
      id: Date.now().toString(),
      semester: payload.name.includes('Ganjil') ? 'Ganjil' : 'Genap'
    };
    
    if (payload.isActive) {
      periods = periods.map(p => ({ ...p, isActive: false }));
    }
    
    periods.push(newPeriod);
    
    return {
      success: true,
      message: 'Periode berhasil ditambahkan',
      data: newPeriod
    };
  },
  
  async updatePeriod(id: string | number, payload: UpdatePeriodPayload): Promise<ApiResponse<Period>> {
    if (isApiMode()) {
      const apiPayload = PeriodMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.periods}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: PeriodMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    const index = periods.findIndex(p => String(p.id) === String(id));
    if (index === -1) throw new Error('Periode tidak ditemukan');
    
    if (payload.isActive) {
      periods = periods.map(p => ({ ...p, isActive: false }));
    }
    
    periods[index] = { ...periods[index], ...payload } as Period;
    
    return {
      success: true,
      message: 'Periode berhasil diperbarui',
      data: periods[index]
    };
  },
  
  async deletePeriod(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.periods}/${id}`);
      return response.data;
    }

    await mockDelay(600);
    const index = periods.findIndex(p => String(p.id) === String(id));
    if (index === -1) throw new Error('Periode tidak ditemukan');
    
    if (periods[index].isActive) throw new Error('Tidak dapat menghapus periode aktif');
    
    periods = periods.filter(p => String(p.id) !== String(id));
    
    return {
      success: true,
      message: 'Periode berhasil dihapus'
    };
  },

  async setActivePeriod(id: string | number): Promise<ApiResponse<Period>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.periods}/${id}/activate`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: PeriodMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = periods.findIndex(p => String(p.id) === String(id));
    if (index === -1) throw new Error('Periode tidak ditemukan');
    
    periods = periods.map(p => ({ ...p, isActive: false }));
    periods[index].isActive = true;
    
    return {
      success: true,
      message: 'Periode berhasil diaktifkan',
      data: periods[index]
    };
  }
};
