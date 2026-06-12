import type { Role } from '../constants/roles';

export interface UserAccount {
  username: string;
  password?: string; // Optional, mostly for creation
  roles: Role[];
  isActive: boolean;
}

export interface Teacher {
  id: string;
  photo?: string;
  name: string;
  nip: string;
  nuptk: string;
  nik: string;
  gender: 'L' | 'P';
  email: string;
  phone: string;
  mainSubjectId: string; // references Subject.id
  position: string;
  isActive: boolean;
  userAccount?: UserAccount;
}
