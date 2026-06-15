export class TeacherMapper {
  static toFrontend(apiTeacher: any) {
    if (!apiTeacher) return {} as any;
    return {
      id: String(apiTeacher.id),
      name: apiTeacher.name,
      nip: apiTeacher.nip,
      nuptk: apiTeacher.nuptk,
      nik: apiTeacher.nik,
      gender: apiTeacher.gender,
      email: apiTeacher.email,
      phone: apiTeacher.phone,
      mainSubjectId: apiTeacher.main_subject_id ? String(apiTeacher.main_subject_id) : undefined,
      mainSubjectName: apiTeacher.mainSubject?.name,
      position: apiTeacher.position,
      isActive: apiTeacher.is_active,
      photo: apiTeacher.photo,
      // For User Account logic
      userAccount: apiTeacher.userAccount ? {
        id: String(apiTeacher.userAccount.id),
        username: apiTeacher.userAccount.username,
        email: apiTeacher.userAccount.email,
        isActive: apiTeacher.userAccount.is_active,
        roles: apiTeacher.userAccount.roles || [],
        lastLoginAt: apiTeacher.userAccount.last_login_at,
      } : undefined,
      roles: apiTeacher.userAccount?.roles || [],
    };
  }

  static toApiPayload(frontendTeacher: any) {
    return {
      name: frontendTeacher.name,
      nip: frontendTeacher.nip,
      nuptk: frontendTeacher.nuptk,
      nik: frontendTeacher.nik,
      gender: frontendTeacher.gender,
      email: frontendTeacher.email,
      phone: frontendTeacher.phone,
      main_subject_id: frontendTeacher.mainSubjectId ? Number(frontendTeacher.mainSubjectId) : null,
      position: frontendTeacher.position,
      is_active: frontendTeacher.isActive,
      // User account info if provided on create
      username: frontendTeacher.userAccount?.username,
      password: frontendTeacher.userAccount?.password,
      roles: frontendTeacher.roles,
    };
  }
}
