import { isApiMode } from './dataSource';
import { endpoints } from './endpoints';
import httpClient from './httpClient';
import { mockDelay } from './mockDelay';
import { dummyUsers } from '../data/dummyUsers';
import type { LoginPayload, AuthResponseDto, AuthUserDto  } from '../types/dto/auth.dto';
import type { ApiResponse } from '../types/api';
import { setStorageItem, removeStorageItem, getStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/app';
import { AuthMapper } from '../mappers/authMapper';

class AuthService {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseDto>> {
    if (isApiMode()) {
      const response = await httpClient.post<ApiResponse<any>>(endpoints.auth.login, payload);
      const apiData = response.data.data;
      if (apiData) {
        const mappedData = AuthMapper.toAuthResponseDto(apiData);
        this.saveSession(mappedData);
        return {
          success: true,
          message: response.data.message,
          data: mappedData
        };
      }
      return response.data as any;
    }

    // Dummy Mode
    await mockDelay(1000);
    const usersList = Object.values(dummyUsers);
    const user = usersList.find(
      (u) => u.username === payload.username
    );

    // Dummy logic doesn't validate password properly from dummyUsers (since they don't have password field), just check if password is 'admin123'
    if (!user || payload.password !== 'admin123') {
      throw new Error('Username atau password salah');
    }

    const authUser: AuthUserDto = {
      id: parseInt(user.id), // Converting from string
      teacherId: parseInt(user.id),
      name: user.name,
      username: user.username,
      roles: [user.role], // Converting role to roles array
      avatar: user.avatar,
      position: user.position
    };

    const dummyResponse: AuthResponseDto = {
      user: authUser,
      accessToken: `dummy-token-${user.id}-${Date.now()}`
    };

    this.saveSession(dummyResponse);

    return {
      success: true,
      message: 'Login berhasil',
      data: dummyResponse
    };
  }

  async me(): Promise<ApiResponse<AuthUserDto>> {
    if (isApiMode()) {
      const response = await httpClient.get<ApiResponse<any>>(endpoints.auth.me);
      if (response.data.data) {
        const mappedUser = AuthMapper.toAuthUserDto(response.data.data);
        return {
          success: true,
          message: response.data.message,
          data: mappedUser
        };
      }
      return response.data as any;
    }

    // Dummy Mode
    await mockDelay(500);
    const user = getStorageItem<AuthUserDto | null>(STORAGE_KEYS.AUTH_USER, null);
    
    if (!user) {
      throw new Error('Sesi tidak valid atau telah berakhir');
    }

    return {
      success: true,
      message: 'Data user berhasil dimuat',
      data: user
    };
  }

  async updateProfile(formData: FormData): Promise<ApiResponse<AuthUserDto>> {
    if (isApiMode()) {
      const response = await httpClient.put<ApiResponse<any>>(endpoints.auth.me, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.data) {
        const mappedUser = AuthMapper.toAuthUserDto(response.data.data);
        const currentToken = getStorageItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
        const currentRefreshToken = getStorageItem<string | null>('refresh_token', null);
        // update local session
        this.saveSession({ user: mappedUser, accessToken: currentToken!, refreshToken: currentRefreshToken! });
        return {
          success: true,
          message: response.data.message,
          data: mappedUser
        };
      }
      return response.data as any;
    }

    // Dummy mode
    await mockDelay(500);
    throw new Error('Update profil belum didukung di mode dummy');
  }

  async logout(): Promise<ApiResponse<void>> {
    if (isApiMode()) {
      try {
        await httpClient.post(endpoints.auth.logout);
      } catch (e) {
        console.error('Logout API failed, continuing local logout');
      }
    } else {
      await mockDelay(500);
    }

    this.clearSession();
    return { success: true, message: 'Logout berhasil' };
  }

  private saveSession(data: AuthResponseDto) {
    setStorageItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken);
    if (data.refreshToken) {
        setStorageItem('refresh_token', data.refreshToken);
    }
    setStorageItem(STORAGE_KEYS.AUTH_USER, data.user);
  }

  private clearSession() {
    removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeStorageItem('refresh_token');
    removeStorageItem(STORAGE_KEYS.AUTH_USER);
  }
}

export const authService = new AuthService();
