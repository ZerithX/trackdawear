import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { users } from "./users";

export const loans = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "restrict" }),
  borrowedAt: timestamp("borrowed_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
