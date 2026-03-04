/**
 * API Error handling utilities
 * Centralized error types and error handling functions
 */

import type { AxiosError } from "axios";

/**
 * Custom API error class
 * Extends Error with status code and response data
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number,
    responseData?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.responseData = responseData;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Network error class
 * For network-related errors (timeout, connection issues)
 */
export class NetworkError extends Error {
  constructor(message: string = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Check if error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Extract error message from various error types
 * @param error - Error object (AxiosError, ApiError, Error, or unknown)
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (isAxiosError(error)) {
    // Try to extract error message from response
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === "object" && data !== null) {
        if ("error" in data && typeof data.error === "string") {
          return data.error;
        }
        if ("message" in data && typeof data.message === "string") {
          return data.message;
        }
      }
      if (typeof data === "string") {
        return data;
      }
    }

    // Network errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Request timeout. Please try again.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection.";
    }

    // HTTP status code messages
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return "Invalid request. Please check your input.";
        case 401:
          return "Unauthorized. Please log in again.";
        case 403:
          return "Access forbidden.";
        case 404:
          return "Resource not found.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return `Error ${error.response.status}: ${error.message}`;
      }
    }

    return error.message || "An unexpected error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

/**
 * Create ApiError from AxiosError
 */
export function createApiError(error: AxiosError): ApiError {
  const message = getErrorMessage(error);
  const statusCode = error.response?.status || 500;
  const responseData = error.response?.data;

  return new ApiError(message, statusCode, responseData);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return (
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    );
  }
  return error instanceof NetworkError;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 401;
  }
  if (isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

