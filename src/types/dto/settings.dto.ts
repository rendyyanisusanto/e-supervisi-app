export interface UpdateSchoolProfilePayload {
  name: string;
  npsn?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  headmasterName?: string;
  headmasterNip?: string;
}

export interface UpdateReportSettingsPayload {
  schoolName: string;
  schoolAddress: string;
  city: string;
  signatureDate: string; // ISO string
  headmasterName: string;
  headmasterNip: string;
  supervisorName: string;
  supervisorNip: string;
}
