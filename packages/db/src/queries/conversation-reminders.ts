import { asc, eq } from "drizzle-orm";
import { db } from "../client.js";
import { conversationReminders } from "../schema/conversation-reminders.js";

export async function createConversationReminder(
    data: {
        conversationId: string;
        createdByUserId: string;
        title: string;
        description?: string | null;
        remindAt: Date;
    },
) {
    const rows = await db.insert(
        conversationReminders,
    )
        .values({
            conversationId: data.conversationId,
            createdByUserId:
                data.createdByUserId,
            title: data.title,
            description:
                data.description ?? null,
            remindAt: data.remindAt,
        })
        .returning();

    return rows[0];
}

export async function findConversationReminders(
    conversationId: string,
) {
    return db.select()
        .from(conversationReminders)
        .where(
            eq(
                conversationReminders.conversationId,
                conversationId,
            ),
        )
        .orderBy(
            asc(
                conversationReminders.remindAt,
            ),
        );
}

export async function findConversationReminderById(
    reminderId: string,
) {
    const rows = await db.select()
        .from(conversationReminders)
        .where(
            eq(
                conversationReminders.id,
                reminderId,
            ),
        )
        .limit(1);

    return rows[0] ?? null;
}

export async function completeConversationReminder(
    reminderId: string,
) {
    const rows = await db.update(
        conversationReminders,
    )
        .set({
            status: "COMPLETED",
            completedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(
            eq(
                conversationReminders.id,
                reminderId,
            ),
        )
        .returning();

    return rows[0] ?? null;
}

export async function cancelConversationReminder(
    reminderId: string,
) {
    const rows = await db.update(
        conversationReminders,
    )
        .set({
            status: "CANCELLED",
            updatedAt: new Date(),
        })
        .where(
            eq(
                conversationReminders.id,
                reminderId,
            ),
        )
        .returning();

    return rows[0] ?? null;
}

export async function deleteConversationReminder(
    reminderId: string,
) {
    const rows = await db.delete(
        conversationReminders,
    )
        .where(
            eq(
                conversationReminders.id,
                reminderId,
            ),
        )
        .returning();

    return rows[0] ?? null;
}