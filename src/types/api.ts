/**
 * Standard API Response for a single entity or operation
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Standard Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard API Response for a list of entities with pagination
 */
export interface ApiListResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Standard Query Parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Allow additional specific filters like status, periodId, etc.
}

/**
 * Base Select Option Type
 */
export interface SelectOption {
  label: string;
  value: string | number;
}
