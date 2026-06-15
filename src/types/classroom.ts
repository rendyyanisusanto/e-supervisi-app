export interface Classroom {
  id: string;
  name: string;
  grade: string;
  major?: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  isActive: boolean;
}
