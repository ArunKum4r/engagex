import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { contacts } from "./contacts.js";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";
import { conversations } from "./conversations.js";

export const leads = pgTable("leads", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("NEW"),
    source: varchar("source", { length: 64 }),
    value: varchar("value", { length: 32 }),
    notes: text("notes"),
    conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    index("leads_workspace_id_idx").on(table.workspaceId),
    index("leads_contact_id_idx").on(table.contactId),
    index("leads_assigned_to_user_id_idx").on(table.assignedToUserId),
    index("leads_status_idx").on(table.status),
    index("leads_created_at_idx").on(table.createdAt),
  ],
);