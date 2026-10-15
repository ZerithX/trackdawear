import { z } from "zod";

export const categoryParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
