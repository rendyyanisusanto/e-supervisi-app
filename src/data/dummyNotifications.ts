import type { Notification } from '../types/notification';

export const dummyNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    title: 'Jadwal Supervisi Hari Ini',
    message: 'Supervisi Ahmad Fauzi dijadwalkan hari ini pukul 08:00.',
    type: 'INFO',
    isRead: false,
    createdAt: new Date().toISOString(),
    link: '/supervisi/SUP-001'
  },
  {
    id: 'NOTIF-002',
    title: 'Supervisi Selesai',
    message: 'Hasil supervisi Budi Santoso sudah final dengan predikat Baik.',
    type: 'SUCCESS',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    link: '/supervisi/SUP-003'
  },
  {
    id: 'NOTIF-003',
    title: 'Refleksi Belum Diisi',
    message: 'Nur Hidayah belum mengisi lembar refleksi.',
    type: 'WARNING',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'NOTIF-004',
    title: 'Gagal Mengirim WA',
    message: 'Pesan WA pengingat jadwal gagal dikirim ke Siti Aminah.',
    type: 'ERROR',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    link: '/pengaturan/template-wa'
  },
  {
    id: 'NOTIF-005',
    title: 'Perhatian Sistem',
    message: 'Rata-rata aspek asesmen pada guru perlu perhatian khusus.',
    type: 'WARNING',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    link: '/laporan/peta-kelemahan'
  }
];
