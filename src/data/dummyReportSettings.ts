import type { ReportSettings } from '../types/reportSetting';

export const dummyReportSettings: ReportSettings = {
  id: 1,
  showLogo: true,
  showSchoolAddress: true,
  showPrincipalSignature: true,
  showSupervisorSignature: true,
  showCurriculumSignature: true,
  useQrValidation: false,
  documentNumberFormat: "SUP/{jenis}/{bulan}/{tahun}/{nomor}",
  paperSize: "A4",
  orientation: "PORTRAIT",
  headerStyle: "FORMAL",
  footerText: "E-Supervisi SMK - Supervisi Guru Berbasis Data",
  watermarkText: "",
  updatedAt: new Date().toISOString()
};
