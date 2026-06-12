import type { Period } from '../types/period';

export const dummyPeriods: Period[] = [
  {
    id: '1',
    name: 'Semester Ganjil 2026/2027',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    isActive: true
  },
  {
    id: '2',
    name: 'Semester Genap 2025/2026',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    isActive: false
  }
];
