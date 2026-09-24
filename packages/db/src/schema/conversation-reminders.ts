import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    varchar,
    text,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { users } from "./users.js";

export const conversationReminderStatusEnum = pgEnum(
    "conversation_reminder_status",
    [
        "PENDING",
        "COMPLETED",
        "CANCELLED",
    ],
);

export const conversationReminders = pgTable(
    "conversation_reminders",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        conversationId: uuid("conversation_id")
            .notNull()
            .references(() => conversations.id, {
                onDelete: "cascade",
            }),

        createdByUserId: uuid("created_by_user_id")
            .notNull()
            .references(() => users.id),

        title: varchar("title", {
            length: 255,
        }).notNull(),

        description: text("description"),

        remindAt: timestamp(
            "remind_at",
            {
                withTimezone: true,
            },
        ).notNull(),

        status: conversationReminderStatusEnum(
            "status",
        ).notNull().default("PENDING"),

        completedAt: timestamp(
            "completed_at",
            {
                withTimezone: true,
            },
        ),

        createdAt: timestamp(
            "created_at",
            {
                withTimezone: true,
            },
        ).defaultNow().notNull(),

        updatedAt: timestamp(
            "updated_at",
            {
                withTimezone: true,
            },
        ).defaultNow().notNull(),
    },
    (table) => [
        index(
            "conversation_reminders_conversation_idx",
        ).on(table.conversationId),

        index(
            "conversation_reminders_status_idx",
        ).on(table.status),

        index(
            "conversation_reminders_remind_at_idx",
        ).on(table.remindAt),
    ],
);