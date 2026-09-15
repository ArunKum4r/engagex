import { pgTable, uuid, varchar, jsonb, text, timestamp, index } from "drizzle-orm/pg-core";
import { automations } from "./automations.js";
import { webhookEvents } from "./webhook-events.js";
export const automationExecutions = pgTable("automation_executions", {
    id: uuid("id").defaultRandom().primaryKey(),
    automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: "restrict" }),
    webhookEventId: uuid("webhook_event_id").references(() => webhookEvents.id, { onDelete: "set null" }),
    status: varchar("status", { length: 32 }).notNull().default("PENDING"),
    input: jsonb("input"),
    output: jsonb("output"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("automation_executions_automation_id_idx").on(table.automationId),
    index("automation_executions_webhook_event_id_idx").on(table.webhookEventId),
    index("automation_executions_status_idx").on(table.status),
    index("automation_executions_created_at_idx").on(table.createdAt),
]);
