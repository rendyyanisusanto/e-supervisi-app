export interface TeacherReflectionPayload {
  strengthReflection: string;
  obstacleReflection: string;
  improvementPlan: string;
  supportNeeded?: string;
  targetDate?: string;
}

export type UpdateReflectionPayload = Partial<TeacherReflectionPayload>;
