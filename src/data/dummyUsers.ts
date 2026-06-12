import { ROLES } from '../constants/roles';

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  position: string;
  avatar?: string;
}

export const dummyUsers: Record<string, User> = {
  admin: {
    id: '1',
    username: 'admin',
    role: ROLES.ADMIN,
    name: 'Administrator Sekolah',
    position: 'Admin Sistem',
  },
  kurikulum: {
    id: '2',
    username: 'kurikulum',
    role: ROLES.KURIKULUM,
    name: 'Rendy Yani Susanto',
    position: 'Waka Kurikulum',
  },
  penilai: {
    id: '3',
    username: 'penilai',
    role: ROLES.PENILAI,
    name: 'Siti Aminah, S.Pd',
    position: 'Penilai Supervisi',
  },
  guru: {
    id: '4',
    username: 'guru',
    role: ROLES.GURU,
    name: 'Ahmad Fauzi, S.Pd',
    position: 'Guru Informatika',
  }
};
