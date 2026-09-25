import {
    index,
    jsonb,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { automations } from "./automations.js";
import { webhookEvents } from "./webhook-events.js";

export const automationExecutions = pgTable("automation_executions", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: "restrict" }),
    webhookEventId: uuid("webhook_event_id").references(() => webhookEvents.id, { onDelete: "set null" }),
    contactId: uuid("contact_id"),
    conversationId: uuid("conversation_id"),
    currentStepId: uuid("current_step_id"),
    status: varchar("status", { length: 32 }).notNull().default("PENDING"),
    input: jsonb("input"),
    output: jsonb("output"),
    errorMessage: varchar("error_message", { length: 2000 }),
    resumeAt: timestamp("resume_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
    index("automation_executions_workspace_idx").on(table.workspaceId),
    index("automation_executions_automation_idx").on(table.automationId),
    index("automation_executions_webhook_event_idx").on(table.webhookEventId),
    index("automation_executions_contact_idx").on(table.contactId),
    index("automation_executions_conversation_idx").on(table.conversationId),
    index("automation_executions_status_idx").on(table.status),
    index("automation_executions_resume_at_idx").on(table.resumeAt),
    index("automation_executions_current_step_idx").on(table.currentStepId),
]);