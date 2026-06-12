import { dummyScoreRanges } from '../data/dummyScoreRanges';
import type { ScoreRange } from '../types/scoreRange';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiResponse } from '../types/api';
import type { CreateScoreRangePayload, UpdateScoreRangePayload } from '../types/dto/scoreRange.dto';
import { ScoreRangeMapper } from '../mappers/scoreRangeMapper';

// Local state for dummy mode
let scoreRanges = [...dummyScoreRanges].sort((a, b) => b.minScore - a.minScore);

export const scoreRangeService = {
  async getScoreRanges(): Promise<ApiResponse<ScoreRange[]>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.scoreRanges);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(ScoreRangeMapper.toFrontend)
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    return {
      success: true,
      message: 'Data rentang nilai berhasil dimuat',
      data: scoreRanges
    };
  },
  
  async getScoreRangeById(id: string | number): Promise<ApiResponse<ScoreRange>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.scoreRanges}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ScoreRangeMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    const range = scoreRanges.find(s => String(s.id) === String(id));
    if (!range) throw new Error('Rentang nilai tidak ditemukan');
    
    return {
      success: true,
      message: 'Data rentang nilai berhasil dimuat',
      data: range
    };
  },
  
  async createScoreRange(payload: CreateScoreRangePayload): Promise<ApiResponse<ScoreRange>> {
    if (isApiMode()) {
      const apiPayload = ScoreRangeMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.scoreRanges, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ScoreRangeMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    
    // Validate overlap in dummy mode
    this.validateOverlap(payload.minScore, payload.maxScore);

    const newRange: ScoreRange = {
      ...payload,
      id: Date.now().toString(),
    };
    
    scoreRanges.push(newRange);
    scoreRanges.sort((a, b) => b.minScore - a.minScore);
    
    return {
      success: true,
      message: 'Rentang nilai berhasil ditambahkan',
      data: newRange
    };
  },
  
  async updateScoreRange(id: string | number, payload: UpdateScoreRangePayload): Promise<ApiResponse<ScoreRange>> {
    if (isApiMode()) {
      const apiPayload = ScoreRangeMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.scoreRanges}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: ScoreRangeMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = scoreRanges.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Rentang nilai tidak ditemukan');
    
    // If scores are updated, validate overlap
    if (payload.minScore !== undefined && payload.maxScore !== undefined) {
      this.validateOverlap(payload.minScore, payload.maxScore, String(id));
    }

    scoreRanges[index] = { ...scoreRanges[index], ...payload } as ScoreRange;
    scoreRanges.sort((a, b) => b.minScore - a.minScore);
    
    return {
      success: true,
      message: 'Rentang nilai berhasil diperbarui',
      data: scoreRanges[index]
    };
  },
  
  async deleteScoreRange(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.scoreRanges}/${id}`);
      return response.data;
    }

    await mockDelay(500);
    const index = scoreRanges.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Rentang nilai tidak ditemukan');
    
    scoreRanges = scoreRanges.filter(s => String(s.id) !== String(id));
    
    return {
      success: true,
      message: 'Rentang nilai berhasil dihapus'
    };
  },

  // Helper validation for dummy mode
  validateOverlap(minScore: number, maxScore: number, excludeId?: string) {
    const hasOverlap = scoreRanges.some(range => {
      if (excludeId && String(range.id) === excludeId) return false;
      return Math.max(minScore, range.minScore) <= Math.min(maxScore, range.maxScore);
    });

    if (hasOverlap) {
      throw new Error('Rentang nilai saling tumpang tindih dengan data yang sudah ada');
    }
  }
};
