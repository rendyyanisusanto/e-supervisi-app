export class ClassroomMapper {
  static toFrontend(apiClassroom: any) {
    if (!apiClassroom) return {} as any;
    return {
      id: String(apiClassroom.id),
      name: apiClassroom.name,
      grade: apiClassroom.grade,
      major: apiClassroom.major,
      homeroomTeacherId: apiClassroom.homeroom_teacher_id ? String(apiClassroom.homeroom_teacher_id) : undefined,
      homeroomTeacherName: apiClassroom.homeroom_teacher?.name, // fallback or direct nested
      isActive: apiClassroom.is_active,
    };
  }

  static toApiPayload(frontendClassroom: any) {
    return {
      name: frontendClassroom.name,
      grade: frontendClassroom.grade,
      major: frontendClassroom.major,
      homeroom_teacher_id: frontendClassroom.homeroomTeacherId ? Number(frontendClassroom.homeroomTeacherId) : null,
      is_active: frontendClassroom.isActive,
    };
  }
}
