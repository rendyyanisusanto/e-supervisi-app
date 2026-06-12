export interface CreateInstrumentPayload {
  name: string;
  description?: string;
  type: string; // 'AKADEMIK', 'ADMINISTRASI', dsb
  isActive: boolean;
}

export type UpdateInstrumentPayload = Partial<CreateInstrumentPayload>;

export interface CreateInstrumentItemPayload {
  category?: string;
  code?: string;
  aspect: string;
  indicator: string;
  scoreRangeId: number;
  order: number;
}

export type UpdateInstrumentItemPayload = Partial<CreateInstrumentItemPayload>;

export interface ReorderInstrumentItemPayload {
  items: { id: number; order: number }[];
}
