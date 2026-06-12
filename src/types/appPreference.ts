export interface AppPreference {
  defaultPeriodId: string | null;
  autoUseActivePeriod: boolean;
  autoSaveAssessment: boolean;
  requireNoteForLowScore: boolean;
  lowScoreThreshold: number;
  defaultScoreMax: number;
  enableWaNotification: boolean;
  enableReflectionReminder: boolean;
  updatedAt: string;
}
