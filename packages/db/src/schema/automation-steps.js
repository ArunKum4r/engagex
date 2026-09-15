import { pgTable, uuid, varchar, jsonb, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { automations } from "./automations.js";
export const automationSteps = pgTable("automation_steps", {
    id: uuid("id").defaultRandom().primaryKey(),
    automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    position: integer("position").notNull().default(0),
    config: jsonb("config").$type().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("automation_steps_automation_id_id_unique").on(table.automationId, table.id),
    index("automation_steps_automation_id_idx").on(table.automationId),
    index("automation_steps_type_idx").on(table.type),
]);
