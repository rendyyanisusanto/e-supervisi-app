import { STATUSES } from '../constants/statuses';

export const getStatusSeverity = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined => {
  if (!status) return undefined;
  
  // Normalize status for case-insensitive matching
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case STATUSES.OPTIMAL.toLowerCase():
    case STATUSES.SELESAI.toLowerCase():
    case 'selesai': // Add hardcoded fallback just in case
    case STATUSES.AKTIF.toLowerCase():
    case STATUSES.SUDAH_DIISI.toLowerCase():
    case STATUSES.SUDAH_DIBACA.toLowerCase():
    case STATUSES.SENT.toLowerCase():
      return 'success';
    case STATUSES.BAIK.toLowerCase():
    case STATUSES.TERJADWAL.toLowerCase():
    case 'terjadwal':
      return 'info';
    case STATUSES.CUKUP.toLowerCase():
    case STATUSES.PENDING.toLowerCase():
    case STATUSES.PERLU_PEMBINAAN.toLowerCase():
      return 'warning';
    case STATUSES.KURANG.toLowerCase():
    case STATUSES.DIBATALKAN.toLowerCase():
    case 'dibatalkan':
    case STATUSES.TIDAK_AKTIF.toLowerCase():
    case STATUSES.FAILED.toLowerCase():
      return 'danger';
    case STATUSES.DRAFT.toLowerCase():
    case 'draft':
      return 'warning'; // DRAFT mapped to warning (orange)
    case STATUSES.BELUM_DIISI.toLowerCase():
    case 'belum terlaksana':
    case 'belum_terlaksana':
      return 'secondary';
    default:
      return undefined;
  }
};

export const getStatusClass = (status: string): string => {
  if (!status) return '';
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus === 'selesai' || normalizedStatus === 'optimal' || normalizedStatus === 'aktif') {
    return '!bg-emerald-100 !text-emerald-700 !border-emerald-200';
  }
  if (normalizedStatus === 'terjadwal' || normalizedStatus === 'baik') {
    return '!bg-blue-100 !text-blue-700 !border-blue-200';
  }
  if (normalizedStatus === 'draft' || normalizedStatus === 'cukup' || normalizedStatus === 'pending' || normalizedStatus === 'perlu pembinaan') {
    return '!bg-orange-100 !text-orange-700 !border-orange-200';
  }
  if (normalizedStatus === 'kurang' || normalizedStatus === 'dibatalkan' || normalizedStatus === 'tidak aktif' || normalizedStatus === 'failed') {
    return '!bg-red-100 !text-red-700 !border-red-200';
  }
  if (normalizedStatus === 'belum terlaksana' || normalizedStatus === 'belum diisi') {
    return '!bg-slate-100 !text-slate-700 !border-slate-200';
  }
  
  return '';
};
