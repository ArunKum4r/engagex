import { pgTable, uuid, varchar, text, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { platformAccounts } from "./platform-accounts.js";

export const webhookEvents = pgTable("webhook_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id,{ onDelete: "cascade" }),
    platformAccountId: uuid("platform_account_id").references(() => platformAccounts.id,{ onDelete: "set null" }),
    platform: varchar("platform", { length: 32 }).notNull(),
    eventType: varchar("event_type", { length: 128 }).notNull(),
    externalEventId: varchar("external_event_id", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("RECEIVED"),
    errorMessage: text("error_message"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
  },
  (table) => [
    unique("webhook_events_platform_account_event_unique").on(table.platformAccountId,table.externalEventId),
    index("webhook_events_workspace_id_idx").on(table.workspaceId),
    index("webhook_events_platform_account_id_idx").on(table.platformAccountId),
    index("webhook_events_event_type_idx").on(table.eventType),
    index("webhook_events_status_idx").on(table.status),
    index("webhook_events_received_at_idx").on(table.receivedAt),
  ],
);