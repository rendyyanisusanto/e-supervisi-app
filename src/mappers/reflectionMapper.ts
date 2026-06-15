import type { UpdateReflectionPayload as SubmitReflectionPayload } from '../types/dto/reflection.dto';
import type { TeacherReflection as ReflectionDto } from '../types/reflection';

export const ReflectionMapper = {
  toReflectionDto(apiData: any): ReflectionDto {
    return {
      id: apiData.id,
      supervisionId: apiData.supervisionId || apiData.supervision_id,
      teacherId: apiData.teacherId || apiData.teacher_id,
      strengthReflection: apiData.strengthReflection || apiData.strength_reflection,
      obstacleReflection: apiData.obstacleReflection || apiData.obstacle_reflection,
      improvementPlan: apiData.improvementPlan || apiData.improvement_plan,
      supportNeeded: apiData.supportNeeded || apiData.support_needed,
      targetDate: apiData.targetDate || apiData.target_date,
      status: apiData.status,
      submittedAt: apiData.submittedAt || apiData.submitted_at,
      readAt: apiData.readAt || apiData.read_at,
      createdAt: apiData.createdAt || apiData.created_at,
      updatedAt: apiData.updatedAt || apiData.updated_at,

    };
  },

  toSubmitApiPayload(payload: SubmitReflectionPayload): any {
    return {
      strength_reflection: payload.strengthReflection,
      obstacle_reflection: payload.obstacleReflection,
      improvement_plan: payload.improvementPlan,
      support_needed: payload.supportNeeded,
      target_date: payload.targetDate
    };
  }
};
