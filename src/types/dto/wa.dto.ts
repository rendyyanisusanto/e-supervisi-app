export interface CreateWaTemplatePayload {
  name: string;
  type: string;
  content: string;
  description?: string;
  variables: string[];
  isActive: boolean;
}

export type UpdateWaTemplatePayload = Partial<CreateWaTemplatePayload>;

export interface SendTestWaPayload {
  phone: string;
  variables: Record<string, string>;
}
