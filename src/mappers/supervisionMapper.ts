import type { Supervision, SupervisionItem } from '../types/supervision';
import type {
  CreateSupervisionPayload,
  SaveSupervisionDraftPayload,
  SubmitSupervisionPayload
} from '../types/dto/supervision.dto';

export const SupervisionMapper = {
  toSupervisionItemDto(apiData: any): SupervisionItem {
    return {
      id: apiData.id,
      supervisionId: apiData.supervisionId || apiData.supervision_id,
      instrumentItemId: apiData.instrumentItemId || apiData.instrument_item_id,
      instrumentName: apiData.instrumentName || apiData.instrument_name,
      itemCategory: apiData.itemCategory || apiData.item_category,
      itemCode: apiData.itemCode || apiData.item_code,
      itemDescription: apiData.itemDescription || apiData.item_description,
      maxScore: apiData.maxScore || apiData.max_score,
      score: apiData.score,
      itemStatus: apiData.itemStatus || apiData.item_status,
      note: apiData.note
    };
  },

  toSupervisionDto(apiData: any): Supervision {
    return {
      id: apiData.id,
      periodId: apiData.periodId || apiData.period_id,
      teacherId: apiData.teacherId || apiData.teacher_id,
      supervisorId: apiData.supervisorId || apiData.supervisor_id,
      instrumentIds: apiData.instrument_id ? [String(apiData.instrument_id)] : (apiData.instrumentIds || []),
      instrumentId: apiData.instrumentId || apiData.instrument_id,
      subjectId: apiData.subjectId || apiData.subject_id,
      classroomId: apiData.classroomId || apiData.classroom_id,
      
      supervisionType: apiData.supervisionType || apiData.supervision_type,
      status: apiData.status,
      
      scheduledDate: apiData.scheduledDate || apiData.scheduled_date,
      scheduledTime: apiData.scheduledTime || apiData.scheduled_time,
      supervisionDate: apiData.supervisionDate || apiData.supervision_date,
      location: apiData.location,
      initialNote: apiData.initialNote || apiData.initial_note,

      totalScore: apiData.totalScore || apiData.total_score,
      maxScore: apiData.maxScore || apiData.max_score,
      finalScore: apiData.finalScore || apiData.final_score,
      finalStatus: apiData.finalStatus || apiData.final_status,

      strengthNote: apiData.strengthNote || apiData.strength_note,
      improvementNote: apiData.improvementNote || apiData.improvement_note,
      generalNote: apiData.generalNote || apiData.general_note,
      recommendationNote: apiData.recommendationNote || apiData.recommendation_note,
      conclusionNote: apiData.conclusionNote || apiData.conclusion_note,

      submittedAt: apiData.submittedAt || apiData.submitted_at,
      createdAt: apiData.createdAt || apiData.created_at,
      updatedAt: apiData.updatedAt || apiData.updated_at,

      items: apiData.items ? apiData.items.map((i: any) => SupervisionMapper.toSupervisionItemDto(i)) : []
    };
  },

  toCreateApiPayload(payload: any): any {
    return {
      period_id: payload.periodId ? Number(payload.periodId) : undefined,
      teacher_id: payload.teacherId ? Number(payload.teacherId) : undefined,
      supervisor_id: payload.supervisorId ? Number(payload.supervisorId) : undefined,
      instrument_ids: payload.instrumentIds ? payload.instrumentIds.map(Number) : undefined,
      subject_id: payload.subjectId ? Number(payload.subjectId) : undefined,
      classroom_id: payload.classroomId ? Number(payload.classroomId) : undefined,
      supervision_type: payload.supervisionType,
      scheduled_date: payload.scheduledDate,
      scheduled_time: payload.scheduledTime,
      supervision_date: payload.supervisionDate,
      location: payload.location,
      initial_note: payload.initialNote
    };
  },

  toDraftApiPayload(payload: SaveSupervisionDraftPayload): any {
    return {
      items: payload.items.map(item => ({
        supervision_item_id: item.supervisionItemId,
        score: item.score,
        note: item.note
      })),
      strength_note: payload.strengthNote,
      improvement_note: payload.improvementNote,
      general_note: payload.generalNote,
      recommendation_note: payload.recommendationNote,
      conclusion_note: payload.conclusionNote
    };
  },

  toFinalApiPayload(payload: SubmitSupervisionPayload): any {
    return {
      items: payload.items.map(item => ({
        supervision_item_id: item.supervisionItemId,
        score: item.score,
        note: item.note
      })),
      strength_note: payload.strengthNote,
      improvement_note: payload.improvementNote,
      general_note: payload.generalNote,
      recommendation_note: payload.recommendationNote,
      conclusion_note: payload.conclusionNote
    };
  }
};
