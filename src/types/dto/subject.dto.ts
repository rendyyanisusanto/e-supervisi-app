export interface CreateSubjectPayload {
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;
