export function successResponse<T>(data: T): { data: T } {
  return { data };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
): {
  error: { code: string; message: string; details?: unknown };
} {
  return {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}
