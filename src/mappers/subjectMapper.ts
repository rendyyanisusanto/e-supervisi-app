export class SubjectMapper {
  static toFrontend(apiSubject: any) {
    if (!apiSubject) return {} as any;
    return {
      id: String(apiSubject.id),
      code: apiSubject.code,
      name: apiSubject.name,
      groupName: apiSubject.group_name,
      isActive: apiSubject.is_active,
    };
  }

  static toApiPayload(frontendSubject: any) {
    return {
      code: frontendSubject.code,
      name: frontendSubject.name,
      group_name: frontendSubject.groupName,
      is_active: frontendSubject.isActive,
    };
  }
}
