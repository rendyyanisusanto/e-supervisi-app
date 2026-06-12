export const STATUSES = {
  OPTIMAL: 'Optimal',
  BAIK: 'Baik',
  CUKUP: 'Cukup',
  PERLU_PEMBINAAN: 'Perlu Pembinaan',
  KURANG: 'Kurang',
  TERJADWAL: 'Terjadwal',
  DRAFT: 'Draft',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
  AKTIF: 'Aktif',
  TIDAK_AKTIF: 'Tidak Aktif',
  BELUM_DIISI: 'Belum Diisi',
  SUDAH_DIISI: 'Sudah Diisi',
  SUDAH_DIBACA: 'Sudah Dibaca',
  PENDING: 'Pending',
  SENT: 'Sent',
  FAILED: 'Failed',
} as const;

export type Status = typeof STATUSES[keyof typeof STATUSES];
