import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

/**
 * Extracts a safe error message from an API response or generic error
 */
export const getApiErrorMessage = (error: unknown, defaultMessage = 'Terjadi kesalahan pada sistem'): string => {
  if (isAxiosError(error)) {
    // Check if we have a standard API error response
    if (error.response?.data) {
      const data = error.response.data as ApiErrorResponse;
      if (data.message) {
        return data.message;
      }
    }
    
    // Fallback to axios error message or standard http error based on status
    if (error.response?.status === 404) return 'Data tidak ditemukan';
    if (error.response?.status === 500) return 'Terjadi kesalahan pada server';
    if (error.response?.status === 403) return 'Anda tidak memiliki akses';
    
    return error.message || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Type guard for Axios errors
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError === true;
};

/**
 * Checks if the error is a validation error (usually 422 Unprocessable Entity or 400 Bad Request with validation details)
 */
export const isValidationError = (error: unknown): boolean => {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return !!data.errors && Object.keys(data.errors).length > 0;
  }
  return false;
};

/**
 * Gets validation errors mapped by field name
 */
export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    if (data.errors) {
      return data.errors;
    }
  }
  return {};
};
