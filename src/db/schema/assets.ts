import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const assetStatusEnum = pgEnum("asset_status", [
  "available",
  "borrowed",
  "maintenance",
  "retired",
]);

export const assetConditionEnum = pgEnum("asset_condition", [
  "good",
  "minor_damage",
  "damaged",
]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 150 }).notNull(),
  assetCode: varchar("asset_code", { length: 50 }).notNull().unique(),
  description: text("description"),
  status: assetStatusEnum().default("available").notNull(),
  condition: assetConditionEnum().default("good").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
