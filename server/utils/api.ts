import type { ApiResponse } from "../../types/admin";

export function ok<T>(data: T, status = 200): ApiResponse<T> {
  return {
    Data: data,
    Error: null,
    status
  };
}

export function fail(error: string | Record<string, unknown>, status = 400): ApiResponse<never> {
  return {
    Data: null,
    Error: error,
    status
  };
}
