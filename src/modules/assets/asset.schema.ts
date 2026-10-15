import { z } from "zod";

export const assetStatuses = [
  "available",
  "borrowed",
  "maintenance",
  "retired",
] as const;

export const assetConditions = ["good", "minor_damage", "damaged"] as const;

export const assetParamsSchema = z.object({
  id: z.string().uuid(),
});

export const assetQuerySchema = z.object({
  status: z.enum(assetStatuses).optional(),
  categoryId: z.string().uuid().optional(),
});

export const createAssetSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(150),
  assetCode: z.string().trim().min(2).max(50).toUpperCase(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(assetStatuses).default("available"),
  condition: z.enum(assetConditions).default("good"),
});

export const updateAssetSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(150).optional(),
    assetCode: z.string().trim().min(2).max(50).toUpperCase().optional(),
    description: z.string().trim().max(500).optional(),
    status: z.enum(assetStatuses).optional(),
    condition: z.enum(assetConditions).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;
