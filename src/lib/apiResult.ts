export interface ApiResult<T = unknown> {
  data: T;
  error: {
    message?: string;
    status?: number;
    kind?: string;
  } | null;
}

export function unwrapApiResult<T>(result: ApiResult<T> | null | undefined): T {
  if (result?.error) {
    throw result.error;
  }

  return (result?.data ?? null) as T;
}