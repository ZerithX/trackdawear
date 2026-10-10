import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status_type", [
    'available',
    'borrowed',
    'maintenance',
    'retired'
]);

export const conditionEnum = pgEnum("condition_type", [
    'good',
    'minor_damage',
    'broken'
]);

export const assetsSchema = pgTable("assets", {
    id: uuid("id").defaultRandom().primaryKey(),    
    name: varchar("name", { length: 255 }).notNull(),
    assetCode: varchar("asset_code", { length: 16 }).unique().notNull(),
    description: text("description"),
    status: statusEnum(),
    condition: conditionEnum(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
});