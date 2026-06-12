export interface WeaknessItem {
  itemCode: string;
  itemDescription: string;
  category: string;
  affectedTeachersCount: number;
  averageScore: number;
  maxScore: number;
  percentage: number;
}

export interface WeaknessAspect {
  category: string;
  averageScore: number;
  affectedTeachersCount: number;
  status: string;
  recommendation: string;
}

export interface TeacherAttention {
  teacherId: string;
  teacherName: string;
  subjectName: string;
  averageScore: number;
  weakAspects: string[];
  weakItemsCount: number;
}

export interface WeaknessMap {
  periodId: string;
  weakItemsCount: number;
  weakestAspect: string;
  teachersNeedingAttentionCount: number;
  schoolAverageScore: number;
  aspects: WeaknessAspect[];
  items: WeaknessItem[];
  teachersAttention: TeacherAttention[];
}
