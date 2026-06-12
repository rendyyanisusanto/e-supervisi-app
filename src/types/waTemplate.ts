export interface WaTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  category: 'SUPERVISI' | 'HASIL' | 'REFLEKSI' | 'PENGINGAT';
  updatedAt: string;
}

export interface WaLog {
  id: string;
  templateCode: string;
  templateName: string;
  supervisionId?: string;
  teacherId?: string;
  recipientName: string;
  phone: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  response?: string;
  sentAt?: string;
  createdAt: string;
}
