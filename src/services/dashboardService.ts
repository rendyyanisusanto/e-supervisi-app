import { dummyDashboardStats, dummyChartData, dummyWeakAspects, dummySupervisions, dummyTeachers } from '../data/dummyDashboard';
import { mockDelay } from './mockDelay';

export const dashboardService = {
  async getDashboardData() {
    await mockDelay(400, 800);
    return {
      stats: dummyDashboardStats,
      chartData: dummyChartData,
      weakAspects: dummyWeakAspects,
      upcomingSupervisions: dummySupervisions.filter(s => s.status === 'Terjadwal' || s.status === 'Draft'),
      attentionTeachers: dummyTeachers.filter(t => t.status === 'Perlu Pembinaan' || t.status === 'Cukup')
    };
  }
};
