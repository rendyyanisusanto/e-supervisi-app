export type ReflectionStatus = 'BELUM_DIISI' | 'SUDAH_DIISI' | 'SUDAH_DIBACA';

export interface TeacherReflection {
  id: string;
  supervisionId: string;
  teacherId: string;
  strengthReflection: string;
  obstacleReflection: string;
  improvementPlan: string;
  supportNeeded: string;
  targetDate: string | null;
  status: ReflectionStatus;
  submittedAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}
