export interface CompetencyAspect {
  category: string;
  totalScore: number;
  maxScore: number;
  finalScore: number; // percentage (0-100)
  status: string;
}

export interface TeacherCompetency {
  teacherId: string;
  periodId: string;
  aspects: CompetencyAspect[];
  strongestAspects: CompetencyAspect[];
  weakestAspects: CompetencyAspect[];
  averageScore: number;
}
