import type { WaTemplate } from '../types/waTemplate';

export const dummyWaTemplates: WaTemplate[] = [
  {
    id: 'TPL-001',
    code: 'JADWAL_SUPERVISI',
    name: 'Jadwal Supervisi',
    category: 'SUPERVISI',
    isActive: true,
    description: 'Dikirim saat jadwal supervisi baru dibuat.',
    content: 'Yth. Bapak/Ibu {nama_guru},\n\nSupervisi {nama_instrumen} dijadwalkan pada {tanggal} pukul {jam}.\n\nMohon mempersiapkan perangkat pembelajaran yang diperlukan.\n\nTerima kasih.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TPL-002',
    code: 'HASIL_SUPERVISI',
    name: 'Hasil Supervisi Selesai',
    category: 'HASIL',
    isActive: true,
    description: 'Dikirim saat penilai menyelesaikan pengisian nilai akhir.',
    content: 'Yth. Bapak/Ibu {nama_guru},\n\nHasil supervisi {nama_instrumen} telah tersedia dengan nilai {nilai} dan status {status}.\n\nSilakan buka aplikasi E-Supervisi SMK untuk melihat detail: {link}\n\nTerima kasih.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TPL-003',
    code: 'REFLEKSI_BELUM_DIISI',
    name: 'Pengingat Refleksi',
    category: 'REFLEKSI',
    isActive: true,
    description: 'Dikirim kepada guru yang belum mengisi lembar refleksi setelah disupervisi.',
    content: 'Yth. Bapak/Ibu {nama_guru},\n\nMohon mengisi refleksi supervisi {nama_instrumen} sebelum {target_tanggal}.\n\nKlik link berikut untuk mengisi: {link}\n\nTerima kasih.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TPL-004',
    code: 'PENGINGAT_JADWAL',
    name: 'Pengingat Jadwal Supervisi',
    category: 'PENGINGAT',
    isActive: true,
    description: 'Dikirim pada hari H supervisi.',
    content: 'Pengingat:\n\nSupervisi untuk Bapak/Ibu {nama_guru} akan dilaksanakan HARI INI pukul {jam} oleh {nama_penilai}.\n\nSalam,\n{nama_sekolah}',
    updatedAt: new Date().toISOString()
  }
];
