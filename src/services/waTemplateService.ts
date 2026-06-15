import { dummyWaTemplates } from '../data/dummyWaTemplates';
import { dummyWaLogs } from '../data/dummyWaLogs';
import type { WaTemplate, WaLog } from '../types/waTemplate';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { UpdateWaTemplatePayload as CreateWaTemplatePayload, UpdateWaTemplatePayload, SendTestWaPayload } from '../types/dto/wa.dto';
import { paginateArray, filterBySearch, sortArray } from '../utils/pagination';
import { WaMapper } from '../mappers/waMapper';

// Local state for dummy mode
let templates = [...dummyWaTemplates];
let logs = [...dummyWaLogs];

export const waTemplateService = {
  // Templates
  async getTemplates(query?: QueryParams): Promise<ApiListResponse<WaTemplate>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.wa.templates, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(WaMapper.templateToFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...templates];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'category', 'code']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof WaTemplate, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Template WA berhasil dimuat',
      data,
      meta
    };
  },
  
  async getTemplateById(id: string | number): Promise<ApiResponse<WaTemplate>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.wa.templates}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: WaMapper.templateToFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    const template = templates.find(t => String(t.id) === String(id));
    if (!template) throw new Error('Template tidak ditemukan');
    
    return {
      success: true,
      message: 'Template WA berhasil dimuat',
      data: template
    };
  },
  
  async createTemplate(payload: CreateWaTemplatePayload): Promise<ApiResponse<WaTemplate>> {
    if (isApiMode()) {
      const apiPayload = WaMapper.templateToApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.wa.templates, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: WaMapper.templateToFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const newTemplate = {
      ...payload,
      id: Date.now().toString(),
      isActive: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;
    templates.push(newTemplate);
    
    return {
      success: true,
      message: 'Template WA berhasil dibuat',
      data: newTemplate
    };
  },

  async updateTemplate(id: string | number, payload: UpdateWaTemplatePayload): Promise<ApiResponse<WaTemplate>> {
    if (isApiMode()) {
      const apiPayload = WaMapper.templateToApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.wa.templates}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: WaMapper.templateToFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = templates.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Template tidak ditemukan');
    
    templates[index] = { 
      ...templates[index], 
      ...payload,
      updatedAt: new Date().toISOString()
    } as WaTemplate;
    
    return {
      success: true,
      message: 'Template WA berhasil diperbarui',
      data: templates[index]
    };
  },
  
  async toggleTemplateStatus(id: string | number): Promise<ApiResponse<WaTemplate>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.wa.templates}/${id}/status`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: WaMapper.templateToFrontend(response.data.data)
      };
    }

    await mockDelay(400);
    const index = templates.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Template tidak ditemukan');
    
    templates[index].isActive = !templates[index].isActive;
    templates[index].updatedAt = new Date().toISOString();
    
    return {
      success: true,
      message: 'Status template berhasil diperbarui',
      data: templates[index]
    };
  },

  async resetDefaultTemplates(): Promise<ApiResponse<null>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.wa.templates}/reset-default`);
      return response.data;
    }
    
    await mockDelay(1000);
    templates = [...dummyWaTemplates];
    return {
      success: true,
      message: 'Template berhasil dikembalikan ke default bawaan sistem',
      data: null
    };
  },

  async sendTestWa(id: string | number, payload: SendTestWaPayload): Promise<ApiResponse<{ sent: boolean, message: string }>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.wa.templates}/${id}/send-test`, payload);
      return response.data;
    }

    await mockDelay(1000);
    const template = templates.find(t => String(t.id) === String(id));
    if (!template) throw new Error('Template tidak ditemukan');

    // Simulate sending logic
    const isSuccess = Math.random() > 0.2; // 80% success rate in dummy
    
    // Add to dummy logs
    logs.unshift({
      id: Date.now().toString(),
      recipientNumber: payload.phone,
      recipientName: 'Test User',
      templateName: template.name,
      status: isSuccess ? 'SENT' : 'FAILED',
      sentAt: new Date().toISOString(),
      errorMessage: isSuccess ? undefined : 'Koneksi ke provider WhatsApp gagal'
    } as any);

    if (!isSuccess) {
      throw new Error('Gagal mengirim WhatsApp. Cek log pengiriman.');
    }

    return {
      success: true,
      message: 'Pesan test berhasil dikirim',
      data: {
        sent: true,
        message: 'Pesan test berhasil dikirim'
      }
    };
  },

  // Logs
  async getLogs(query?: QueryParams): Promise<ApiListResponse<WaLog>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.wa.logs, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map((log: any) => ({
          id: log.id,
          recipientNumber: log.phone,
          recipientName: log.recipient_name || '-',
          templateName: log.template_code || '-',
          status: log.status.toLowerCase(),
          sentAt: log.sent_at,
          errorMessage: log.error_message
        } as any)),
        meta: response.data.meta
      };
    }
   
    console.log('WA Logs dummy fallback');

    // Dummy mode logic
    await mockDelay(400);
    let result = [...logs];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['phone', 'recipientName', 'templateName']);
    }
    
    if (query?.status) {
      result = result.filter(log => log.status === query.status);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof WaLog, query.sortOrder || 'desc'); // Default desc for logs
    } else {
      // Default sort by sentAt desc
      result = sortArray(result, 'sentAt', 'desc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Log WA berhasil dimuat',
      data,
      meta
    };
  },
  
  async retryMessage(id: string | number): Promise<ApiResponse<{ sent: boolean, message: string }>> {
    if (isApiMode()) {
       const response = await httpClient.post<ApiResponse<any>>(`${endpoints.wa.logs}/${id}/retry`);
       return response.data;
    }
    
    await mockDelay(1000);
    const index = logs.findIndex(l => String(l.id) === String(id));
    if (index === -1) throw new Error('Log pesan tidak ditemukan');
    
    if (logs[index].status === 'SENT') {
      throw new Error('Pesan ini sudah berhasil terkirim sebelumnya');
    }

    // Simulate retry success
    logs[index] = {
      ...logs[index],
      status: 'SENT',
      sentAt: new Date().toISOString(),
      errorMessage: undefined
    };

    return {
      success: true,
      message: 'Pesan berhasil dikirim ulang',
      data: {
        sent: true,
        message: 'Pesan berhasil dikirim ulang'
      }
    };
  }
};
