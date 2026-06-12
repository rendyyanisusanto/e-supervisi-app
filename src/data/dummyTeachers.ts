import type { Teacher } from '../types/teacher';
import { ROLES } from '../constants/roles';

export const dummyTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Rendy Yani Susanto',
    nip: '198001012005011001',
    nuptk: '1234567890123456',
    nik: '3201010101800001',
    gender: 'L',
    email: 'rendy@sekolah.id',
    phone: '081234567890',
    mainSubjectId: '1',
    position: 'Waka Kurikulum',
    isActive: true,
    userAccount: {
      username: 'kurikulum',
      roles: [ROLES.KURIKULUM, ROLES.PENILAI],
      isActive: true
    }
  },
  {
    id: '2',
    name: 'Ahmad Fauzi, S.Pd',
    nip: '198502022010011002',
    nuptk: '2345678901234567',
    nik: '3201010202850002',
    gender: 'L',
    email: 'ahmad@sekolah.id',
    phone: '082345678901',
    mainSubjectId: '1',
    position: 'Guru Informatika',
    isActive: true,
    userAccount: {
      username: 'guru',
      roles: [ROLES.GURU],
      isActive: true
    }
  },
  {
    id: '3',
    name: 'Siti Aminah, S.Pd',
    nip: '198803032012012003',
    nuptk: '3456789012345678',
    nik: '3201010303880003',
    gender: 'P',
    email: 'siti@sekolah.id',
    phone: '083456789012',
    mainSubjectId: '3',
    position: 'Guru Bahasa Indonesia',
    isActive: true,
    userAccount: {
      username: 'penilai',
      roles: [ROLES.GURU, ROLES.PENILAI],
      isActive: true
    }
  },
  {
    id: '4',
    name: 'Budi Santoso, S.Kom',
    nip: '198204042008011004',
    nuptk: '4567890123456789',
    nik: '3201010404820004',
    gender: 'L',
    email: 'budi@sekolah.id',
    phone: '084567890123',
    mainSubjectId: '2',
    position: 'Kaprodi TKJ',
    isActive: true,
    userAccount: {
      username: 'budi_tkj',
      roles: [ROLES.GURU, ROLES.PENILAI],
      isActive: true
    }
  },
  {
    id: '5',
    name: 'Nur Hidayah, S.Pd',
    nip: '199005052015012005',
    nuptk: '5678901234567890',
    nik: '3201010505900005',
    gender: 'P',
    email: 'nur@sekolah.id',
    phone: '085678901234',
    mainSubjectId: '4',
    position: 'Guru Matematika',
    isActive: true,
    userAccount: {
      username: 'nur_mtk',
      roles: [ROLES.GURU],
      isActive: true
    }
  }
];
