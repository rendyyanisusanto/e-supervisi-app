import type { Supervision } from '../types/supervision';

export const dummySupervisions: Supervision[] = [
  {
    id: 'SUP-001',
    periodId: '1', // 2023/2024 Ganjil
    teacherId: '2', // Ahmad Fauzi
    supervisorId: '1', // Rendy Yani
    instrumentIds: ['3'], // Pelaksanaan Pembelajaran
    subjectId: '1', // Informatika
    classroomId: '1', // X TKJ 1
    supervisionType: 'TERJADWAL',
    status: 'SELESAI',
    scheduledDate: '2026-06-10',
    scheduledTime: '08:00',
    totalScore: 0,
    maxScore: 0,
    finalScore: 0,
    finalStatus: '',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
    items: [
      { id: 'item-101', supervisionId: 'SUP-001', instrumentItemId: '301', itemCategory: 'Pendahuluan', itemCode: 'C.1', itemDescription: 'Guru membuka pelajaran dengan baik', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-102', supervisionId: 'SUP-001', instrumentItemId: '302', itemCategory: 'Inti', itemCode: 'C.2', itemDescription: 'Guru menguasai materi', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-103', supervisionId: 'SUP-001', instrumentItemId: '303', itemCategory: 'Inti', itemCode: 'C.3', itemDescription: 'Guru menggunakan media dengan baik', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-104', supervisionId: 'SUP-001', instrumentItemId: '304', itemCategory: 'Penutup', itemCode: 'C.4', itemDescription: 'Guru memberikan kesimpulan dan tugas', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' }
    ]
  },
  {
    id: 'SUP-002',
    periodId: '1',
    teacherId: '3', // Siti Aminah
    supervisorId: '1', // Rendy Yani
    instrumentIds: ['1'], // Administrasi Pembelajaran
    subjectId: '3', // Bahasa Indonesia
    classroomId: '2', // XI TKJ 1
    supervisionType: 'LANGSUNG',
    status: 'SELESAI',
    supervisionDate: '2026-06-05',
    totalScore: 4,
    maxScore: 16,
    finalScore: 25,
    finalStatus: '',
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-06-05T09:30:00Z',
    items: [
      { id: 'item-1', supervisionId: 'SUP-002', instrumentItemId: '101', itemCategory: 'Administrasi', itemCode: 'A.1', itemDescription: 'Apakah guru memiliki SK Pembagian Tugas Mengajar dari kepala sekolah tahun pelajaran terakhir?', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: 'Sudah ada' },
      { id: 'item-2', supervisionId: 'SUP-002', instrumentItemId: '102', itemCategory: 'Administrasi', itemCode: 'A.2', itemDescription: 'Apakah guru memiliki jadwal pelajaran minimal 24 jam per minggu?', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-3', supervisionId: 'SUP-002', instrumentItemId: '103', itemCategory: 'Administrasi', itemCode: 'A.3', itemDescription: 'Apakah guru memiliki Kalender Pendidikan?', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-4', supervisionId: 'SUP-002', instrumentItemId: '104', itemCategory: 'Administrasi', itemCode: 'A.4', itemDescription: 'Apakah guru membuat program tahunan dalam tahun terakhir?', maxScore: 4, score: 2, itemStatus: 'Cukup', note: '' }
    ]
  },
  {
    id: 'SUP-003',
    periodId: '1',
    teacherId: '4', // Budi Santoso
    supervisorId: '1', // Rendy Yani
    instrumentIds: ['2'], // ATP
    subjectId: '2', // Dasar Program Keahlian
    classroomId: '1', // X TKJ 1
    supervisionType: 'LANGSUNG',
    status: 'SELESAI',
    supervisionDate: '2026-05-20',
    totalScore: 88.5,
    maxScore: 100,
    finalScore: 88.5,
    finalStatus: 'Baik',
    generalNote: 'Pembelajaran sudah sangat baik.',
    submittedAt: '2026-05-20T11:00:00Z',
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-05-20T11:00:00Z',
    items: [
      { id: 'item-301', supervisionId: 'SUP-003', instrumentItemId: '201', itemCategory: 'Perencanaan', itemCode: 'B.1', itemDescription: 'Modul ajar lengkap', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-302', supervisionId: 'SUP-003', instrumentItemId: '202', itemCategory: 'Perencanaan', itemCode: 'B.2', itemDescription: 'Kesesuaian tujuan pembelajaran', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-303', supervisionId: 'SUP-003', instrumentItemId: '203', itemCategory: 'Pelaksanaan', itemCode: 'B.3', itemDescription: 'Penggunaan metode interaktif', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-304', supervisionId: 'SUP-003', instrumentItemId: '204', itemCategory: 'Penilaian', itemCode: 'B.4', itemDescription: 'Terdapat asesmen formatif', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' }
    ]
  },
  {
    id: 'SUP-004',
    periodId: '1',
    teacherId: '5', // Nur Hidayah
    supervisorId: 'admin', // Kepala Sekolah (Admin)
    instrumentIds: ['4'], // Perencanaan Pembelajaran
    subjectId: '4', // Matematika
    classroomId: '2', // XI TKJ 1
    supervisionType: 'TERJADWAL',
    status: 'SELESAI',
    scheduledDate: '2026-05-15',
    scheduledTime: '09:00',
    supervisionDate: '2026-05-15',
    totalScore: 76.5,
    maxScore: 100,
    finalScore: 76.5,
    finalStatus: 'Cukup',
    improvementNote: 'Perlu peningkatan pada media pembelajaran.',
    submittedAt: '2026-05-15T10:30:00Z',
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-15T10:30:00Z',
    items: [
      { id: 'item-401', supervisionId: 'SUP-004', instrumentItemId: '401', itemCategory: 'Pendahuluan', itemCode: 'D.1', itemDescription: 'Mengkondisikan kelas', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-402', supervisionId: 'SUP-004', instrumentItemId: '402', itemCategory: 'Inti', itemCode: 'D.2', itemDescription: 'Penguasaan materi', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-403', supervisionId: 'SUP-004', instrumentItemId: '403', itemCategory: 'Inti', itemCode: 'D.3', itemDescription: 'Penggunaan media', maxScore: 4, score: 2, itemStatus: 'Cukup', note: 'Perlu ditingkatkan' },
      { id: 'item-404', supervisionId: 'SUP-004', instrumentItemId: '404', itemCategory: 'Penutup', itemCode: 'D.4', itemDescription: 'Memberikan umpan balik', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' }
    ]
  },
  {
    id: 'SUP-005',
    periodId: '1',
    teacherId: '1', // Hasan Basri (actually '1' is Rendy but let's use another if needed) - Using '2' Ahmad Fauzi just as placeholder for Hasan Basri since Hasan is not in dummyTeachers
    supervisorId: '1', // Rendy Yani
    instrumentIds: ['1'], // Administrasi Pembelajaran
    supervisionType: 'TERJADWAL',
    status: 'DIBATALKAN',
    scheduledDate: '2026-06-01',
    scheduledTime: '10:00',
    totalScore: 0,
    maxScore: 0,
    finalScore: 0,
    finalStatus: '',
    generalNote: 'Guru berhalangan hadir (sakit).',
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
    items: []
  },
  {
    id: 'SUP-006',
    periodId: '1',
    teacherId: '1', // Rendy Yani Susanto
    supervisorId: 'admin', 
    instrumentIds: ['3'], 
    subjectId: '1', 
    classroomId: '1', 
    supervisionType: 'LANGSUNG',
    status: 'SELESAI',
    supervisionDate: '2026-06-02',
    totalScore: 90,
    maxScore: 100,
    finalScore: 90,
    finalStatus: 'Sangat Baik',
    createdAt: '2026-06-02T09:00:00Z',
    updatedAt: '2026-06-02T10:30:00Z',
    items: [
      { id: 'item-601', supervisionId: 'SUP-006', instrumentItemId: '301', itemCategory: 'Pendahuluan', itemCode: 'C.1', itemDescription: 'Guru membuka pelajaran', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-602', supervisionId: 'SUP-006', instrumentItemId: '302', itemCategory: 'Inti', itemCode: 'C.2', itemDescription: 'Guru menguasai materi', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' },
      { id: 'item-603', supervisionId: 'SUP-006', instrumentItemId: '303', itemCategory: 'Inti', itemCode: 'C.3', itemDescription: 'Guru menggunakan media', maxScore: 4, score: 3, itemStatus: 'Baik', note: '' },
      { id: 'item-604', supervisionId: 'SUP-006', instrumentItemId: '304', itemCategory: 'Penutup', itemCode: 'C.4', itemDescription: 'Guru menutup pelajaran', maxScore: 4, score: 4, itemStatus: 'Sangat Baik', note: '' }
    ]
  }
];
