import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import { mockDelay } from './mockDelay';
import type { ApiResponse, QueryParams } from '../types/api';
import { ReportMapper } from '../mappers/reportMapper';

import { dummyTeachers } from '../data/dummyTeachers';
import { dummySupervisions } from '../data/dummySupervisions';
import { dummyReflections } from '../data/dummyReflections';
import { calculateCompetencyByTeacher } from '../utils/competency';

export const reportService = {
  async getSupervisionRecap(query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.supervisionRecap, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReportMapper.toSupervisionRecap(response.data.data)
      };
    }
    await mockDelay(400);
    return { success: true, message: 'Dummy', data: {} };
  },

  async getTeacherReport(teacherId: number | string, query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.teacher(Number(teacherId)), { params: query });
      const mappedData = ReportMapper.toTeacherReport(response.data.data) as any;

      try {
        const compRes = await reportService.getTeacherCompetency(Number(teacherId), query);
        const { getStrongestAspects, getWeakestAspects } = await import('../utils/competency');
        const pId = query?.period_id || query?.periodId || '';
        
        if (compRes.success) {
          const aspects = compRes.data;
          const totalAspectScore = aspects.reduce((sum: number, a: any) => sum + a.finalScore, 0);
          const averageScore = aspects.length > 0 ? totalAspectScore / aspects.length : 0;
          
          mappedData.competency = {
            teacherId: String(teacherId),
            periodId: String(pId),
            aspects,
            strongestAspects: getStrongestAspects(aspects),
            weakestAspects: getWeakestAspects(aspects),
            averageScore
          };
        } else {
          mappedData.competency = {
            teacherId: String(teacherId), periodId: String(pId),
            aspects: [], strongestAspects: [], weakestAspects: [], averageScore: 0
          };
        }
      } catch (e) {
        const pId = query?.period_id || query?.periodId || '';
        mappedData.competency = {
          teacherId: String(teacherId), periodId: String(pId),
          aspects: [], strongestAspects: [], weakestAspects: [], averageScore: 0
        };
      }

      try {
        const { reflectionService } = await import('./reflectionService');
        const periodId = query?.period_id || query?.periodId;
        const refRes = await reflectionService.getReflections({ teacher_id: teacherId, period_id: periodId });
        if (refRes.success) {
          mappedData.reflections = refRes.data;
        } else {
          mappedData.reflections = [];
        }
      } catch (e) {
        mappedData.reflections = [];
      }

      mappedData.curriculumConclusion = 'Secara umum kinerja guru sudah baik, namun masih ada ruang untuk pengembangan terutama pada aspek pedagogik.';
      mappedData.curriculumRecommendation = 'Disarankan untuk mengikuti pelatihan lanjutan terkait metode pembelajaran aktif dan penggunaan teknologi dalam kelas.';

      return {
        success: response.data.success,
        message: response.data.message,
        data: mappedData
      };
    }
    await mockDelay(400);
    
    const teacher = dummyTeachers.find(t => String(t.id) === String(teacherId));
    if (!teacher) throw new Error('Guru tidak ditemukan');

    const supervisions = dummySupervisions.filter(s => s.teacherId === String(teacherId) && s.status === 'SELESAI');
    const competency = calculateCompetencyByTeacher(String(teacherId), '1', dummySupervisions);
    const reflections = dummyReflections.filter(r => r.teacherId === String(teacherId));

    const totalScore = supervisions.reduce((acc, s) => acc + (s.finalScore || 0), 0);
    const avgScore = supervisions.length > 0 ? totalScore / supervisions.length : 0;
    
    let status = 'Sangat Baik';
    if (avgScore < 70) status = 'Perlu Pembinaan';
    else if (avgScore < 80) status = 'Cukup';
    else if (avgScore < 90) status = 'Baik';

    const maxScore = Math.max(...supervisions.map(s => s.finalScore || 0), 0);
    const minScore = Math.min(...supervisions.map(s => s.finalScore || 100), 100);

    const data = {
      id: `rep-${Date.now()}`,
      reportNumber: `REP-${new Date().getFullYear()}-${String(teacherId).padStart(3, '0')}`,
      periodId: '1',
      teacherId: String(teacherId),
      teacher,
      summary: {
        totalSupervisions: supervisions.length,
        averageScore: avgScore,
        generalStatus: status,
        highestScore: supervisions.length > 0 ? maxScore : 0,
        lowestScore: supervisions.length > 0 ? minScore : 0,
        assessedInstruments: Array.from(new Set(supervisions.flatMap(s => s.instrumentIds)))
      },
      supervisions,
      competency,
      reflections,
      curriculumConclusion: 'Secara umum kinerja guru sudah baik, namun masih ada ruang untuk pengembangan terutama pada aspek pedagogik.',
      curriculumRecommendation: 'Disarankan untuk mengikuti pelatihan lanjutan terkait metode pembelajaran aktif dan penggunaan teknologi dalam kelas.',
      createdAt: new Date().toISOString()
    };

    return { success: true, message: 'Data rapor berhasil dimuat', data };
  },

  async getTeacherCompetency(teacherId: number, query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.teacherCompetency(teacherId), { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReportMapper.toCompetencyMap(response.data.data)
      };
    }
    await mockDelay(400);
    return { success: true, message: 'Dummy', data: [] };
  },

  async getWeaknessMap(query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.weaknessMap, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReportMapper.toWeaknessMap(response.data.data)
      };
    }
    await mockDelay(400);
    return { success: true, message: 'Dummy', data: {} };
  },

  async getBasicSummary(query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.basicSummary, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReportMapper.toBasicSummary(response.data.data)
      };
    }
    await mockDelay(400);
    const data = {
      summary: {
        total_teachers: dummyTeachers.length,
        total_supervisors: 2,
        total_instruments: 3,
        total_supervisions: dummySupervisions.length,
        total_completed: dummySupervisions.filter(s => s.status === 'SELESAI').length,
        average_score: 85.5
      },
      supervisions: dummySupervisions.map(s => ({
        id: s.id,
        teacher_name: dummyTeachers.find(t => t.id === s.teacherId)?.name || 'Guru',
        supervisor_name: 'Penilai',
        supervision_date: s.supervisionDate || s.createdAt,
        final_score: s.finalScore,
        kriteria: s.finalScore && s.finalScore >= 91 ? 'Sangat Baik' : (s.finalScore && s.finalScore >= 81 ? 'Baik' : 'Cukup'),
        status: s.status
      })),
      monthly_recap: [
        { month: 'Januari', total_supervisions: 3, completed: 2, scheduled: 0, draft: 1, average_score: 100, sangat_baik: 3, baik: 0, cukup: 0, kurang: 0 },
        { month: 'Februari', total_supervisions: 68, completed: 43, scheduled: 10, draft: 15, average_score: 70.55, sangat_baik: 49, baik: 3, cukup: 0, kurang: 0 },
        { month: 'Maret', total_supervisions: 65, completed: 54, scheduled: 5, draft: 6, average_score: 82.07, sangat_baik: 51, baik: 8, cukup: 0, kurang: 0 },
        { month: 'April', total_supervisions: 1, completed: 1, scheduled: 0, draft: 0, average_score: 95.04, sangat_baik: 1, baik: 0, cukup: 0, kurang: 0 }
      ]
    };
    return { success: true, message: 'Dummy', data: ReportMapper.toBasicSummary(data) };
  },

  async getIndicatorReport(query?: QueryParams): Promise<ApiResponse<any>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.reports.indicators, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: ReportMapper.toIndicatorReport(response.data.data)
      };
    }
    await mockDelay(400);
    return { success: true, message: 'Dummy', data: [] };
  }
};
