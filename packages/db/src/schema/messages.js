import { pgTable, uuid, varchar, text, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { contacts } from "./contacts.js";
import { users } from "./users.js";
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderContactId: uuid("sender_contact_id").references(() => contacts.id, { onDelete: "set null" }),
    senderUserId: uuid("sender_user_id").references(() => users.id, { onDelete: "set null" }),
    direction: varchar("direction", { length: 16 }).notNull(),
    type: varchar("type", { length: 32 }).notNull().default("TEXT"),
    content: text("content"),
    externalMessageId: varchar("external_message_id", { length: 255 }),
    source: varchar("source", { length: 32 }).notNull().default("PLATFORM"),
    metadata: jsonb("metadata").$type().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    index("messages_sender_contact_id_idx").on(table.senderContactId),
    index("messages_sender_user_id_idx").on(table.senderUserId),
    index("messages_created_at_idx").on(table.createdAt),
    index("messages_external_message_id_idx").on(table.externalMessageId),
    unique("messages_conversation_external_unique").on(table.conversationId, table.externalMessageId),
]);
