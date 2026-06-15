export class ScoreRangeMapper {
  static toFrontend(apiRange: any) {
    if (!apiRange) return {} as any;
    
    // Map legacy colors to PrimeVue 4 severities
    const colorMap: Record<string, string> = {
      'green': 'success',
      'blue': 'info',
      'yellow': 'warn',
      'orange': 'warn',
      'red': 'danger',
      'warning': 'warn'
    };
    
    const mappedColor = colorMap[apiRange.color] || apiRange.color;
    
    return {
      id: String(apiRange.id),
      minScore: apiRange.min_score,
      maxScore: apiRange.max_score,
      status: apiRange.status,
      color: mappedColor,
      description: apiRange.description,
    };
  }

  static toApiPayload(frontendRange: any) {
    return {
      min_score: frontendRange.minScore,
      max_score: frontendRange.maxScore,
      status: frontendRange.status,
      color: frontendRange.color,
      description: frontendRange.description,
    };
  }
}
