export interface ScoreRange {
  id: string;
  minScore: number;
  maxScore: number;
  status: string; // e.g. "Optimal", "Baik"
  color: string; // e.g. "success", "info" (maps to severity)
  description: string;
}
