import type { AppPreference } from '../types/appPreference';

export const dummyAppPreferences: AppPreference = {
  defaultPeriodId: '1',
  autoUseActivePeriod: true,
  autoSaveAssessment: true,
  requireNoteForLowScore: true,
  lowScoreThreshold: 2,
  defaultScoreMax: 4,
  enableWaNotification: true,
  enableReflectionReminder: true,
  updatedAt: new Date().toISOString()
};
