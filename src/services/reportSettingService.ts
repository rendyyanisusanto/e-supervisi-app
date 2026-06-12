import { dummyReportSettings } from '../data/dummyReportSettings';
import type { ReportSetting } from '../types/setting';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiResponse } from '../types/api';
import type { UpdateReportSettingPayload } from '../types/dto/setting.dto';
import { SettingMapper } from '../mappers/settingMapper';

// Local state for dummy mode
let settings = { ...dummyReportSettings };

export const reportSettingService = {
  async getSettings(): Promise<ApiResponse<ReportSetting>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.settings.reportSetting);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.reportSettingToFrontend(response.data.data)
      };
    }

    await mockDelay(300);
    return {
      success: true,
      message: 'Format laporan berhasil dimuat',
      data: settings
    };
  },
  
  async updateSettings(payload: UpdateReportSettingPayload): Promise<ApiResponse<ReportSetting>> {
    if (isApiMode()) {
      const apiPayload = SettingMapper.reportSettingToApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(endpoints.settings.reportSetting, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.reportSettingToFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    settings = { ...settings, ...payload } as ReportSetting;
    
    return {
      success: true,
      message: 'Format laporan berhasil diperbarui',
      data: settings
    };
  }
};
