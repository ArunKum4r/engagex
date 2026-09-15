import { pgTable, uuid, varchar, timestamp, index, unique, integer } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { contacts } from "./contacts.js";
import { platformAccounts } from "./platform-accounts.js";
import { users } from "./users.js";

export const conversations = pgTable("conversations", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
    platformAccountId: uuid("platform_account_id").notNull().references(() => platformAccounts.id, { onDelete: "restrict" }),
    externalConversationId: varchar("external_conversation_id", {length: 255}),
    status: varchar("status", { length: 32 }).notNull().default("OPEN"),
    lastMessageAt: timestamp("last_message_at", {withTimezone: true}),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    unreadCount: integer("unread_count").notNull().default(0),
    closedAt: timestamp("closed_at", {withTimezone: true}),
    createdAt: timestamp("created_at", {withTimezone: true}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {withTimezone: true}).notNull().defaultNow(),
  },
  (table) => [
    index("conversations_workspace_id_idx").on(table.workspaceId),
    index("conversations_contact_id_idx").on(table.contactId),
    index("conversations_platform_account_id_idx").on(table.platformAccountId),
    index("conversations_status_idx").on(table.status),
    index("conversations_last_message_at_idx").on(table.lastMessageAt),
    unique("conversations_platform_external_unique").on(table.platformAccountId, table.externalConversationId),
  ],
);