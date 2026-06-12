import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WaTemplate, WaLog } from '../types/waTemplate';
import { waTemplateService } from '../services/waTemplateService';
import { getApiErrorMessage } from '../utils/apiError';
import type { CreateWaTemplatePayload, UpdateWaTemplatePayload } from '../types/dto/wa.dto';
import type { QueryParams } from '../types/api';

export const useWaTemplateStore = defineStore('waTemplate', () => {
  const templates = ref<WaTemplate[]>([]);
  const logs = ref<WaLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchTemplates = async (query?: QueryParams) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await waTemplateService.getWaTemplates(query);
      if (res.success) {
        templates.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat template WhatsApp');
    } finally {
      loading.value = false;
    }
  };

  const saveTemplate = async (data: CreateWaTemplatePayload | UpdateWaTemplatePayload) => {
    loading.value = true;
    error.value = null;
    try {
      if ('id' in data && data.id) {
        await waTemplateService.updateWaTemplate(data.id, data as UpdateWaTemplatePayload);
      } else {
        await waTemplateService.createWaTemplate(data as CreateWaTemplatePayload);
      }
      await fetchTemplates(); // Refresh
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal menyimpan template WhatsApp');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const toggleStatus = async (id: string | number) => {
    loading.value = true;
    try {
      await waTemplateService.toggleWaTemplateStatus(id);
      await fetchTemplates();
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengubah status template');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const resetDefault = async () => {
    loading.value = true;
    try {
      await waTemplateService.resetDefaultTemplates();
      await fetchTemplates();
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mereset template');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const fetchLogs = async (query?: QueryParams) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await waTemplateService.getWaLogs(query);
      if (res.success) {
        logs.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat log WhatsApp');
    } finally {
      loading.value = false;
    }
  };

  const sendTest = async (id: string | number, variables: Record<string, string>) => {
    loading.value = true;
    try {
      await waTemplateService.sendTestTemplate(id, variables);
      await fetchLogs(); // Refresh logs
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengirim test pesan');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  const retryFailedLog = async (id: string | number) => {
    loading.value = true;
    try {
      await waTemplateService.retryLog(id);
      await fetchLogs();
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal mengirim ulang pesan');
      throw new Error(error.value!);
    } finally {
      loading.value = false;
    }
  };

  return {
    templates,
    logs,
    loading,
    error,
    clearError,
    fetchTemplates,
    saveTemplate,
    toggleStatus,
    resetDefault,
    fetchLogs,
    sendTest,
    retryFailedLog
  };
});
