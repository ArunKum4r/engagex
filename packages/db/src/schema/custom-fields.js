import { pgTable, uuid, varchar, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
export const customFields = pgTable("custom_fields", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    key: varchar("key", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    fieldType: varchar("field_type", { length: 32 }).notNull(),
    config: jsonb("config").$type().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, }).notNull().defaultNow(),
}, (table) => [
    unique("custom_fields_workspace_key_unique").on(table.workspaceId, table.key),
    index("custom_fields_workspace_id_idx").on(table.workspaceId),
    index("custom_fields_entity_type_idx").on(table.entityType),
]);
