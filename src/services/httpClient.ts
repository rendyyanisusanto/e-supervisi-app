import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { getStorageItem, removeStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/app';
import { getApiErrorMessage } from '../utils/apiError';

const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStorageItem<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle standard API errors
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Unauthorized - clear session and redirect to login
        removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
        removeStorageItem(STORAGE_KEYS.AUTH_USER);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Forbidden - redirect to forbidden page or show error
        // window.location.href = '/forbidden'; // Adjust as needed
        console.error('Forbidden access:', getApiErrorMessage(error));
      } else if (status >= 500) {
        // Server Error
        console.error('Server error:', getApiErrorMessage(error));
      }
    } else if (error.request) {
      // Network error or timeout
      console.error('Network error:', error.message);
    }
    
    // Pass the error back to the caller
    return Promise.reject(error);
  }
);

export default httpClient;
