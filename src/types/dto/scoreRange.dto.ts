export interface CreateScoreRangePayload {
  name: string;
  minScore: number;
  maxScore: number;
  description?: string;
  color: string;
}

export type UpdateScoreRangePayload = Partial<CreateScoreRangePayload>;
