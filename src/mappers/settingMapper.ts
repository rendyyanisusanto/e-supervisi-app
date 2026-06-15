export class SettingMapper {
  static profileToFrontend(apiProfile: any) {
    if (!apiProfile) return {} as any;
    return {
      id: String(apiProfile.id),
      name: apiProfile.name,
      npsn: apiProfile.npsn,
      address: apiProfile.address,
      city: apiProfile.city,
      province: apiProfile.province,
      phone: apiProfile.phone,
      email: apiProfile.email,
      website: apiProfile.website,
      logo: apiProfile.logo,
      principalName: apiProfile.principal_name,
      principalNip: apiProfile.principal_nip,
      curriculumName: apiProfile.curriculum_name,
      curriculumNip: apiProfile.curriculum_nip,
      reportFooter: apiProfile.report_footer,
    };
  }

  static profileToApiPayload(frontendProfile: any) {
    return {
      name: frontendProfile.name,
      npsn: frontendProfile.npsn,
      address: frontendProfile.address,
      city: frontendProfile.city,
      province: frontendProfile.province,
      phone: frontendProfile.phone,
      email: frontendProfile.email,
      website: frontendProfile.website,
      logo: frontendProfile.logo,
      principal_name: frontendProfile.principalName,
      principal_nip: frontendProfile.principalNip,
      curriculum_name: frontendProfile.curriculumName,
      curriculum_nip: frontendProfile.curriculumNip,
      report_footer: frontendProfile.reportFooter,
    };
  }

  static reportSettingToFrontend(apiSetting: any) {
    if (!apiSetting) return {} as any;
    return {
      id: String(apiSetting.id),
      showLogo: apiSetting.show_logo,
      showSchoolAddress: apiSetting.show_school_address,
      showPrincipalSignature: apiSetting.show_principal_signature,
      showSupervisorSignature: apiSetting.show_supervisor_signature,
      showCurriculumSignature: apiSetting.show_curriculum_signature,
      useQrValidation: apiSetting.use_qr_validation,
      documentNumberFormat: apiSetting.document_number_format,
      paperSize: apiSetting.paper_size,
      orientation: apiSetting.orientation,
      headerStyle: apiSetting.header_style,
      watermarkText: apiSetting.watermark_text,
      footerText: apiSetting.footer_text,
    };
  }

  static reportSettingToApiPayload(frontendSetting: any) {
    return {
      show_logo: frontendSetting.showLogo,
      show_school_address: frontendSetting.showSchoolAddress,
      show_principal_signature: frontendSetting.showPrincipalSignature,
      show_supervisor_signature: frontendSetting.showSupervisorSignature,
      show_curriculum_signature: frontendSetting.showCurriculumSignature,
      use_qr_validation: frontendSetting.useQrValidation,
      document_number_format: frontendSetting.documentNumberFormat,
      paper_size: frontendSetting.paperSize,
      orientation: frontendSetting.orientation,
      header_style: frontendSetting.headerStyle,
      watermark_text: frontendSetting.watermarkText,
      footer_text: frontendSetting.footerText,
    };
  }

  static appPreferenceToFrontend(apiPref: any) {
    if (!apiPref) return {} as any;
    return {
      id: String(apiPref.id),
      autoUseActivePeriod: apiPref.auto_use_active_period,
      autoSaveAssessment: apiPref.auto_save_assessment,
      requireNoteForLowScore: apiPref.require_note_for_low_score,
      lowScoreThreshold: apiPref.low_score_threshold,
      defaultScoreMax: apiPref.default_score_max,
      enableWaNotification: apiPref.enable_wa_notification,
      enableReflectionReminder: apiPref.enable_reflection_reminder,
    };
  }

  static appPreferenceToApiPayload(frontendPref: any) {
    return {
      auto_use_active_period: frontendPref.autoUseActivePeriod,
      auto_save_assessment: frontendPref.autoSaveAssessment,
      require_note_for_low_score: frontendPref.requireNoteForLowScore,
      low_score_threshold: frontendPref.lowScoreThreshold,
      default_score_max: frontendPref.defaultScoreMax,
      enable_wa_notification: frontendPref.enableWaNotification,
      enable_reflection_reminder: frontendPref.enableReflectionReminder,
    };
  }
}
