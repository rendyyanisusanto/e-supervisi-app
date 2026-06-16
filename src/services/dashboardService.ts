import httpClient from './httpClient';
import { isApiMode } from './dataSource';
import { dummyDashboardStats, dummyChartData, dummyWeakAspects, dummySupervisions, dummyTeachers } from '../data/dummyDashboard';
import { mockDelay } from './mockDelay';

export const dashboardService = {
  async getDashboardData() {
    if (isApiMode()) {
      const response = await httpClient.get<any>('/dashboard');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard data');
    }
    
    // Fallback to dummy data
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
