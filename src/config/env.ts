import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.
    enum(["dev", "test", "prod"]).
    default("dev"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  DATABASE_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
