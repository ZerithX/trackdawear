import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { errorResponse, successResponse } from "../../shared/response";
import { createLoanSchema, loanParamsSchema, loanQuerySchema } from "./loans.schema";
import { loanService } from "./loans.service";

export const loanRoute = new Hono();

loanRoute.post(
  "/",
  zValidator("json", createLoanSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid request body", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const input = c.req.valid("json");
    const loan = await loanService.create(input);
    return c.json(successResponse(loan), 201);
  },
);

loanRoute.get(
  "/",
  zValidator("query", loanQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid query parameters", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const query = c.req.valid("query");
    const loans = await loanService.list(query);
    return c.json(successResponse(loans));
  },
);

loanRoute.post(
  "/:id/return",
  zValidator("param", loanParamsSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse("VALIDATION_ERROR", "Invalid loan id", result.error.issues),
        400,
      );
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const loan = await loanService.returnLoan(id);
    return c.json(successResponse(loan));
  },
);
