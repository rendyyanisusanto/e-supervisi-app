import { dummyInstruments } from '../data/dummyInstruments';
import type { Instrument, InstrumentItem, InstrumentType } from '../types/instrument';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiListResponse, ApiResponse, QueryParams } from '../types/api';
import type { 
  CreateInstrumentPayload, 
  UpdateInstrumentPayload,
  CreateInstrumentItemPayload,
  
} from '../types/dto/instrument.dto';
import { paginateArray, sortArray, filterBySearch } from '../utils/pagination';
import { InstrumentMapper } from '../mappers/instrumentMapper';

// Local state for dummy mode
let instruments = [...dummyInstruments];
let items: InstrumentItem[] = dummyInstruments.flatMap(i => i.items || []);

export const instrumentService = {
  // Instrument CRUD
  async getInstruments(query?: QueryParams): Promise<ApiListResponse<Instrument>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiListResponse<any>>(endpoints.instruments, { params: query });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(InstrumentMapper.toFrontend),
        meta: response.data.meta
      };
    }

    // Dummy mode logic
    await mockDelay(400);
    let result = [...instruments];

    if (query?.search) {
      result = filterBySearch(result, query.search, ['name', 'code']);
    }

    if (query?.sortBy) {
      result = sortArray(result, query.sortBy as keyof Instrument, query.sortOrder || 'asc');
    }

    const { data, meta } = paginateArray(result, query?.page || 1, query?.limit || 10);

    return {
      success: true,
      message: 'Data instrumen berhasil dimuat',
      data,
      meta
    };
  },
  
  async getInstrumentById(id: string | number): Promise<ApiResponse<Instrument>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.instruments}/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(200);
    const instrument = instruments.find(i => String(i.id) === String(id));
    if (!instrument) throw new Error('Instrumen tidak ditemukan');
    
    // Attach items in dummy mode
    const instrumentItems = items
      .filter(i => String(i.instrumentId) === String(id))
      .sort((a, b) => a.sortOrder - b.sortOrder);
      
    return {
      success: true,
      message: 'Data instrumen berhasil dimuat',
      data: {
        ...instrument,
        items: instrumentItems
      }
    };
  },
  
  async createInstrument(payload: CreateInstrumentPayload): Promise<ApiResponse<Instrument>> {
    if (isApiMode()) {
      const apiPayload = InstrumentMapper.toApiPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(endpoints.instruments, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const newInstrument: Instrument = {
      ...payload,
      id: Date.now().toString(),
      code: (payload as any).code || `INS-${Date.now()}`,
      description: payload.description || '',
      type: payload.type as InstrumentType,
      isActive: payload.isActive ?? true,
      itemsCount: 0
    };
    
    instruments.push(newInstrument);
    
    return {
      success: true,
      message: 'Instrumen berhasil ditambahkan',
      data: newInstrument
    };
  },
  
  async updateInstrument(id: string | number, payload: UpdateInstrumentPayload): Promise<ApiResponse<Instrument>> {
    if (isApiMode()) {
      const apiPayload = InstrumentMapper.toApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.instruments}/${id}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(500);
    const index = instruments.findIndex(i => String(i.id) === String(id));
    if (index === -1) throw new Error('Instrumen tidak ditemukan');
    
    instruments[index] = { ...instruments[index], ...payload } as Instrument;
    
    return {
      success: true,
      message: 'Instrumen berhasil diperbarui',
      data: instruments[index]
    };
  },
  
  async deleteInstrument(id: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.instruments}/${id}`);
      return response.data;
    }

    await mockDelay(500);
    const index = instruments.findIndex(i => String(i.id) === String(id));
    if (index === -1) throw new Error('Instrumen tidak ditemukan');
    
    instruments = instruments.filter(i => String(i.id) !== String(id));
    items = items.filter(i => String(i.instrumentId) !== String(id));
    
    return {
      success: true,
      message: 'Instrumen berhasil dihapus'
    };
  },

  async toggleInstrumentStatus(id: string | number): Promise<ApiResponse<Instrument>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<any>>(`${endpoints.instruments}/${id}/status`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(400);
    const index = instruments.findIndex(i => String(i.id) === String(id));
    if (index === -1) throw new Error('Instrumen tidak ditemukan');
    
    instruments[index].isActive = !instruments[index].isActive;
    
    return {
      success: true,
      message: 'Status instrumen berhasil diperbarui',
      data: instruments[index]
    };
  },

  async duplicateInstrument(id: string | number): Promise<ApiResponse<Instrument>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.instruments}/${id}/duplicate`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontend(response.data.data)
      };
    }

    await mockDelay(800);
    const source = instruments.find(i => String(i.id) === String(id));
    if (!source) throw new Error('Instrumen tidak ditemukan');

    const newId = Date.now().toString();
    const newInstrument: Instrument = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      code: `${source.code}-COPY`,
      isActive: false
    };

    instruments.push(newInstrument);

    // Copy items
    const sourceItems = items.filter(i => String(i.instrumentId) === String(id));
    sourceItems.forEach((item, idx) => {
      items.push({
        ...item,
        id: `${newId}-${idx}`,
        instrumentId: newId
      });
    });

    return {
      success: true,
      message: 'Instrumen berhasil diduplikasi',
      data: newInstrument
    };
  },

  // Items CRUD
  async getInstrumentItems(instrumentId: string | number): Promise<ApiResponse<InstrumentItem[]>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(`${endpoints.instruments}/${instrumentId}/items`);
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data.map(InstrumentMapper.toFrontendItem)
      };
    }

    await mockDelay(300);
    const instrumentItems = items
      .filter(i => String(i.instrumentId) === String(instrumentId))
      .sort((a, b) => a.sortOrder - b.sortOrder);
      
    return {
      success: true,
      message: 'Data item instrumen berhasil dimuat',
      data: instrumentItems
    };
  },

  async createInstrumentItem(instrumentId: string | number, payload: CreateInstrumentItemPayload): Promise<ApiResponse<InstrumentItem>> {
    if (isApiMode()) {
      const apiPayload = InstrumentMapper.toApiItemPayload(payload);
      const response = await httpClient.post<ApiResponse<any>>(`${endpoints.instruments}/${instrumentId}/items`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontendItem(response.data.data)
      };
    }

    await mockDelay(500);
    const newItem: InstrumentItem = {
      id: Date.now().toString(),
      instrumentId: String(instrumentId),
      category: payload.category || '',
      code: payload.code || '',
      description: payload.description || '',
      maxScore: payload.maxScore || 4,
      sortOrder: payload.sortOrder || 0,
      isActive: (payload as any).isActive ?? true
    };
    
    items.push(newItem);
    this.updateItemCount(instrumentId);
    
    return {
      success: true,
      message: 'Item instrumen berhasil ditambahkan',
      data: newItem
    };
  },

  async updateInstrumentItem(
    instrumentId: string | number, 
    itemId: string | number, 
    payload: any
  ): Promise<ApiResponse<InstrumentItem>> {
    if (isApiMode()) {
      const apiPayload = InstrumentMapper.toApiItemPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(`${endpoints.instruments}/${instrumentId}/items/${itemId}`, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: InstrumentMapper.toFrontendItem(response.data.data)
      };
    }

    await mockDelay(500);
    const index = items.findIndex(i => String(i.id) === String(itemId) && String(i.instrumentId) === String(instrumentId));
    if (index === -1) throw new Error('Item instrumen tidak ditemukan');
    
    items[index] = { ...items[index], ...payload } as InstrumentItem;
    
    return {
      success: true,
      message: 'Item instrumen berhasil diperbarui',
      data: items[index]
    };
  },

  async deleteInstrumentItem(instrumentId: string | number, itemId: string | number): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.delete<ApiResponse<void>>(`${endpoints.instruments}/${instrumentId}/items/${itemId}`);
      return response.data;
    }

    await mockDelay(500);
    const index = items.findIndex(i => String(i.id) === String(itemId) && String(i.instrumentId) === String(instrumentId));
    if (index === -1) throw new Error('Item instrumen tidak ditemukan');
    
    items = items.filter(i => String(i.id) !== String(itemId));
    this.updateItemCount(instrumentId);
    
    return {
      success: true,
      message: 'Item instrumen berhasil dihapus'
    };
  },

  async reorderInstrumentItems(instrumentId: string | number, payload: any): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      const response = await httpClient.patch<ApiResponse<void>>(`${endpoints.instruments}/${instrumentId}/items/reorder`, payload);
      return response.data;
    }

    await mockDelay(600);
    payload.items.forEach((orderItem: any) => {
      const index = items.findIndex(i => String(i.id) === String(orderItem.id) && String(i.instrumentId) === String(instrumentId));
      if (index !== -1) {
        items[index].sortOrder = orderItem.sortOrder;
      }
    });

    return {
      success: true,
      message: 'Urutan item berhasil disimpan'
    };
  },

  // Helper for dummy mode
  updateItemCount(instrumentId: string | number) {
    const count = items.filter(i => String(i.instrumentId) === String(instrumentId)).length;
    const index = instruments.findIndex(i => String(i.id) === String(instrumentId));
    if (index !== -1) {
      instruments[index].itemsCount = count;
    }
  }
};
