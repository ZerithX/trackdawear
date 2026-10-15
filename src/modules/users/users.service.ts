import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { ConflictError } from "../../shared/error";
import type { CreateUserInput } from "./users.schema";

export const userService = {
  async create(input: CreateUserInput) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictError("EMAIL_ALREADY_EXISTS", "Email is already registered");
    }

    const [user] = await db.insert(users).values(input).returning();
    return user;
  },

  async list() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  },
};
