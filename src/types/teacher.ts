import type { Role } from '../constants/roles';

export interface UserAccount {
  id?: string;
  username: string;
  email?: string;
  password?: string; // Optional, mostly for creation
  roles: Role[];
  isActive: boolean;
  lastLoginAt?: string | null;
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
  phone: string | null;
  mainSubjectId: string | null;
  mainSubjectName?: string;
  
  position: string;
  isActive: boolean;
  roles?: string[];
  userAccount?: UserAccount;
}
