export const APP_NAME = import.meta.env.VITE_APP_NAME || 'E-Supervisi SMK';
export const APP_TAGLINE = 'Sistem Informasi Supervisi Akademik';
export const PRIMARY_COLOR = '#0984e3';

export const STORAGE_KEYS = {
  AUTH_USER: 'e_supervisi_user',
  AUTH_TOKEN: 'e_supervisi_token',
  APP_PREFERENCE: 'e_supervisi_preference',
  SCHOOL_PROFILE: 'e_supervisi_school_profile',
  REPORT_SETTING: 'e_supervisi_report_setting',
  NOTIFICATIONS: 'e_supervisi_notifications',
  WA_TEMPLATES: 'e_supervisi_wa_templates',
  WA_LOGS: 'e_supervisi_wa_logs',
  PERIODS: 'e_supervisi_periods',
  SUBJECTS: 'e_supervisi_subjects',
  CLASSROOMS: 'e_supervisi_classrooms',
  TEACHERS: 'e_supervisi_teachers',
  INSTRUMENTS: 'e_supervisi_instruments',
  SUPERVISIONS: 'e_supervisi_supervisions',
  SCORE_RANGES: 'e_supervisi_score_ranges',
  REFLECTIONS: 'e_supervisi_reflections',
  USERS: 'e_supervisi_users',
} as const;
