/**
 * API Client exports
 * Centralized export point for API client and utilities
 */

export { apiClient, type ApiResponse } from "./client";
export { API_ENDPOINTS, type ApiEndpoint } from "./endpoints";
export {
  ApiError,
  NetworkError,
  getErrorMessage,
  isAuthError,
  isNetworkError,
  isAxiosError,
  createApiError,
} from "./errors";
export {
  isAllowedOrigin,
  getAllowedOrigin,
  createCorsHeaders,
  handleCorsPreflight,
} from "./cors";

