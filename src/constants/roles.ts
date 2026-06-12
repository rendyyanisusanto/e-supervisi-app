export const ROLES = {
  ADMIN: 'admin',
  KURIKULUM: 'kurikulum',
  PENILAI: 'penilai',
  GURU: 'guru',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
