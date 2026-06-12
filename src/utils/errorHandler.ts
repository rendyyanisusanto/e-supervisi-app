import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else {
      // Something happened in setting up the request that triggered an Error
      return error.message || 'Terjadi kesalahan pada sistem.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
};

export const handleServiceError = (error: unknown): never => {
  console.error('[Service Error]', error);
  const message = getErrorMessage(error);
  throw new Error(message);
};
