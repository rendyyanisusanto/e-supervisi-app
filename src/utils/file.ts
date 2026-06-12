/**
 * Validate if the file is an allowed image type
 */
export const isAllowedImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

/**
 * Validates an image file (type and max size)
 * @param file The file to validate
 * @param maxSizeMB Maximum size in MB
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File, maxSizeMB: number = 2): string | null => {
  if (!isAllowedImageType(file)) {
    return 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.';
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`;
  }

  return null;
};

/**
 * Converts a File object to Base64 string for preview
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Returns a human-readable file size label
 */
export const getFileSizeLabel = (sizeInBytes: number): string => {
  if (sizeInBytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
