import type { ErrorHandler } from "hono";
import { AppError } from "../shared/error";
import { errorResponse } from "../shared/response";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof AppError) {
    return c.json(
      errorResponse(error.code, error.message, error.details),
      error.statusCode as 400 | 404 | 409,
    );
  }

  console.error(error);

  return c.json(
    errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"),
    500,
  );
};
