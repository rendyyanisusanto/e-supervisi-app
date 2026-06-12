import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TeacherReport } from '../types/teacherReport';
import type { WeaknessMap } from '../types/weaknessMap';
import type { SupervisionRecapSummary } from '../types/report';
import { reportService } from '../services/reportService';
import { getApiErrorMessage } from '../utils/apiError';

export const useReportStore = defineStore('report', () => {
  const currentReport = ref<TeacherReport | null>(null);
  const currentWeaknessMap = ref<WeaknessMap | null>(null);
  const currentRecapSummary = ref<any>(null);
  const currentRecapData = ref<any[]>([]);
  const currentRecapByInstrument = ref<any[]>([]);
  const currentRecapBySupervisor = ref<any[]>([]);
  const currentRecapTeacherCoverage = ref<any>(null);
  const currentBasicSummary = ref<any>(null);
  const currentIndicatorReport = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const fetchTeacherReport = async (teacherId: string | number, periodId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportService.getTeacherReport(teacherId, { period_id: periodId });
      if (res.success) {
        currentReport.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat rapor guru');
    } finally {
      loading.value = false;
    }
  };

  const fetchWeaknessMap = async (periodId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportService.getWeaknessMap({ period_id: periodId });
      if (res.success) {
        currentWeaknessMap.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat peta kelemahan');
    } finally {
      loading.value = false;
    }
  };

  const fetchSupervisionRecap = async (periodId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportService.getSupervisionRecap({ period_id: periodId });
      if (res.success) {
        currentRecapSummary.value = res.data.summary;
        currentRecapData.value = res.data.data || [];
        currentRecapByInstrument.value = res.data.byInstrument || [];
        currentRecapBySupervisor.value = res.data.bySupervisor || [];
        currentRecapTeacherCoverage.value = res.data.teacherCoverage || null;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat rekap supervisi');
    } finally {
      loading.value = false;
    }
  };

  const fetchBasicSummary = async (periodId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportService.getBasicSummary({ period_id: periodId });
      if (res.success) {
        currentBasicSummary.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat laporan dasar');
    } finally {
      loading.value = false;
    }
  };

  const fetchIndicatorReport = async (periodId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await reportService.getIndicatorReport({ period_id: periodId });
      if (res.success) {
        currentIndicatorReport.value = res.data;
      }
    } catch (e: any) {
      error.value = getApiErrorMessage(e, 'Gagal memuat laporan indikator');
    } finally {
      loading.value = false;
    }
  };

  return {
    currentReport,
    currentWeaknessMap,
    currentRecapSummary,
    currentRecapData,
    currentRecapByInstrument,
    currentRecapBySupervisor,
    currentRecapTeacherCoverage,
    currentBasicSummary,
    currentIndicatorReport,
    loading,
    error,
    clearError,
    fetchTeacherReport,
    fetchWeaknessMap,
    fetchSupervisionRecap,
    fetchBasicSummary,
    fetchIndicatorReport
  };
});
