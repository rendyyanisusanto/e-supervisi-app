import { reactive } from 'vue';

const fieldErrors = reactive<Record<string, string[]>>({});

export const validationHelper = {
  /**
   * Sets validation errors from API response
   */
  setFieldErrors(errors: Record<string, string[]>): void {
    this.clearFieldErrors();
    Object.assign(fieldErrors, errors);
  },

  /**
   * Clears all validation errors
   */
  clearFieldErrors(): void {
    for (const key in fieldErrors) {
      delete fieldErrors[key];
    }
  },

  /**
   * Clears error for a specific field
   */
  clearFieldError(field: string): void {
    if (fieldErrors[field]) {
      delete fieldErrors[field];
    }
  },

  /**
   * Gets the first error message for a field
   */
  getFieldError(field: string): string {
    return fieldErrors[field] && fieldErrors[field].length > 0 ? fieldErrors[field][0] : '';
  },

  /**
   * Checks if a field has an error
   */
  hasFieldError(field: string): boolean {
    return !!fieldErrors[field] && fieldErrors[field].length > 0;
  },
  
  /**
   * Returns reactive errors object
   */
  getErrors() {
    return fieldErrors;
  }
};
