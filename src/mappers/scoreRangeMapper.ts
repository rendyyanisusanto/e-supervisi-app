export class ScoreRangeMapper {
  static toFrontend(apiRange: any) {
    if (!apiRange) return null;
    return {
      id: String(apiRange.id),
      minScore: apiRange.min_score,
      maxScore: apiRange.max_score,
      status: apiRange.status,
      color: apiRange.color,
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
