export const dummyTeachers = [
  { id: '1', name: 'Ahmad Fauzi, S.Pd', mapel: 'Informatika', score: 95.40, status: 'Optimal' },
  { id: '2', name: 'Siti Aminah, S.Pd', mapel: 'Bahasa Indonesia', score: 88.20, status: 'Baik' },
  { id: '3', name: 'Budi Santoso, S.Kom', mapel: 'Produktif TKJ', score: 76.50, status: 'Cukup' },
  { id: '4', name: 'Nur Hidayah, S.Pd', mapel: 'Matematika', score: 68.00, status: 'Perlu Pembinaan' },
  { id: '5', name: 'Hasan Basri, S.Pd', mapel: 'PAI', score: 91.00, status: 'Optimal' }
];

export const dummySupervisions = [
  { id: '1', date: '2026-06-10', teacher: 'Ahmad Fauzi, S.Pd', appraiser: 'Rendy Yani', instrument: 'Pelaksanaan Pembelajaran', status: 'Terjadwal' },
  { id: '2', date: '2026-06-11', teacher: 'Siti Aminah, S.Pd', appraiser: 'Kepala Sekolah', instrument: 'Administrasi Pembelajaran', status: 'Terjadwal' },
  { id: '3', date: '2026-06-12', teacher: 'Budi Santoso, S.Kom', appraiser: 'Waka Kurikulum', instrument: 'ATP', status: 'Draft' },
  { id: '4', date: '2026-06-05', teacher: 'Hasan Basri, S.Pd', appraiser: 'Siti Aminah, S.Pd', instrument: 'Pelaksanaan Pembelajaran', status: 'Selesai' },
  { id: '5', date: '2026-06-08', teacher: 'Nur Hidayah, S.Pd', appraiser: 'Rendy Yani', instrument: 'Perencanaan Pembelajaran', status: 'Dibatalkan' }
];

export const dummyDashboardStats = {
  totalTeachers: 48,
  totalSupervisions: 126,
  completedSupervisions: 96,
  scheduledSupervisions: 18,
  averageScore: 91.75,
  attentionTeachers: 5
};

export const dummyChartData = {
  averageScoreChart: {
    labels: ['Administrasi', 'ATP', 'Pelaksanaan', 'Perencanaan'],
    data: [92, 88, 84, 90]
  },
  statusDistributionChart: {
    labels: ['Optimal', 'Baik', 'Cukup', 'Perlu Pembinaan', 'Kurang'],
    data: [58, 28, 7, 3, 0]
  }
};

export const dummyWeakAspects = [
  { name: 'Asesmen Pembelajaran', score: 72.5 },
  { name: 'Refleksi Pembelajaran', score: 75.2 },
  { name: 'Media Pembelajaran', score: 78.1 },
  { name: 'Manajemen Kelas', score: 80.4 }
];
