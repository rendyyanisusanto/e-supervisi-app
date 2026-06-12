import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '../services/dashboardService';

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const stats = ref<any>(null);
  const chartData = ref<any>(null);
  const weakAspects = ref<any[]>([]);
  const upcomingSupervisions = ref<any[]>([]);
  const attentionTeachers = ref<any[]>([]);

  const fetchDashboardData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await dashboardService.getDashboardData();
      stats.value = data.stats;
      chartData.value = data.chartData;
      weakAspects.value = data.weakAspects;
      upcomingSupervisions.value = data.upcomingSupervisions;
      attentionTeachers.value = data.attentionTeachers;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengambil data dashboard';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const resetDashboard = () => {
    stats.value = null;
    chartData.value = null;
    weakAspects.value = [];
    upcomingSupervisions.value = [];
    attentionTeachers.value = [];
    error.value = null;
  };

  return {
    loading,
    error,
    stats,
    chartData,
    weakAspects,
    upcomingSupervisions,
    attentionTeachers,
    fetchDashboardData,
    resetDashboard
  };
});
