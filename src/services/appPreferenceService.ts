import { dummyAppPreferences } from '../data/dummyAppPreferences';
import type { AppPreference } from '../types/appPreference';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiResponse } from '../types/api';
import type { UpdateAppPreferencePayload } from '../types/dto/settings.dto';
import { SettingMapper } from '../mappers/settingMapper';

// Local state for dummy mode
let preferences = { ...dummyAppPreferences };

export const appPreferenceService = {
  async getPreferences(): Promise<ApiResponse<AppPreference>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.settings.appPreference);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.appPreferenceToFrontend(response.data.data)
      };
    }

    await mockDelay(300);
    return {
      success: true,
      message: 'Preferensi sistem berhasil dimuat',
      data: preferences
    };
  },
  
  async updatePreferences(payload: UpdateAppPreferencePayload): Promise<ApiResponse<AppPreference>> {
    if (isApiMode()) {
      const apiPayload = SettingMapper.appPreferenceToApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(endpoints.settings.appPreference, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.appPreferenceToFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    preferences = { ...preferences, ...payload } as AppPreference;
    
    return {
      success: true,
      message: 'Preferensi sistem berhasil diperbarui',
      data: preferences
    };
  }
};
