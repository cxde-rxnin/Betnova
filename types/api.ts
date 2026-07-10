export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  errors?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
