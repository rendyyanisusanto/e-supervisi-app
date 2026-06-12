export class PeriodMapper {
  static toFrontend(apiPeriod: any) {
    if (!apiPeriod) return null;
    return {
      id: String(apiPeriod.id),
      name: apiPeriod.name,
      startDate: apiPeriod.start_date,
      endDate: apiPeriod.end_date,
      isActive: apiPeriod.is_active,
    };
  }

  static toApiPayload(frontendPeriod: any) {
    return {
      name: frontendPeriod.name,
      start_date: frontendPeriod.startDate,
      end_date: frontendPeriod.endDate,
      is_active: frontendPeriod.isActive,
    };
  }
}
