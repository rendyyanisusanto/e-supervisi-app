import type { Teacher } from './teacher';
import type { Supervision } from './supervision';
import type { TeacherCompetency } from './competency';
import type { TeacherReflection } from './reflection';

export interface TeacherReportSummary {
  totalSupervisions: number;
  averageScore: number;
  generalStatus: string;
  highestScore: number;
  lowestScore: number;
  assessedInstruments: string[];
}

export interface TeacherReport {
  id: string;
  reportNumber: string;
  periodId: string;
  teacherId: string;
  teacher: Teacher;
  summary: TeacherReportSummary;
  supervisions: Supervision[];
  competency: TeacherCompetency;
  reflections: TeacherReflection[];
  curriculumConclusion: string;
  curriculumRecommendation: string;
  createdAt: string;
}
