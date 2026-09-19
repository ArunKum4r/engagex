import { pgTable, uuid, varchar, jsonb, timestamp, unique, index } from "drizzle-orm/pg-core";

export const platforms = pgTable("platforms", {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 32 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("platforms_key_unique").on(table.key),
    index("platforms_status_idx").on(table.status),
]);