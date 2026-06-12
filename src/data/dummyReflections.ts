import type { TeacherReflection } from '../types/reflection';

export const dummyReflections: TeacherReflection[] = [
  {
    id: 'REF-001',
    supervisionId: 'SUP-001',
    teacherId: '2', // Budi Santoso
    strengthReflection: 'Saya sudah menyusun ATP dan menyesuaikan dengan CP.',
    obstacleReflection: 'Masih perlu penguatan pada asesmen formatif.',
    improvementPlan: 'Saya akan memperbaiki rubrik asesmen dan menambahkan refleksi siswa.',
    supportNeeded: 'Pendampingan dari kurikulum terkait asesmen.',
    targetDate: '2026-06-20',
    status: 'SUDAH_DIISI',
    submittedAt: '2026-05-15T10:00:00Z',
    readAt: null,
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'REF-002',
    supervisionId: 'SUP-002',
    teacherId: '3', // Nur Hidayah
    strengthReflection: '',
    obstacleReflection: '',
    improvementPlan: '',
    supportNeeded: '',
    targetDate: null,
    status: 'BELUM_DIISI',
    submittedAt: null,
    readAt: null,
    createdAt: '2026-05-16T08:00:00Z',
    updatedAt: '2026-05-16T08:00:00Z'
  }
];
