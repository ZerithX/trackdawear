import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const categoriesSchema = pgTable("categories", {
    id: uuid("id").defaultRandom().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
})