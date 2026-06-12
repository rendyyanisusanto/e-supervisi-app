import type { Teacher } from './teacher';

export interface UserAccess extends Teacher {
  // Extending teacher for user access view specific details if needed
  lastLogin?: string;
}

export interface RoleMatrix {
  menu: string;
  admin: boolean;
  kurikulum: boolean;
  penilai: boolean;
  guru: boolean;
}
