import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { messages } from "./messages.js";
export const messageAttachments = pgTable("message_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    url: text("url"),
    mimeType: varchar("mime_type", { length: 128 }),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: varchar("file_size", { length: 32 }),
    externalId: varchar("external_id", { length: 255 }),
    metadata: jsonb("metadata").$type().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("message_attachments_message_id_idx").on(table.messageId),
    index("message_attachments_external_id_idx").on(table.externalId),
]);
