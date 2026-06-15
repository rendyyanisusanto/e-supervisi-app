export interface CreateScoreRangePayload {
  status: string;
  minScore: number;
  maxScore: number;
  description?: string;
  color: string;
}

export type UpdateScoreRangePayload = Partial<CreateScoreRangePayload>;
