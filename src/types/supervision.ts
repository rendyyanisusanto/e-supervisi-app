export interface SupervisionItem {
  id: string;
  supervisionId: string;
  instrumentItemId: string;
  instrumentName?: string;

  itemCategory: string;
  itemCode: string;
  itemDescription: string;

  maxScore: number;
  score: number | null;
  itemStatus: string | null;
  note: string;
}

export interface Supervision {
  id: string;
  periodId: string;
  teacherId: string;
  supervisorId: string;
  instrumentIds: string[];
  subjectId?: string;
  classroomId?: string;

  supervisionType: 'LANGSUNG' | 'TERJADWAL';
  status: 'TERJADWAL' | 'DRAFT' | 'SELESAI' | 'DIBATALKAN';

  scheduledDate?: string;
  scheduledTime?: string;
  supervisionDate?: string;
  location?: string;

  initialNote?: string;

  totalScore: number;
  maxScore: number;
  finalScore: number;
  finalStatus: string;

  strengthNote?: string;
  improvementNote?: string;
  generalNote?: string;
  recommendationNote?: string;
  conclusionNote?: string;

  submittedAt?: string;
  createdAt: string;
  updatedAt: string;

  items: SupervisionItem[];
}
