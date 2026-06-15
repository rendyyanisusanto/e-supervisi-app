export interface CreateSupervisionPayload {
  periodId: number;
  teacherId: number;
  supervisorId: number;
  instrumentIds: number[];
  subjectId?: number;
  classroomId?: number;
  supervisionType: 'LANGSUNG' | 'TERJADWAL';
  scheduledDate?: string;
  scheduledTime?: string;
  supervisionDate?: string;
  location?: string;
  initialNote?: string;
}

export interface SaveSupervisionDraftPayload {
  items: {
    supervisionItemId: number;
    score: number | null;
    note?: string;
  }[];
  strengthNote?: string;
  improvementNote?: string;
  generalNote?: string;
  recommendationNote?: string;
  conclusionNote?: string;
  supervisionDate?: string;
}

export type SubmitSupervisionPayload = SaveSupervisionDraftPayload;

export interface RescheduleSupervisionPayload {
  scheduledDate: string;
  scheduledTime: string;
  location?: string;
  initialNote?: string;
}

export type UpdateSupervisionPayload = Partial<CreateSupervisionPayload>;

export type EvaluateSupervisionPayload = SubmitSupervisionPayload;
