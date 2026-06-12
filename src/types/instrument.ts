export type InstrumentType = 'ADMINISTRASI' | 'PERENCANAAN' | 'PELAKSANAAN' | 'ATP' | 'ASESMEN' | 'REFLEKSI' | 'LAINNYA';

export interface InstrumentItem {
  id: string;
  instrumentId: string;
  category: string;
  code: string;
  description: string;
  maxScore: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Instrument {
  id: string;
  code: string;
  name: string;
  type: InstrumentType;
  description: string;
  isActive: boolean;
  items?: InstrumentItem[];
}
