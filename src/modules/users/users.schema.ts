import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).toLowerCase(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
