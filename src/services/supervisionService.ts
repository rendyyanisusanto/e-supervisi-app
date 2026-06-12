import { dummySupervisions } from '../data/dummySupervisions';
import { dummyInstruments } from '../data/dummyInstruments';
import type { Supervision } from '../types/supervision';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { CreateSupervisionPayload, UpdateSupervisionPayload, RescheduleSupervisionPayload, SaveSupervisionDraftPayload, SubmitSupervisionPayload, EvaluateSupervisionPayload } from '../types/dto/supervision.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { SupervisionMapper } from '../mappers/supervisionMapper';

let supervisions = [...dummySupervisions];

export const supervisionService = {
  async getSupervisions(query?: QueryParams): Promise<ApiListResponse<Supervision>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.supervisions.base, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map((d: any) => SupervisionMapper.toSupervisionDto(d)),
        meta: response.data.meta
      };
    }

    await mockDelay(400);
    let result = [...supervisions];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['supervisionType', 'status', 'teacherId', 'supervisorId']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Supervision, query.sortOrder || 'desc');
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 100);

    return {
      success: true,
      message: 'Data supervisi berhasil dimuat',
      data,
      meta
    };
  },

  async getSupervisionById(id: string | number): Promise<ApiResponse<Supervision>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.supervisions.base}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SupervisionMapper.toSupervisionDto(response.data.data)
      };
    }

    await mockDelay(200);
    const supervision = supervisions.find(s => String(s.id) === String(id));
    if (!supervision) throw new Error('Data supervisi tidak ditemukan');

    return {
      success: true,
      message: 'Data supervisi berhasil dimuat',
      data: JSON.parse(JSON.stringify(supervision))
    };
  },

  async createSupervision(payload: CreateSupervisionPayload): Promise<ApiResponse<Supervision>> {
    if (isApiMode()) {
      const mappedPayload = SupervisionMapper.toCreateApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.supervisions.base, mappedPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SupervisionMapper.toSupervisionDto(response.data.data)
      };
    }

    await mockDelay(600);
    const instrumentId = payload.instrumentId || (payload as any).instrumentIds?.[0]; // Fallback if dummy still used array
    if (!instrumentId) throw new Error('Instrumen harus dipilih');

    const selectedInstrument = dummyInstruments.find(i => String(i.id) === String(instrumentId));
    if (!selectedInstrument) throw new Error('Instrumen tidak ditemukan');

    const newSupervision: Supervision = {
      id: `SUP-${Date.now()}`,
      periodId: String(payload.periodId),
      teacherId: String(payload.teacherId),
      supervisorId: String(payload.supervisorId),
      instrumentId: String(instrumentId),
      subjectId: payload.subjectId ? String(payload.subjectId) : undefined,
      classroomId: payload.classroomId ? String(payload.classroomId) : undefined,
      supervisionType: payload.supervisionType || 'LANGSUNG',
      status: payload.supervisionType === 'LANGSUNG' ? 'DRAFT' : 'TERJADWAL',
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      supervisionDate: payload.supervisionDate,
      location: payload.location,
      initialNote: payload.initialNote,
      totalScore: 0,
      maxScore: 0,
      finalScore: 0,
      finalStatus: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: []
    };

    let itemIndex = 0;
    (selectedInstrument.items || []).forEach((item) => {
      newSupervision.items.push({
        id: `item-${Date.now()}-${itemIndex++}`,
        supervisionId: newSupervision.id,
        instrumentItemId: String(item.id),
        itemCategory: item.category,
        itemCode: item.code,
        itemDescription: item.description,
        maxScore: item.maxScore,
        score: null,
        itemStatus: null,
        note: ''
      });
    });

    supervisions.unshift(newSupervision);
    
    return {
      success: true,
      message: 'Jadwal supervisi berhasil dibuat',
      data: newSupervision
    };
  },

  async updateSchedule(id: string | number, payload: RescheduleSupervisionPayload): Promise<ApiResponse<Supervision>> {
    if (isApiMode()) {
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.supervisions.base}/${id}/schedule`, payload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SupervisionMapper.toSupervisionDto(response.data.data)
      };
    }

    await mockDelay(600);
    const index = supervisions.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Supervisi tidak ditemukan');

    supervisions[index] = {
      ...supervisions[index],
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      location: payload.location,
      initialNote: payload.initialNote,
      updatedAt: new Date().toISOString()
    } as Supervision;
    
    return {
      success: true,
      message: 'Jadwal supervisi berhasil diperbarui',
      data: supervisions[index]
    };
  },

  async saveDraft(id: string | number, payload: SaveSupervisionDraftPayload): Promise<ApiResponse<Supervision>> {
    if (isApiMode()) {
      const mappedPayload = SupervisionMapper.toDraftApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.supervisions.base}/${id}/draft`, mappedPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SupervisionMapper.toSupervisionDto(response.data.data)
      };
    }

    await mockDelay(800);
    const index = supervisions.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Supervisi tidak ditemukan');
    const sup = supervisions[index];
    
    payload.items.forEach(evalData => {
      const item = sup.items.find(i => String(i.id) === String(evalData.supervisionItemId));
      if (item) {
        item.score = evalData.score;
        item.note = evalData.note;
      }
    });

    sup.strengthNote = payload.strengthNote;
    sup.improvementNote = payload.improvementNote;
    sup.generalNote = payload.generalNote;
    sup.recommendationNote = payload.recommendationNote;
    sup.conclusionNote = payload.conclusionNote;
    sup.status = 'DRAFT';
    sup.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: 'Draft berhasil disimpan',
      data: sup
    };
  },

  async submitFinal(id: string | number, payload: SubmitSupervisionPayload): Promise<ApiResponse<Supervision>> {
    if (isApiMode()) {
      const mappedPayload = SupervisionMapper.toFinalApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.supervisions.base}/${id}/submit`, mappedPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SupervisionMapper.toSupervisionDto(response.data.data)
      };
    }

    await mockDelay(800);
    const index = supervisions.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Supervisi tidak ditemukan');
    const sup = supervisions[index];
    
    payload.items.forEach(evalData => {
      const item = sup.items.find(i => String(i.id) === String(evalData.supervisionItemId));
      if (item) {
        item.score = evalData.score;
        item.note = evalData.note;
      }
    });

    sup.strengthNote = payload.strengthNote;
    sup.improvementNote = payload.improvementNote;
    sup.generalNote = payload.generalNote;
    sup.recommendationNote = payload.recommendationNote;
    sup.conclusionNote = payload.conclusionNote;

    let totalScore = 0;
    let maxScore = 0;
    
    sup.items.forEach(item => {
      maxScore += item.maxScore;
      if (item.score !== null && item.score !== undefined) {
        totalScore += item.score;
      }
    });

    sup.totalScore = totalScore;
    sup.maxScore = maxScore;
    sup.finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    if (sup.finalScore >= 90) sup.finalStatus = 'Amat Baik';
    else if (sup.finalScore >= 80) sup.finalStatus = 'Baik';
    else if (sup.finalScore >= 70) sup.finalStatus = 'Cukup';
    else sup.finalStatus = 'Kurang';

    sup.status = 'SELESAI';
    sup.supervisionDate = payload.supervisionDate || new Date().toISOString().split('T')[0];
    sup.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: 'Penilaian final berhasil disubmit',
      data: sup
    };
  },

  async cancelSupervision(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<void>>(`${endpoints.supervisions.base}/${id}/cancel`);
      return response.data;
    }

    await mockDelay(500);
    const index = supervisions.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Supervisi tidak ditemukan');

    if (supervisions[index].status === 'SELESAI') {
      throw new Error('Tidak dapat membatalkan supervisi yang sudah selesai');
    }

    supervisions[index].status = 'DIBATALKAN';
    return {
      success: true,
      message: 'Jadwal supervisi berhasil dibatalkan'
    };
  }
};
