export interface CreatePeriodPayload {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type UpdatePeriodPayload = Partial<CreatePeriodPayload>;
