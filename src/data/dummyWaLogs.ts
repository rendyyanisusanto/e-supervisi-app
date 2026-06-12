import type { WaLog } from '../types/waTemplate';

export const dummyWaLogs: WaLog[] = [
  {
    id: 'LOG-001',
    templateCode: 'JADWAL_SUPERVISI',
    templateName: 'Jadwal Supervisi',
    supervisionId: 'SUP-001',
    teacherId: '2',
    recipientName: 'Ahmad Fauzi',
    phone: '082345678901',
    message: 'Yth. Bapak/Ibu Ahmad Fauzi,\n\nSupervisi Pelaksanaan Pembelajaran dijadwalkan pada 10 Juni 2026 pukul 08:00.\n\nMohon mempersiapkan perangkat pembelajaran yang diperlukan.\n\nTerima kasih.',
    status: 'SENT',
    response: '{"id": "msg_xyz123", "status": "sent"}',
    sentAt: '2026-06-01T10:05:00Z',
    createdAt: '2026-06-01T10:05:00Z'
  },
  {
    id: 'LOG-002',
    templateCode: 'HASIL_SUPERVISI',
    templateName: 'Hasil Supervisi Selesai',
    supervisionId: 'SUP-003',
    teacherId: '4',
    recipientName: 'Budi Santoso',
    phone: '084567890123',
    message: 'Yth. Bapak/Ibu Budi Santoso,\n\nHasil supervisi ATP telah tersedia dengan nilai 88.5 dan status Baik.\n\nSilakan buka aplikasi E-Supervisi SMK untuk melihat detail: http://localhost:5173/supervisi/SUP-003\n\nTerima kasih.',
    status: 'SENT',
    response: '{"id": "msg_xyz124", "status": "sent"}',
    sentAt: '2026-05-20T11:05:00Z',
    createdAt: '2026-05-20T11:05:00Z'
  },
  {
    id: 'LOG-003',
    templateCode: 'REFLEKSI_BELUM_DIISI',
    templateName: 'Pengingat Refleksi',
    supervisionId: 'SUP-004',
    teacherId: '5',
    recipientName: 'Nur Hidayah',
    phone: '085678901234',
    message: 'Yth. Bapak/Ibu Nur Hidayah,\n\nMohon mengisi refleksi supervisi Perencanaan Pembelajaran sebelum 20 Mei 2026.\n\nKlik link berikut untuk mengisi: http://localhost:5173/guru/refleksi/REF-001\n\nTerima kasih.',
    status: 'PENDING',
    createdAt: '2026-06-08T08:00:00Z'
  },
  {
    id: 'LOG-004',
    templateCode: 'PENGINGAT_JADWAL',
    templateName: 'Pengingat Jadwal Supervisi',
    supervisionId: 'SUP-002',
    teacherId: '3',
    recipientName: 'Siti Aminah',
    phone: '083456789012',
    message: 'Pengingat:\n\nSupervisi untuk Bapak/Ibu Siti Aminah akan dilaksanakan HARI INI pukul 09:00 oleh Rendy Yani Susanto.\n\nSalam,\nSMK IT Asy-Syadzili',
    status: 'FAILED',
    response: '{"error": "Invalid phone number or connection timeout"}',
    createdAt: '2026-06-05T06:00:00Z'
  },
  {
    id: 'LOG-005',
    templateCode: 'JADWAL_SUPERVISI',
    templateName: 'Jadwal Supervisi',
    supervisionId: 'SUP-005',
    teacherId: '1',
    recipientName: 'Rendy Yani Susanto',
    phone: '081234567890',
    message: 'Yth. Bapak/Ibu Rendy Yani Susanto,\n\nSupervisi Administrasi Pembelajaran dijadwalkan pada 1 Juni 2026 pukul 10:00.\n\nMohon mempersiapkan perangkat pembelajaran yang diperlukan.\n\nTerima kasih.',
    status: 'SENT',
    response: '{"id": "msg_xyz125", "status": "sent"}',
    sentAt: '2026-05-28T08:05:00Z',
    createdAt: '2026-05-28T08:05:00Z'
  }
];
