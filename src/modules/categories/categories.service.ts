import { desc, eq, ilike } from "drizzle-orm";
import { db } from "../../db/client";
import { categories } from "../../db/schema";
import { ConflictError, NotFoundError } from "../../shared/error";
import type { CreateCategoryInput } from "./categories.schema";

export const categoryService = {
  async create(input: CreateCategoryInput) {
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(ilike(categories.name, input.name))
      .limit(1);

    if (existingCategory) {
      throw new ConflictError(
        "CATEGORY_ALREADY_EXISTS",
        "Category name already exists",
      );
    }

    const [category] = await db.insert(categories).values(input).returning();
    return category;
  },

  async list() {
    return db.select().from(categories).orderBy(desc(categories.createdAt));
  },

  async getById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      throw new NotFoundError("CATEGORY_NOT_FOUND", "Category was not found");
    }

    return category;
  },
};
