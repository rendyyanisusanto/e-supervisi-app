import type { Instrument } from '../types/instrument';

export const dummyInstruments: Instrument[] = [
  {
    id: '1',
    code: 'INS-ADM',
    name: 'Monitoring Administrasi Pembelajaran',
    type: 'ADMINISTRASI',
    description: 'Instrumen untuk memonitoring kelengkapan administrasi guru.',
    isActive: true,
    items: [
      { id: '101', instrumentId: '1', category: 'Administrasi', code: 'A.1', description: 'Apakah guru memiliki SK Pembagian Tugas Mengajar dari kepala sekolah tahun pelajaran terakhir?', maxScore: 4, sortOrder: 1, isActive: true },
      { id: '102', instrumentId: '1', category: 'Administrasi', code: 'A.2', description: 'Apakah guru memiliki jadwal pelajaran minimal 24 jam per minggu?', maxScore: 4, sortOrder: 2, isActive: true },
      { id: '103', instrumentId: '1', category: 'Administrasi', code: 'A.3', description: 'Apakah guru memiliki Kalender Pendidikan?', maxScore: 4, sortOrder: 3, isActive: true },
      { id: '104', instrumentId: '1', category: 'Administrasi', code: 'A.4', description: 'Apakah guru membuat program tahunan dalam tahun terakhir?', maxScore: 4, sortOrder: 4, isActive: true }
    ]
  },
  {
    id: '2',
    code: 'INS-ATP',
    name: 'Supervisi Alur Tujuan Pembelajaran',
    type: 'ATP',
    description: 'Instrumen untuk mensupervisi kesesuaian ATP.',
    isActive: true,
    items: [
      { id: '201', instrumentId: '2', category: 'Kesesuaian', code: 'B.1', description: 'ATP sesuai dengan CP', maxScore: 4, sortOrder: 1, isActive: true },
      { id: '202', instrumentId: '2', category: 'Kesesuaian', code: 'B.2', description: 'ATP logis dan berurutan', maxScore: 4, sortOrder: 2, isActive: true }
    ]
  },
  {
    id: '3',
    code: 'INS-PEL',
    name: 'Supervisi Pelaksanaan Pembelajaran',
    type: 'PELAKSANAAN',
    description: 'Instrumen pengamatan pelaksanaan pembelajaran di kelas.',
    isActive: true,
    items: [
      { id: '301', instrumentId: '3', category: 'Pendahuluan', code: 'C.1', description: 'Guru membuka pelajaran dengan baik', maxScore: 4, sortOrder: 1, isActive: true },
      { id: '302', instrumentId: '3', category: 'Inti', code: 'C.2', description: 'Guru menguasai materi', maxScore: 4, sortOrder: 2, isActive: true },
      { id: '303', instrumentId: '3', category: 'Inti', code: 'C.3', description: 'Guru menggunakan media dengan baik', maxScore: 4, sortOrder: 3, isActive: true },
      { id: '304', instrumentId: '3', category: 'Penutup', code: 'C.4', description: 'Guru memberikan kesimpulan dan tugas', maxScore: 4, sortOrder: 4, isActive: true }
    ]
  },
  {
    id: '4',
    code: 'INS-REN',
    name: 'Supervisi Perencanaan Pembelajaran Mendalam',
    type: 'PERENCANAAN',
    description: 'Instrumen mengecek RPP atau Modul Ajar.',
    isActive: true,
    items: [
      { id: '401', instrumentId: '4', category: 'Kelengkapan', code: 'D.1', description: 'Modul ajar lengkap', maxScore: 4, sortOrder: 1, isActive: true },
      { id: '402', instrumentId: '4', category: 'Kesesuaian', code: 'D.2', description: 'Asesmen sesuai tujuan', maxScore: 4, sortOrder: 2, isActive: true }
    ]
  }
];
