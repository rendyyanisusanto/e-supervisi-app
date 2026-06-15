import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Instrument } from '../types/instrument';
import { instrumentService } from '../services/instrumentService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateInstrumentPayload, UpdateInstrumentPayload, CreateInstrumentItemPayload, UpdateInstrumentItemPayload, ReorderInstrumentItemPayload } from '../types/dto/instrument.dto';

export const useInstrumentStore = defineStore('instrument', () => {
  const instruments = ref<Instrument[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchInstruments = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await instrumentService.getInstruments();
      if (res.success) {
        instruments.value = res.data;
      }
    } catch (err: any) {
      error.value = getApiErrorMessage(err, 'Gagal mengambil data instrumen');
    } finally {
      loading.value = false;
    }
  };

  const addInstrument = async (data: CreateInstrumentPayload) => {
    try {
      const res = await instrumentService.createInstrument(data);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateInstrument = async (id: string | number, data: UpdateInstrumentPayload) => {
    try {
      const res = await instrumentService.updateInstrument(id, data);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteInstrument = async (id: string | number) => {
    try {
      await instrumentService.deleteInstrument(id);
      await fetchInstruments();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const duplicateInstrument = async (id: string | number) => {
    try {
      const res = await instrumentService.duplicateInstrument(id);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string | number) => {
    try {
      const res = await instrumentService.toggleInstrumentStatus(id);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const addItem = async (instrumentId: string | number, data: CreateInstrumentItemPayload) => {
    try {
      const res = await instrumentService.createInstrumentItem(instrumentId, data);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const updateItem = async (instrumentId: string | number, itemId: string | number, data: UpdateInstrumentItemPayload) => {
    try {
      const res = await instrumentService.updateInstrumentItem(instrumentId, itemId, data);
      if (res.success) {
        await fetchInstruments();
        return res.data;
      }
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const deleteItem = async (instrumentId: string | number, itemId: string | number) => {
    try {
      await instrumentService.deleteInstrumentItem(instrumentId, itemId);
      await fetchInstruments();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const reorderItems = async (instrumentId: string | number, data: ReorderInstrumentItemPayload) => {
    try {
      await instrumentService.reorderInstrumentItems(instrumentId, data);
      await fetchInstruments();
    } catch (err: any) {
      throw new Error(getApiErrorMessage(err));
    }
  };

  const activeInstruments = computed(() => {
    return instruments.value.filter(i => i.isActive);
  });

  return {
    instruments,
    activeInstruments,
    loading,
    error,
    clearError,
    fetchInstruments,
    addInstrument,
    updateInstrument,
    deleteInstrument,
    duplicateInstrument,
    toggleStatus,
    addItem,
    updateItem,
    deleteItem,
    reorderItems
  };
});
