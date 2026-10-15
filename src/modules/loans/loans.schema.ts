import { z } from "zod";

export const loanParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createLoanSchema = z.object({
  userId: z.string().uuid(),
  assetId: z.string().uuid(),
  dueAt: z.coerce.date().refine((value) => value > new Date(), {
    message: "dueAt must be in the future",
  }),
});

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const loanQuerySchema = z.object({
  active: booleanQuery,
  overdue: booleanQuery,
  userId: z.string().uuid().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type LoanQuery = z.infer<typeof loanQuerySchema>;
