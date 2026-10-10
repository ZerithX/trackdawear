import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { assetsSchema } from "./assets";
import { userTable } from "./users";

export const loansSchema = pgTable("loans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("id")
    .notNull()
    .references(() => userTable.id, { onDelete: "restrict" }),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assetsSchema.id, { onDelete: "restrict" }),
  borrowedAt: timestamp("borrowed_at", { withTimezone: true }).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true}).notNull(),
  returnedAt: timestamp("returned_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull()  
});

/*
id           UUID primary key
user_id      UUID foreign key → users.id
asset_id     UUID foreign key → assets.id
borrowed_at  timestamptz
due_at       timestamptz
returned_at  timestamptz, nullable
created_at   timestamptz
*/
