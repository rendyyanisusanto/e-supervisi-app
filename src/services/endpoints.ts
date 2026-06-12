/**
 * Centralized API endpoints configuration
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },
  periods: '/periods',
  teachers: '/teachers',
  subjects: '/subjects',
  classrooms: '/classrooms',
  instruments: '/instruments',
  scoreRanges: '/score-ranges',
  supervisions: {
    base: '/supervisions',
    completed: '/supervisions/completed',
  },
  reflections: '/reflections',
  reports: {
    supervisionRecap: '/reports/supervision-recap',
    weaknessMap: '/reports/weakness-map',
    basicSummary: '/reports/basic-summary',
    indicators: '/reports/indicators',
    teacher: (id: number) => `/reports/teacher/${id}`,
    teacherCompetency: (id: number) => `/reports/teacher/${id}/competency`,
    instrument: (id: number) => `/reports/instruments/${id}`,
    preview: '/reports/preview',
    exportPdf: '/reports/export-pdf'
  },
  settings: {
    schoolProfile: '/settings/school-profile',
    schoolProfileLogo: '/settings/school-profile/logo',
    reportSettings: '/settings/report-settings',
  },
  wa: {
    templates: '/wa/templates',
    logs: '/wa/logs',
  },
  notifications: '/notifications',
  users: '/users',
  auditLogs: '/audit-logs'
};
