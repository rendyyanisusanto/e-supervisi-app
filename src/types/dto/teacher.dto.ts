export interface CreateTeacherPayload {
  name: string;
  nip?: string;
  nuptk?: string;
  nik?: string;
  gender?: 'L' | 'P';
  email?: string;
  phone: string;
  mainSubjectId?: number;
  position?: string;
  isActive: boolean;
  roles: string[];
  username?: string;
  password?: string;
}

export type UpdateTeacherPayload = Partial<Omit<CreateTeacherPayload, 'username' | 'password'>>;
