import { pgTable, uuid, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { customFields } from "./custom-fields.js";
export const customFieldValues = pgTable("custom_field_values", {
    id: uuid("id").defaultRandom().primaryKey(),
    fieldId: uuid("field_id").notNull().references(() => customFields.id, { onDelete: "cascade" }),
    entityId: uuid("entity_id").notNull(),
    value: text("value"),
    createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, }).notNull().defaultNow(),
}, (table) => [
    unique("custom_field_values_field_entity_unique").on(table.fieldId, table.entityId),
    index("custom_field_values_field_id_idx").on(table.fieldId),
    index("custom_field_values_entity_id_idx").on(table.entityId),
]);
