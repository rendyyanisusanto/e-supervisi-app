export interface ReportSettings {
  id: number;
  showLogo: boolean;
  showSchoolAddress: boolean;
  showPrincipalSignature: boolean;
  showSupervisorSignature: boolean;
  showCurriculumSignature: boolean;
  useQrValidation: boolean;
  documentNumberFormat: string;
  paperSize: 'A4' | 'F4';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  headerStyle: 'SIMPLE' | 'FORMAL' | 'MODERN';
  footerText: string;
  watermarkText?: string;
  updatedAt: string;
}
