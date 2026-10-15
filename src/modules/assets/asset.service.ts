import { and, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../db/client";
import { assets, categories } from "../../db/schema";
import { BadRequestError, ConflictError, NotFoundError } from "../../shared/error";
import type {
  AssetQuery,
  CreateAssetInput,
  UpdateAssetInput,
} from "./asset.schema";

async function ensureCategoryExists(categoryId: string): Promise<void> {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    throw new NotFoundError("CATEGORY_NOT_FOUND", "Category was not found");
  }
}

export const assetService = {
  async create(input: CreateAssetInput) {
    await ensureCategoryExists(input.categoryId);

    const [existingAsset] = await db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.assetCode, input.assetCode))
      .limit(1);

    if (existingAsset) {
      throw new ConflictError(
        "ASSET_CODE_ALREADY_EXISTS",
        "Asset code already exists",
      );
    }

    const [asset] = await db.insert(assets).values(input).returning();
    return asset;
  },

  async list(query: AssetQuery) {
    const conditions: SQL[] = [];

    if (query.status) {
      conditions.push(eq(assets.status, query.status));
    }

    if (query.categoryId) {
      conditions.push(eq(assets.categoryId, query.categoryId));
    }

    return db
      .select({
        id: assets.id,
        assetCode: assets.assetCode,
        name: assets.name,
        description: assets.description,
        status: assets.status,
        condition: assets.condition,
        category: {
          id: categories.id,
          name: categories.name,
        },
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
      })
      .from(assets)
      .innerJoin(categories, eq(assets.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(assets.createdAt));
  },

  async getById(id: string) {
    const [asset] = await db
      .select({
        id: assets.id,
        assetCode: assets.assetCode,
        name: assets.name,
        description: assets.description,
        status: assets.status,
        condition: assets.condition,
        category: {
          id: categories.id,
          name: categories.name,
        },
        createdAt: assets.createdAt,
        updatedAt: assets.updatedAt,
      })
      .from(assets)
      .innerJoin(categories, eq(assets.categoryId, categories.id))
      .where(eq(assets.id, id))
      .limit(1);

    if (!asset) {
      throw new NotFoundError("ASSET_NOT_FOUND", "Asset was not found");
    }

    return asset;
  },

  async update(id: string, input: UpdateAssetInput) {
    const [currentAsset] = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);

    if (!currentAsset) {
      throw new NotFoundError("ASSET_NOT_FOUND", "Asset was not found");
    }

    if (input.status === "borrowed") {
      throw new BadRequestError(
        "INVALID_ASSET_STATUS",
        "Borrowed status can only be set by creating a loan",
      );
    }

    if (currentAsset.status === "borrowed" && input.status) {
      throw new ConflictError(
        "ASSET_HAS_ACTIVE_LOAN",
        "Return the active loan before changing the asset status",
      );
    }

    if (input.categoryId) {
      await ensureCategoryExists(input.categoryId);
    }

    if (input.assetCode) {
      const [duplicate] = await db
        .select({ id: assets.id })
        .from(assets)
        .where(eq(assets.assetCode, input.assetCode))
        .limit(1);

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "ASSET_CODE_ALREADY_EXISTS",
          "Asset code already exists",
        );
      }
    }

    const [asset] = await db
      .update(assets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();

    return asset;
  },
};
