import { pgTable, uuid, timestamp, index, unique } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { users } from "./users.js";
export const conversationParticipants = pgTable("conversation_participants", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("conversation_participants_conversation_user_unique").on(table.conversationId, table.userId),
    index("conversation_participants_user_id_idx").on(table.userId),
    index("conversation_participants_conversation_id_idx").on(table.conversationId),
]);
