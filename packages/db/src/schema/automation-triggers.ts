import { pgTable, uuid, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { automations } from "./automations.js";

export const automationTriggers = pgTable("automation_triggers", {
    id: uuid("id").defaultRandom().primaryKey(),
    entryStepId: uuid("entry_step_id"),
    automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("automation_triggers_automation_id_idx").on(table.automationId),
    index("automation_triggers_type_idx").on(table.type),
  ],
);