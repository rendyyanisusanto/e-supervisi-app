export interface CreateClassroomPayload {
  name: string;
  grade: string;
  major?: string;
  isActive: boolean;
}

export type UpdateClassroomPayload = Partial<CreateClassroomPayload>;
