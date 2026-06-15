import type { ScoreRange } from '../types/scoreRange';

export const dummyScoreRanges: ScoreRange[] = [
  { id: '1', minScore: 90, maxScore: 100, name: 'Optimal', color: 'success', description: 'Kinerja sangat memuaskan' },
  { id: '2', minScore: 80, maxScore: 89.99, name: 'Baik', color: 'info', description: 'Kinerja sesuai standar' },
  { id: '3', minScore: 70, maxScore: 79.99, name: 'Cukup', color: 'warning', description: 'Perlu beberapa perbaikan kecil' },
  { id: '4', minScore: 60, maxScore: 69.99, name: 'Perlu Pembinaan', color: 'warning', description: 'Membutuhkan pembinaan dan pendampingan' },
  { id: '5', minScore: 0, maxScore: 59.99, name: 'Kurang', color: 'danger', description: 'Sangat kurang dari standar' }
];
