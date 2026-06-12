import { dummySchoolProfile } from '../data/dummySchoolProfile';
import type { SchoolProfile } from '../types/setting';
import { mockDelay } from './mockDelay';
import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import type { ApiResponse } from '../types/api';
import type { UpdateSchoolProfilePayload } from '../types/dto/setting.dto';
import { SettingMapper } from '../mappers/settingMapper';

// Local state for dummy mode
let profile = { ...dummySchoolProfile };

export const schoolProfileService = {
  async getProfile(): Promise<ApiResponse<SchoolProfile>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.settings.schoolProfile);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.profileToFrontend(response.data.data)
      };
    }

    await mockDelay(300);
    return {
      success: true,
      message: 'Profil sekolah berhasil dimuat',
      data: profile
    };
  },
  
  async updateProfile(payload: UpdateSchoolProfilePayload): Promise<ApiResponse<SchoolProfile>> {
    if (isApiMode()) {
      const apiPayload = SettingMapper.profileToApiPayload(payload);
      const response = await httpClient.put<ApiResponse<any>>(endpoints.settings.schoolProfile, apiPayload);
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.profileToFrontend(response.data.data)
      };
    }

    await mockDelay(600);
    profile = { ...profile, ...payload } as SchoolProfile;
    
    return {
      success: true,
      message: 'Profil sekolah berhasil diperbarui',
      data: profile
    };
  },

  async uploadLogo(file: File): Promise<ApiResponse<SchoolProfile>> {
    if (isApiMode()) {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await httpClient.post<ApiResponse<any>>(endpoints.settings.schoolProfileLogo, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: SettingMapper.profileToFrontend(response.data.data)
      };
    }

    await mockDelay(1000);
    const mockLogoPath = URL.createObjectURL(file);
    profile.logo = mockLogoPath;

    return {
      success: true,
      message: 'Logo sekolah berhasil diupload (Dummy)',
      data: profile
    };
  }
};
